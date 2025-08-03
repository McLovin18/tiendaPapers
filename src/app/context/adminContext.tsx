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
    'hwcobena@espol.edu.ec',  //Cuenta de delivery real
    'nexel2024@outlook.com'    //Cuenta de delivery real
  ] as string[]
};

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = () => {
      setLoading(true);
      
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