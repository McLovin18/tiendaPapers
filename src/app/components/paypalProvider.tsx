'use client';

import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "capture",
  vault: false,
  // ✅ CONFIGURACIÓN PARA BOTONES SEPARADOS
  "disable-funding": "venmo,paylater,credit", // Deshabilitar todo excepto PayPal y tarjetas
  "enable-funding": "card", // Habilitar tarjetas explícitamente
  components: "buttons,hosted-fields,funding-eligibility", // Agregar funding-eligibility
  "buyer-country": "US",
  "data-sdk-integration-source": "react-paypal-js",
  debug: true
};

export default function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}


