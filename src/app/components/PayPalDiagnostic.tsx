'use client';

import { useState } from 'react';
import { Card, Button, Alert, Badge, Accordion } from 'react-bootstrap';

export default function PayPalDiagnostic() {
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  
  // ✅ TEMPORALMENTE HABILITADO EN PRODUCCIÓN PARA DIAGNÓSTICO
  // if (process.env.NODE_ENV === 'production') {
  //   return null; // No mostrar en producción
  // }

  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const sandboxClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_SANDBOX;
  const liveClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID_LIVE;
  const currentClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const paypalMode = process.env.NEXT_PUBLIC_PAYPAL_MODE;
  
  // Determinar modo actual (misma lógica que paypalProvider)
  let isUsingSandbox: boolean;
  let modeSource: string;
  
  if (paypalMode?.toLowerCase() === 'live' || paypalMode?.toLowerCase() === 'production') {
    isUsingSandbox = false;
    modeSource = 'Forzado por PAYPAL_MODE';
  } else if (paypalMode?.toLowerCase() === 'sandbox' || paypalMode?.toLowerCase() === 'test') {
    isUsingSandbox = true;
    modeSource = 'Forzado por PAYPAL_MODE';
  } else {
    isUsingSandbox = process.env.NODE_ENV === 'development' || isLocalhost;
    modeSource = 'Automático (NODE_ENV)';
  }

  if (!showDiagnostic) {
    return (
      <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1000 }}>
        <Button 
          variant="info" 
          size="sm"
          onClick={() => setShowDiagnostic(true)}
        >
          🔧 PayPal Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="position-fixed bottom-0 end-0 m-3" style={{ zIndex: 1000, maxWidth: '400px' }}>
      <Card className="shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>🔧 PayPal Diagnostic</span>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowDiagnostic(false)}
          >
            ✕
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>Estado Actual:</strong>
            <div>
              <Badge bg={isUsingSandbox ? 'warning' : 'success'}>
                {isUsingSandbox ? '🧪 SANDBOX' : '🌐 PRODUCTION'}
              </Badge>
              <small className="text-muted ms-2">({modeSource})</small>
            </div>
          </div>

          <div className="mb-3">
            <strong>Configuración:</strong>
            <ul className="small mb-0">
              <li>Environment: {process.env.NODE_ENV}</li>
              <li>PayPal Mode: {paypalMode || 'auto'}</li>
              <li>Localhost: {isLocalhost ? 'Sí' : 'No'}</li>
              <li>Vercel: {process.env.VERCEL === '1' ? 'Sí' : 'No'}</li>
              <li>Client ID activo: {currentClientId?.substring(0, 10) || 'No configurado'}...</li>
            </ul>
          </div>

          <div className="mb-3">
            <strong>Client IDs Disponibles:</strong>
            <ul className="small mb-0">
              <li>🧪 Sandbox: {sandboxClientId ? '✅ Configurado' : '❌ Faltante'}</li>
              <li>🌐 Live: {liveClientId ? '✅ Configurado' : '❌ Faltante'}</li>
            </ul>
          </div>

          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>🧪 Credenciales de Prueba Sandbox</Accordion.Header>
              <Accordion.Body>
                <Alert variant="info" className="small">
                  <strong>Cuenta Personal (Comprador):</strong><br/>
                  Email: sb-buyer@personal.example.com<br/>
                  Password: 12345678<br/><br/>
                  
                  <strong>Cuenta Business (Vendedor):</strong><br/>
                  Email: sb-seller@business.example.com<br/>
                  Password: 12345678<br/><br/>
                  
                  <strong>Tarjeta de Prueba:</strong><br/>
                  Número: 4111111111111111<br/>
                  CVV: 123<br/>
                  Fecha: 01/2030
                </Alert>
                
                <div className="text-center">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    href="https://developer.paypal.com/tools/sandbox/accounts/"
                    target="_blank"
                  >
                    🔗 Ver Cuentas Sandbox
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          <div className="mt-3">
            <Alert variant={sandboxClientId ? 'success' : 'danger'} className="small mb-2">
              {sandboxClientId ? 
                '✅ Client ID Sandbox configurado' : 
                '❌ Client ID Sandbox no encontrado'
              }
            </Alert>
            <Alert variant={liveClientId ? 'success' : 'danger'} className="small mb-0">
              {liveClientId ? 
                '✅ Client ID Live configurado' : 
                '❌ Client ID Live no encontrado'
              }
            </Alert>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
