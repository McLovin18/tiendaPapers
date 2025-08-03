'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

interface PayPalProviderProps {
  children: ReactNode;
}

const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// Seleccionar Client ID según el entorno
let clientId: string;

if (isProduction && !isLocalhost) {
  // Producción (Vercel/Hostinger)
  clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
} else {
  // Desarrollo local
  clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
}

const initialOptions = {
  clientId: clientId,
  currency: "USD",
  intent: "capture" as const,
  "data-sdk-integration-source": "react-paypal-js"
};

export default function PayPalProvider({ children }: PayPalProviderProps) {
  if (!clientId || clientId === 'test') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ PayPal Client ID no configurado');
    }
    return <>{children}</>;
  }

  return (
    <PayPalScriptProvider 
      options={initialOptions}
    >
      {children}
    </PayPalScriptProvider>
  );
}


