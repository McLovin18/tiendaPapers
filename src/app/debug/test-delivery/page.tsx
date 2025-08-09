'use client';

import React, { useState } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { db } from '../../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function TestDeliveryPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestDeliveryUsers = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Crear usuario delivery con zona 'guayaquil-sur'
      await setDoc(doc(db, 'deliveryUsers', 'deliverysur@test.com'), {
        email: 'deliverysur@test.com',
        name: 'Delivery Sur Test',
        phone: '+593987654321',
        zones: ['guayaquil-sur'], // ← Zona específica para el delivery sur
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Crear otro usuario delivery con zona 'guayaquil-centro'
      await setDoc(doc(db, 'deliveryUsers', 'deliverycentro@test.com'), {
        email: 'deliverycentro@test.com',
        name: 'Delivery Centro Test',
        phone: '+593987654322',
        zones: ['guayaquil-centro'], // ← Zona específica para el delivery centro
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setMessage('✅ Usuarios delivery de prueba creados exitosamente!');
      console.log('✅ Usuarios creados:');
      console.log('   - deliverysur@test.com (zona: guayaquil-sur)');
      console.log('   - deliverycentro@test.com (zona: guayaquil-centro)');

    } catch (error) {
      console.error('❌ Error:', error);
      setError(`Error al crear usuarios: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <h4>🧪 Crear Usuarios Delivery de Prueba</h4>
        </Card.Header>
        <Card.Body>
          <p>Esta página crea usuarios delivery para probar el sistema de zonas:</p>
          <ul>
            <li><strong>deliverysur@test.com</strong> - Zona: guayaquil-sur</li>
            <li><strong>deliverycentro@test.com</strong> - Zona: guayaquil-centro</li>
          </ul>

          {message && (
            <Alert variant="success" className="mt-3">
              {message}
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}

          <Button 
            variant="primary" 
            onClick={createTestDeliveryUsers}
            disabled={loading}
            className="mt-3"
          >
            {loading ? 'Creando...' : 'Crear Usuarios de Prueba'}
          </Button>

          <div className="mt-4">
            <h6>🎯 Para probar:</h6>
            <ol>
              <li>Crear un pedido seleccionando zona "Sur"</li>
              <li>Ir a <code>/delivery</code> e iniciar sesión con <code>deliverysur@test.com</code></li>
              <li>Verificar que recibe la notificación</li>
              <li>Ir a <code>/delivery</code> e iniciar sesión con <code>deliverycentro@test.com</code></li>
              <li>Verificar que NO recibe la notificación del pedido "Sur"</li>
            </ol>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
