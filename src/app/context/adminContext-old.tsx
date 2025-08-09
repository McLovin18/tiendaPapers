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
    'hectorcobea03@gmail.com' // Admin principal
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
      
      // � BYPASS TEMPORAL PARA TESTING - FORZAR ROL DELIVERY
      const testEmail = 'hwcobena@espol.edu.ec';
      if (user?.email === testEmail) {
        console.log('🚨 BYPASS: Forzando rol delivery para', testEmail);
        setRole('delivery');
        setLoading(false);
        return;
      }
      
      // �🔧 PRIMERO: Verificar localStorage (para casos de bypass/testing)
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
      
      // 🔧 SEGUNDO: Verificar emails hardcodeados (método original)
      if (user?.email) {
        const userEmail = user.email.toLowerCase();
        
        // Verificar si es admin
        if (USER_ROLES.admin.includes(userEmail)) {
          setRole('admin');
        }
        // Verificar si es delivery
        else if (USER_ROLES.delivery.includes(userEmail)) {
          setRole('delivery');
        }
        // Por defecto es cliente
        else {
          setRole('client');
        }
      } else {
        setRole('client');
      }
      
      setLoading(false);
    };

    checkUserRole();
  }, [user]);

  const isAdmin = role === 'admin';
  const isDelivery = role === 'delivery';
  const isClient = role === 'client';

  return (
    <RoleContext.Provider value={{ 
      role, 
      isAdmin, 
      isDelivery, 
      isClient, 
      loading 
    }}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook para usar el contexto de roles
export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Hook de compatibilidad para mantener código existente
export const useAdmin = () => {
  const { isAdmin, loading } = useRole();
  return { isAdmin, loading };
};