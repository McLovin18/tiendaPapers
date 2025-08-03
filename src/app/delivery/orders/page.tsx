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
      <div className="d-flex flex-column min-vh-100">
        <div className="d-lg-none">
          {/* Para móvil solo mostramos contenido sin navbar adicional */}
        </div>
        
        <main className="flex-grow-1" style={{ paddingTop: '1rem' }}>
          <Container fluid className="px-2 px-md-4">
            {/* Header - Responsive */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
              <div className="mb-2 mb-md-0">
                <h1 className="fw-bold fs-3 fs-md-1">
                  <i className="bi bi-truck me-2 me-md-3"></i>
                  <span className="d-none d-sm-inline">Mis Entregas</span>
                  <span className="d-sm-none">Entregas</span>
                </h1>
              </div>
              <Badge bg="info" className="fs-6 align-self-end align-self-md-center">
                {orders.length} 
                <span className="d-none d-sm-inline"> pedidos asignados</span>
                <span className="d-sm-none"> pedidos</span>
              </Badge>
            </div>

            {orders.length === 0 ? (
              <Alert variant="info" className="text-center mx-1">
                <i className="bi bi-info-circle me-2"></i>
                <span className="d-none d-md-inline">No tienes pedidos asignados en este momento.</span>
                <span className="d-md-none">Sin pedidos asignados</span>
              </Alert>
            ) : (
              <>
                {/* Vista de cards para móvil */}
                <div className="d-md-none">
                  {orders.map((order) => (
                    <Card key={order.id} className="mb-3 shadow-sm">
                      <Card.Header className="py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {new Date(order.date).toLocaleDateString()}
                          </small>
                          <Badge bg={getStatusColor(order.status)} className="small">
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </Card.Header>
                      
                      <Card.Body className="py-2">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-1 fs-6">{order.userName}</h6>
                            <p className="text-muted mb-2 small">{order.userEmail}</p>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold text-success">${order.total.toFixed(2)}</div>
                            <small className="text-muted">{order.items.length} items</small>
                          </div>
                        </div>
                        
                        <div className="bg-light p-2 rounded mb-2">
                          <div className="small">
                            <strong>Productos:</strong>
                          </div>
                          <div className="mt-1">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="small text-muted">
                                • {item.title} (x{item.quantity})
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="small text-muted">
                                • +{order.items.length - 2} más...
                              </div>
                            )}
                          </div>
                        </div>

                        {order.deliveryNotes && (
                          <div className="small text-muted mb-2">
                            <strong>Notas:</strong> {order.deliveryNotes}
                          </div>
                        )}
                        
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100"
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <i className="bi bi-pencil-square me-1"></i>
                          Actualizar Estado
                        </Button>
                      </Card.Body>
                    </Card>
                  ))}
                </div>

                {/* Vista de grid para desktop */}
                <div className="d-none d-md-block">
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
                </div>
              </>
            )}

            {/* Modal para actualizar estado - Responsive */}
            <Modal 
              show={showModal} 
              onHide={() => setShowModal(false)}
              fullscreen="sm-down"
            >
              <Modal.Header closeButton className="pb-2">
                <Modal.Title className="fs-6 fs-md-5">
                  <i className="bi bi-pencil-square me-2"></i>
                  <span className="d-none d-sm-inline">Actualizar Estado de Entrega</span>
                  <span className="d-sm-none">Actualizar Estado</span>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="px-2 px-md-3">
                {selectedOrder && (
                  <>
                    <div className="mb-3 bg-light p-3 rounded">
                      <div className="row">
                        <div className="col-sm-6">
                          <strong>Cliente:</strong> {selectedOrder.userName}
                        </div>
                        <div className="col-sm-6">
                          <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Estado</Form.Label>
                      <Form.Select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)}
                        size="sm"
                      >
                        <option value="assigned">📋 Asignado</option>
                        <option value="picked_up">📦 Recogido</option>
                        <option value="in_transit">🚚 En tránsito</option>
                        <option value="delivered">✅ Entregado</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Notas de entrega</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Agregar notas sobre la entrega..."
                        size="sm"
                      />
                    </Form.Group>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer className="pt-2">
                <Button variant="secondary" onClick={() => setShowModal(false)} size="sm">
                  <i className="bi bi-x-circle me-1"></i>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={saveStatusUpdate} size="sm">
                  <i className="bi bi-check-circle me-1"></i>
                  Guardar
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DeliveryOrdersPage;
