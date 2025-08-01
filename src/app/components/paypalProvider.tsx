'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
  vault: false,
  // Configuración para producción vs sandbox
  "data-client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  "data-currency": "USD",
  "data-intent": "capture",
  // Configuración de funding según el entorno
  "disable-funding": isProduction ? "" : "venmo,paylater", 
  "enable-funding": "card,paypal",
  components: "buttons",
  // Configuración específica para producción
  "buyer-country": "US",
  "data-sdk-integration-source": "react-paypal-js",
  debug: !isProduction // Solo debug en desarrollo
};

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}


