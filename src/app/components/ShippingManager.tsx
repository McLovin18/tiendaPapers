'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Form, Alert } from 'react-bootstrap';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

interface ShippingInfo {
  status: string;
  method: string;
  estimatedDelivery: string;
  trackingNumber: string;
  address: string;
}

interface ShippingManagerProps {
  orderId: string;
  currentShipping: ShippingInfo;
  onUpdate: () => void;
}

const ShippingManager: React.FC<ShippingManagerProps> = ({ orderId, currentShipping, onUpdate }) => {
  const [status, setStatus] = useState(currentShipping.status);
  const [trackingNumber, setTrackingNumber] = useState(currentShipping.trackingNumber);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'warning';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      default: return 'secondary';
    }
  };

  const handleUpdateShipping = async () => {
    setLoading(true);
    try {
      const orderRef = doc(db, 'purchases', orderId);
      await updateDoc(orderRef, {
        'shipping.status': status,
        'shipping.trackingNumber': trackingNumber,
        'shipping.lastUpdated': new Date().toISOString()
      });
      
      setMessage('✅ Estado de envío actualizado correctamente');
      onUpdate();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error actualizando envío:', error);
      setMessage('❌ Error al actualizar estado de envío');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-3">
      <Card.Header>
        <h6 className="mb-0">
          <i className="bi bi-truck me-2"></i>
          Gestión de Envío
        </h6>
      </Card.Header>
      <Card.Body>
        {message && (
          <Alert variant={message.includes('✅') ? 'success' : 'danger'} className="mb-3">
            {message}
          </Alert>
        )}
        
        <div className="mb-3">
          <strong>Estado actual: </strong>
          <Badge bg={getStatusColor(currentShipping.status)}>
            {currentShipping.status}
          </Badge>
        </div>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Estado de envío</Form.Label>
            <Form.Select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
            </Form.Select>
            <Form.Text className="text-muted">
              ℹ️ Cambiar a "Entregado" ayuda a liberar fondos de PayPal
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Número de seguimiento</Form.Label>
            <Form.Control
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ingresa el número de tracking"
            />
          </Form.Group>

          <Button 
            variant="primary" 
            onClick={handleUpdateShipping}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Actualizando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Actualizar Envío
              </>
            )}
          </Button>
        </Form>

        <hr />
        
        <div className="mt-3">
          <h6>💡 Tips para liberar fondos PayPal:</h6>
          <ul className="small text-muted">
            <li>Cambia el estado a "Entregado" cuando corresponda</li>
            <li>Agrega números de tracking reales</li>
            <li>PayPal libera fondos automáticamente en 21 días</li>
            <li>Con comprobante de entrega: 1-3 días</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ShippingManager;
