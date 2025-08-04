'use client';

import { PayPalButtons, usePayPalScriptReducer, FUNDING } from '@paypal/react-paypal-js';
import { useState, useCallback, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

export default function PayPalButton({ amount, onSuccess, onError, disabled }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();

  // Detectar errores del script
  useEffect(() => {
    if (isRejected) {
      setScriptError('Error al cargar PayPal. Verifica tu conexión a internet.');
    }
  }, [isRejected]);

  // 🔍 Verificar que PayPal esté disponible
  const isPayPalReady = isResolved && typeof window !== 'undefined' && window.paypal && window.paypal.Buttons;

  const createOrder = useCallback((data: any, actions: any) => {
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
  }, [amount]);

  const onApprove = useCallback(async (data: any, actions: any) => {
    setLoading(true);
    
    try {
      const details = await actions.order.capture();
      
      const paymentMethod = details.payment_source || details.payer?.payment_method;
      
      onSuccess(details);
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const onErrorHandler = useCallback((error: any) => {
    const errorMessage = error?.message || '';
    
    // Ignorar errores de ventana cerrada
    if (errorMessage.includes('Window closed') || 
        errorMessage.includes('popup_closed') ||
        errorMessage.includes('postrobot_method')) {
      return;
    }
    
    // Detectar errores específicos de sandbox
    if (errorMessage.includes('INVALID_CLIENT_ID')) {
      onError({
        ...error,
        userMessage: 'Error de configuración de PayPal Sandbox. Verifica el Client ID.'
      });
      return;
    }
    
    if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('authentication')) {
      onError({
        ...error,
        userMessage: 'Error de autenticación en PayPal. Intenta con otra cuenta.'
      });
      return;
    }
    
    // Detectar errores de cuenta sandbox
    if (errorMessage.includes('INVALID_ACCOUNT') || errorMessage.includes('account_invalid')) {
      onError({
        ...error,
        userMessage: 'Cuenta de prueba inválida. Usa las credenciales correctas del sandbox.'
      });
      return;
    }
    
    // Error genérico
    onError(error);
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
      
      {/* ✅ BOTÓN PAYPAL */}
      <div className="mb-2">
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
      </div>

      {/* ✅ BOTÓN TARJETAS DE CRÉDITO/DÉBITO */}
      <div className="mb-2">
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
      </div>
      
      <div className="text-center mt-2">
        <small className="text-muted">
          <i className="bi bi-shield-check me-1"></i>
          Pago 100% seguro
        </small>
      </div>
    </div>
  );
}