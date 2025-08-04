'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

interface PayPalProviderProps {
  children: ReactNode;
}

const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// 🎯 NUEVA LÓGICA: Modo PayPal basado en variable específica
const paypalMode = process.env.NEXT_PUBLIC_PAYPAL_MODE?.toLowerCase();

// Determinar si usar sandbox basado en configuración explícita
let useSandbox: boolean;

if (paypalMode === 'live' || paypalMode === 'production') {
  // Forzar modo LIVE
  useSandbox = false;
} else if (paypalMode === 'sandbox' || paypalMode === 'test') {
  // Forzar modo SANDBOX
  useSandbox = true;
} else {
  // Modo automático (comportamiento anterior)
  useSandbox = !isProduction || isLocalhost;
}

// Seleccionar Client ID según el entorno
let clientId: string;

if (useSandbox) {
  // Sandbox para desarrollo y pruebas locales
  clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX || 
             process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
} else {
  // Producción (Vercel/Hostinger)
  clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE || 
             process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
}

const initialOptions = {
  clientId: clientId,
  currency: "USD",
  intent: "capture" as const,
  // 🔥 FORZAR modo sandbox cuando corresponde
  environment: (useSandbox ? "sandbox" : "production") as "sandbox" | "production",
  // 🔥 Configuraciones mínimas pero efectivas
  components: "buttons",
  "data-sdk-integration-source": "react-paypal-js"
};

export default function PayPalProvider({ children }: PayPalProviderProps) {
  if (!clientId || clientId === 'test') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ PayPal Client ID no configurado');
    }
    return <>{children}</>;
  }

  // 🔍 DEBUG: Mostrar configuración actual en consola
  console.log('🏦 PayPal Config:', {
    environment: useSandbox ? 'sandbox' : 'production',
    clientId: clientId.substring(0, 10) + '...',
    mode: paypalMode || 'auto',
    forced: paypalMode ? 'YES' : 'NO'
  });

  return (
    <PayPalScriptProvider 
      options={initialOptions}
      key={`paypal-${useSandbox ? 'sandbox' : 'production'}`}
    >
      {children}
    </PayPalScriptProvider>
  );
}


