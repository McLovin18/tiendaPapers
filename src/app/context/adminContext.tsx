'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Lista de emails de administradores (en producción esto debería estar en la base de datos)
const ADMIN_EMAILS = [
  'hectorcobea03@gmail.com' // Solo el administrador principal
];

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      setLoading(true);
      
      if (user?.email) {
        // Verificar si el email del usuario está en la lista de admins
        const adminStatus = ADMIN_EMAILS.includes(user.email.toLowerCase());
        setIsAdmin(adminStatus);
        
        // Log para debugging (remover en producción)
        console.log('Admin check:', { 
          userEmail: user.email, 
          isAdmin: adminStatus,
          adminEmails: ADMIN_EMAILS 
        });
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    checkAdminStatus();
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};