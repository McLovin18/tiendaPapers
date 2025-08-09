'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Definir tipos de roles
export type UserRole = 'admin' | 'delivery' | 'client';

interface RoleContextType {
  role: UserRole;
  isAdmin: boolean;
  isDelivery: boolean;
  isClient: boolean;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

// Solo admin hardcodeado (el único que no se maneja dinámicamente)
const ADMIN_EMAIL = 'hectorcobea03@gmail.com';

// 🔧 Función para detectar rol desde Firebase
const detectUserRoleFromFirebase = async (email: string): Promise<UserRole> => {
  try {
    const normalizedEmail = email.toLowerCase();
    
    // 1. Verificar si es admin (hardcodeado)
    if (normalizedEmail === ADMIN_EMAIL) {
      return 'admin';
    }

    // 2. Verificar en deliveryUsers collection (dinámico)
    const deliveryDoc = await getDoc(doc(db, 'deliveryUsers', normalizedEmail));
    if (deliveryDoc.exists() && deliveryDoc.data().active !== false) {
      return 'delivery';
    }

    // 3. Verificar en users collection como fallback
    const userDoc = await getDoc(doc(db, 'users', normalizedEmail));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'admin') return 'admin';
      if (userData.role === 'delivery' || userData.isDelivery) return 'delivery';
    }

    return 'client';
  } catch (error) {
    console.log('Error checking Firebase roles:', error);
    
    // Fallback solo para admin
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL) return 'admin';
    return 'client';
  }
};

// 🔧 Función para obtener datos de delivery desde Firebase
const getDeliveryDataFromFirebase = async (email: string) => {
  try {
    const deliveryDoc = await getDoc(doc(db, 'deliveryUsers', email.toLowerCase()));
    if (deliveryDoc.exists()) {
      const data = deliveryDoc.data();
      return {
        role: 'delivery' as UserRole,
        isDelivery: true,
        deliveryZones: data.zones || ['general'],
        name: data.name,
        phone: data.phone
      };
    }
  } catch (error) {
    console.log('Error getting delivery data from Firebase:', error);
  }

  // Fallback básico
  return {
    role: 'delivery' as UserRole,
    isDelivery: true,
    deliveryZones: ['general']
  };
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      setLoading(true);
      
      if (user?.email) {
        try {
          const detectedRole = await detectUserRoleFromFirebase(user.email);
          
          console.log(`🎯 Rol detectado para ${user.email}: ${detectedRole}`);
          setRole(detectedRole);
          
          // Auto-asignar datos de delivery en localStorage
          if (detectedRole === 'delivery') {
            const currentUserData = localStorage.getItem('user');
            try {
              const userData = currentUserData ? JSON.parse(currentUserData) : {};
              
              if (!userData.role || userData.role !== 'delivery' || !userData.isDelivery) {
                const deliveryData = await getDeliveryDataFromFirebase(user.email);
                const updatedData = {
                  ...userData,
                  email: user.email,
                  ...deliveryData
                };
                
                localStorage.setItem('user', JSON.stringify(updatedData));
                console.log('✅ Datos de delivery actualizados desde Firebase:', updatedData);
              }
            } catch (error) {
              console.log('Error actualizando localStorage:', error);
            }
          }
          
          setLoading(false);
          return;
        } catch (error) {
          console.log('Error checking Firebase roles:', error);
        }
      }
      
      // Verificar localStorage como fallback
      const userDataFromStorage = localStorage.getItem('user');
      if (userDataFromStorage) {
        try {
          const userData = JSON.parse(userDataFromStorage);
          if (userData.role === 'delivery' || userData.isDelivery) {
            console.log('🚚 Rol delivery desde localStorage');
            setRole('delivery');
            setLoading(false);
            return;
          }
          if (userData.role === 'admin') {
            console.log('👨‍💼 Rol admin desde localStorage');
            setRole('admin');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Error parseando localStorage:', error);
        }
      }
      
      setRole('client');
      setLoading(false);
    };

    checkUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isDelivery = role === 'delivery';
  const isClient = role === 'client';

  return (
    <RoleContext.Provider value={{ role, isAdmin, isDelivery, isClient, loading }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
