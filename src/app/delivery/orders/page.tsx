'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import { ProtectedRoute } from '../../utils/securityMiddleware';
import LoginRequired from '../../components/LoginRequired';
import { db } from '../../utils/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';

interface DeliveryOrder {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  items: any[];
  total: number;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  assignedTo: string; // Email del delivery
  assignedAt: string;
  deliveryNotes?: string;
}

const DeliveryOrdersPage = () => {
  const { user } = useAuth();
  const { isDelivery } = useRole();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    if (user?.email && isDelivery) {
      loadMyDeliveries();
    }
  }, [user?.email, isDelivery]);

  const loadMyDeliveries = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      // Buscar pedidos asignados a este repartidor
      const ordersQuery = query(
        collection(db, 'deliveryOrders'),
        where('assignedTo', '==', user.email)
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const deliveryOrders: DeliveryOrder[] = [];
      
      querySnapshot.forEach((doc) => {
        deliveryOrders.push({
          id: doc.id,
          ...doc.data()
        } as DeliveryOrder);
      });
      
      // Ordenar por fecha (más recientes primero)
      deliveryOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setOrders(deliveryOrders);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'warning';
      case 'picked_up': return 'info';
      case 'in_transit': return 'primary';
      case 'delivered': return 'success';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'Asignado';
      case 'picked_up': return 'Recogido';
      case 'in_transit': return 'En tránsito';
      case 'delivered': return 'Entregado';
      default: return status;
    }
  };

  const handleUpdateStatus = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDeliveryNotes(order.deliveryNotes || '');
    setShowModal(true);
  };

  const saveStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const orderRef = doc(db, 'deliveryOrders', selectedOrder.id);
      const updateData = {
        status: newStatus,
        deliveryNotes,
        lastUpdated: new Date().toISOString(),
        [`statusHistory.${newStatus}`]: new Date().toISOString()
      };
      
      await updateDoc(orderRef, updateData);

      // ✅ Verificar que la actualización fue exitosa
      const updatedDoc = await getDoc(orderRef);
      if (updatedDoc.exists()) {
        const updatedData = updatedDoc.data();
      }

      // Actualizar el estado local
      const updatedOrder = { ...selectedOrder, status: newStatus as any, deliveryNotes };
      
      setOrders(orders.map(order => 
        order.id === selectedOrder.id 
          ? updatedOrder
          : order
      ));

      setShowModal(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('❌ Error updating status:', error);
    }
  };

  // Verificar acceso después de todos los hooks
  if (!user) {
    return <LoginRequired />;
  }

  if (!isDelivery) {
    return (
      <Container className="py-5 text-center">
        <h2>🚫 Acceso Denegado</h2>
        <p>Solo los repartidores pueden acceder a esta página.</p>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredRole="delivery">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">
            <i className="bi bi-truck me-3"></i>
            Mis Entregas
          </h1>
          <Badge bg="info" className="fs-6">
            {orders.length} pedidos asignados
          </Badge>
      </div>

      {orders.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="bi bi-info-circle me-2"></i>
          No tienes pedidos asignados en este momento.
        </Alert>
      ) : (
        <Row>
          {orders.map((order) => (
            <Col xs={12} md={6} lg={4} key={order.id} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {new Date(order.date).toLocaleDateString()}
                  </small>
                  <Badge bg={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </Card.Header>
                
                <Card.Body>
                  <h6 className="fw-bold mb-2">Cliente: {order.userName}</h6>
                  <p className="text-muted small mb-2">{order.userEmail}</p>
                  
                  <div className="mb-3">
                    <strong>Productos:</strong>
                    <ul className="list-unstyled mt-1">
                      {order.items.map((item, index) => (
                        <li key={index} className="small">
                          {item.quantity}x {item.name} - ${item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <strong>Total: ${order.total.toFixed(2)}</strong>
                  </div>

                  {order.deliveryNotes && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Notas:</strong> {order.deliveryNotes}
                      </small>
                    </div>
                  )}
                </Card.Body>
                
                <Card.Footer>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-100"
                    onClick={() => handleUpdateStatus(order)}
                    disabled={order.status === 'delivered'}
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    {order.status === 'delivered' ? 'Entregado' : 'Actualizar Estado'}
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal para actualizar estado */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Actualizar Estado de Entrega</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-3">
                <strong>Cliente:</strong> {selectedOrder.userName}<br />
                <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="assigned">Asignado</option>
                  <option value="picked_up">Recogido</option>
                  <option value="in_transit">En tránsito</option>
                  <option value="delivered">Entregado</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Notas de entrega</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Agregar notas sobre la entrega..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={saveStatusUpdate}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </ProtectedRoute>
  );
};

export default DeliveryOrdersPage;
