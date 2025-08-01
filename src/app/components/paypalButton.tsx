'use client';

import { PayPalButtons, usePayPalScriptReducer, FUNDING } from '@paypal/react-paypal-js';
import { useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

export default function PayPalButton({ amount, onSuccess, onError, disabled }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [{ isPending, isResolved }] = usePayPalScriptReducer();

  const createOrder = useCallback((data: any, actions: any) => {
    console.log('🔧 Creando orden para:', amount);
    
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
    console.log('🎯 Aprobando pago...');
    setLoading(true);
    
    try {
      const details = await actions.order.capture();
      console.log('✅ Pago exitoso:', details);
      
      const paymentMethod = details.payment_source || details.payer?.payment_method;
      console.log('💳 Método de pago:', paymentMethod);
      
      onSuccess(details);
    } catch (error) {
      console.error('❌ Error en captura:', error);
      onError(error);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const onErrorHandler = useCallback((error: any) => {
    console.error('❌ Error de PayPal:', error);
    const errorMessage = error?.message || '';
    
    // Ignorar errores de ventana cerrada
    if (errorMessage.includes('Window closed') || 
        errorMessage.includes('popup_closed') ||
        errorMessage.includes('postrobot_method')) {
      console.log('🔕 Ventana cerrada - ignorando error');
      return;
    }
    
    // Detectar errores de configuración de producción
    if (errorMessage.includes('CLIENT_ID_REQUIRED') || 
        errorMessage.includes('INVALID_CLIENT_ID') ||
        errorMessage.includes('sandbox') ||
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID === 'test') {
      onError({
        ...error,
        userMessage: 'Error de configuración de PayPal para producción. Contacta al administrador.'
      });
      return;
    }
    
    onError(error);
  }, [onError]);

  if (disabled) {
    return (
      <div className="text-center p-3 bg-light rounded">
        <span className="text-muted">Carrito vacío</span>
      </div>
    );
  }

  if (isPending || !isResolved) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando PayPal...</span>
        </div>
      </div>
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