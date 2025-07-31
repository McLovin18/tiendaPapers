'use client';

import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Importar los scripts de Bootstrap de forma dinámica en el cliente
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <AuthProvider>
      <AdminProvider>
        {children}
      </AdminProvider>
    </AuthProvider>
  );
}