'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

// Lista de emails con roles específicos
const USER_ROLES = {
  admin: [
    'hectorcobea03@gmail.com', // Admin principal
    "tiffanysvariedades@gmail.com", // Admin secundario
    "lucilaaquino79@gmail.com"
  ],
  delivery: [
    'hwcobena@espol.edu.ec',  // Cuenta de delivery real
    'nexel2024@outlook.com'   // Cuenta de delivery real
  ] as string[]
};

// 🔧 Función para detectar rol automáticamente
const detectUserRole = (email: string): UserRole => {
  const normalizedEmail = email.toLowerCase();
  
  if (USER_ROLES.admin.includes(normalizedEmail)) {
    return 'admin';
  }
  
  if (USER_ROLES.delivery.includes(normalizedEmail)) {
    return 'delivery';
  }
  
  return 'client';
};

// 🔧 Función para asignar datos de delivery automáticamente
const getDeliveryData = (email: string, role: UserRole) => {
  if (role === 'delivery') {
    return {
      role: 'delivery' as UserRole,
      isDelivery: true,
      deliveryZones: ['guayaquil-general', 'guayaquil-centro', 'guayaquil-norte', 'guayaquil-urdesa']
    };
  }
  return { role };
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = () => {
      setLoading(true);
      
      // 🔧 PRIORIDAD 1: Verificar email del usuario autenticado
      if (user?.email) {
        const detectedRole = detectUserRole(user.email);
        
        if (detectedRole !== 'client') {
          console.log(`🎯 Rol automático detectado para ${user.email}: ${detectedRole}`);
          setRole(detectedRole);
          
          // 🔧 AUTO-ASIGNAR datos de delivery en localStorage si no existen
          if (detectedRole === 'delivery') {
            const currentUserData = localStorage.getItem('user');
            try {
              const userData = currentUserData ? JSON.parse(currentUserData) : {};
              
              // Solo actualizar si no tiene rol asignado o es incorrecto
              if (!userData.role || userData.role !== 'delivery' || !userData.isDelivery) {
                const deliveryData = {
                  ...userData,
                  email: user.email,
                  ...getDeliveryData(user.email, detectedRole)
                };
                
                localStorage.setItem('user', JSON.stringify(deliveryData));
                console.log('✅ Datos de delivery auto-asignados:', deliveryData);
              }
            } catch (error) {
              console.log('Error actualizando localStorage:', error);
            }
          }
          
          setLoading(false);
          return;
        }
      }
      
      // 🔧 PRIORIDAD 2: Verificar localStorage (para casos de persistencia)
      const userDataFromStorage = localStorage.getItem('user');
      if (userDataFromStorage) {
        try {
          const userData = JSON.parse(userDataFromStorage);
          if (userData.role === 'delivery' || userData.isDelivery) {
            console.log('🚚 Rol delivery detectado desde localStorage');
            setRole('delivery');
            setLoading(false);
            return;
          }
          if (userData.role === 'admin') {
            console.log('👨‍💼 Rol admin detectado desde localStorage');
            setRole('admin');
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Error parseando localStorage user data:', error);
        }
      }
      
      // 🔧 PRIORIDAD 3: Rol por defecto
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
