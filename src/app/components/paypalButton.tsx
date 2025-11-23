'use client';

import { PayPalButtons, usePayPalScriptReducer, FUNDING } from '@paypal/react-paypal-js';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Alert } from 'react-bootstrap';

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
  guestEmail?: string; // email para invitado
}

export default function PayPalButton({ amount, onSuccess, onError, disabled, guestEmail }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [showPayPalButton, setShowPayPalButton] = useState(false);
  const [showCardButton, setShowCardButton] = useState(false);

  // Detectar errores en la carga de PayPal
  useEffect(() => {
    if (isRejected) {
      setScriptError('Error al cargar PayPal. Verifica tu conexión a internet.');
    }
  }, [isRejected]);

  useEffect(() => {
    if (isResolved && typeof window !== 'undefined' && window.paypal && window.paypal.Buttons) {
      setShowPayPalButton(true);
      setShowCardButton(true);
    }
  }, [isResolved]);

  const isPayPalReady = useMemo(() => showPayPalButton || showCardButton, [showPayPalButton, showCardButton]);

  // Crear orden de PayPal
  const createOrder = useCallback((data: any, actions: any) => {
    try {
      if (!amount || amount <= 0) {
        throw new Error("El monto de la compra no es válido");
      }

      console.log("🛒 PayPal createOrder, amount:", amount);
      if (guestEmail) console.log("Email de invitado:", guestEmail);

      return actions.order.create({
        purchase_units: [
          {
            amount: {
              value: amount.toFixed(2),
              currency_code: "USD"
            }
          }
        ]
      });
    } catch (err: any) {
      console.error("❌ Error al crear la orden de PayPal:", err.message);
      onError({ ...err, userMessage: "No se pudo iniciar el pago. Revisa los datos de tu compra." });
      return undefined;
    }
  }, [amount, guestEmail, onError]);

  // Aprobar pago
  const onApprove = useCallback(async (data: any, actions: any) => {
    setLoading(true);
    try {
      if (!actions.order) throw new Error("Orden de PayPal no encontrada");

      const details = await actions.order.capture();
      console.log("✅ Pago aprobado:", details);

      onSuccess(details);
    } catch (err: any) {
      console.error("❌ Error al aprobar el pago:", err.message);
      onError({ ...err, userMessage: "Hubo un problema al procesar tu pago." });
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  // Manejo de errores específico de PayPal
  const onErrorHandler = useCallback((error: any) => {
    const errorMessage = error?.message || '';

    // Ignorar errores por ventana cerrada o popup
    if (errorMessage.includes('Window closed') || 
        errorMessage.includes('popup_closed') ||
        errorMessage.includes('postrobot_method')) {
      return;
    }

    if (errorMessage.includes('INVALID_CLIENT_ID')) {
      onError({ ...error, userMessage: 'Error de configuración de PayPal Sandbox. Verifica el Client ID.' });
      return;
    }

    if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('authentication')) {
      onError({ ...error, userMessage: 'Error de autenticación en PayPal. Intenta con otra cuenta.' });
      return;
    }

    if (errorMessage.includes('INVALID_ACCOUNT') || errorMessage.includes('account_invalid')) {
      onError({ ...error, userMessage: 'Cuenta de prueba inválida. Usa las credenciales correctas del sandbox.' });
      return;
    }

    onError(error); // Error genérico
  }, [onError]);

  if (disabled) {
    return (
      <div className="text-center p-3 bg-light rounded">
        <span className="text-muted">Completa la información requerida</span>
      </div>
    );
  }

  if (isPending || !isPayPalReady) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando PayPal...</span>
        </div>
        {!isPayPalReady && isResolved && (
          <div className="mt-2">
            <small className="text-muted">Inicializando PayPal...</small>
          </div>
        )}
      </div>
    );
  }

  if (scriptError) {
    return (
      <Alert variant="warning" className="text-center">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {scriptError}
        <div className="mt-2">
          <Button 
            variant="outline-warning" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="paypal-button-container">
      {loading && (
        <div className="text-center mb-2">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span className="text-primary">Procesando...</span>
        </div>
      )}

      {/* Botón PayPal */}
      {showPayPalButton && (
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          fundingSource={FUNDING.PAYPAL}
          style={{
            layout: 'horizontal',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 40,
            tagline: false
          }}
        />
      )}

      {/* Botón Tarjeta */}
      {showCardButton && (
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          fundingSource={FUNDING.CARD}
          style={{
            layout: 'horizontal',
            color: 'black',
            shape: 'rect',
            label: 'pay',
            height: 40,
            tagline: false
          }}
        />
      )}

      <div className="text-center mt-2">
        <small className="text-muted">
          <i className="bi bi-shield-check me-1"></i>
          Pago 100% seguro
        </small>
      </div>
    </div>
  );
}
