'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Detectar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
  vault: false,
  // Configuración específica para producción
  "data-sdk-integration-source": "react-paypal-js",
  "disable-funding": "", // No deshabilitar nada en producción
  "enable-funding": "paypal,card", // Habilitar PayPal y tarjetas
  components: "buttons",
  // Configuración de entorno
  "buyer-country": "US",
  "merchant-id": undefined, // Dejar que PayPal lo maneje automáticamente
  debug: false // Sin debug en producción
};

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}


