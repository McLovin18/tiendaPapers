'use client';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

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
      setScriptError('Error al cargar PayPal. Verifica la configuración.');
      console.error('❌ PayPal SDK falló al cargar');
    }
  }, [isRejected]);

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
        errorMessage.includes('popup_closed')) {
      console.log('🔕 Ventana cerrada - ignorando error');
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

  // Mostrar error si el script falló
  if (isRejected || scriptError) {
    return (
      <Alert variant="warning" className="text-center">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {scriptError || 'Error al cargar PayPal'}
        <div className="mt-2">
          <small>Verifica tu conexión a internet e intenta recargar la página.</small>
        </div>
      </Alert>
    );
  }

  // Mostrar loading mientras se carga el script
  if (isPending || !isResolved) {
    return (
      <div className="text-center p-3">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">Cargando PayPal...</span>
        </div>
        <div className="small text-muted">Inicializando PayPal...</div>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      {loading && (
        <div className="text-center mb-2">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
          <span className="text-primary">Procesando pago...</span>
        </div>
      )}
      
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onErrorHandler}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 40
        }}
      />
    </div>
  );
}
