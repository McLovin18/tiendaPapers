'use client';

import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Importar los scripts de Bootstrap de forma dinámica en el cliente
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}