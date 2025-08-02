'use client';

import { useEffect, useState } from 'react';
import { Alert, Card } from 'react-bootstrap';

const PayPalDiagnostic = () => {
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const diagnose = async () => {
      const results: string[] = [];
      
      // 1. Verificar Client ID
      const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
      results.push(`🔑 Client ID: ${clientId ? 'Configurado' : 'NO configurado'}`);
      
      if (clientId) {
        results.push(`📏 Longitud: ${clientId.length} caracteres`);
        
        if (clientId === 'test') {
          results.push(`⚠️ Usando Client ID de prueba`);
        } else if (clientId.startsWith('AUY')) {
          results.push(`🧪 Client ID parece ser de SANDBOX`);
        } else if (clientId.startsWith('AR')) {
          results.push(`🌐 Client ID parece ser de PRODUCCIÓN`);
        }
      }

      // 2. Verificar conectividad a PayPal
      results.push(`🌐 Probando conectividad a PayPal...`);
      
      try {
        const testUrl = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons`;
        
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'no-cors' 
        });
        
        results.push(`✅ PayPal SDK accesible`);
      } catch (error) {
        results.push(`❌ Error de conectividad: ${error}`);
      }

      // 3. Verificar entorno
      results.push(`🏗️ Entorno: ${process.env.NODE_ENV}`);
      results.push(`🌍 Dominio: ${window.location.origin}`);

      setDiagnosis(results);
      setIsLoading(false);
    };

    diagnose();
  }, []);

  if (isLoading) {
    return (
      <Alert variant="info">
        <div className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Diagnosticando PayPal...
        </div>
      </Alert>
    );
  }

  return (
    <Card className="mt-3">
      <Card.Header>
        <h6 className="mb-0">🔍 Diagnóstico PayPal</h6>
      </Card.Header>
      <Card.Body>
        {diagnosis.map((item, index) => (
          <div key={index} className="mb-1">
            <code style={{ fontSize: '12px' }}>{item}</code>
          </div>
        ))}
        
        <hr />
        
        <div className="mt-3">
          <h6>🔧 Pasos para solucionar:</h6>
          <ol style={{ fontSize: '14px' }}>
            <li>Verifica que el Client ID sea de <strong>PRODUCCIÓN</strong> (no sandbox)</li>
            <li>Asegúrate de que el dominio esté autorizado en PayPal</li>
            <li>Verifica las variables de entorno en Hostinger</li>
            <li>Intenta recargar la página</li>
          </ol>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PayPalDiagnostic;
