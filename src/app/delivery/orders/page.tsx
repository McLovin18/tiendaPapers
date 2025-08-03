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
              <div className="text-center py-5">
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-truck text-muted" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5 className="text-muted mb-2">No hay entregas pendientes</h5>
                <p className="text-muted small mb-0">
                  <span className="d-none d-md-inline">Los pedidos asignados aparecerán aquí cuando el administrador te asigne nuevas entregas.</span>
                  <span className="d-md-none">Los pedidos asignados aparecerán aquí.</span>
                </p>
                <div className="mt-3">
                  <Badge bg="info" className="px-3 py-2">
                    <i className="bi bi-clock me-1"></i>
                    En espera de asignaciones
                  </Badge>
                </div>
              </div>
            ) : (
              <>
                {/* Vista de cards para móvil - Mejorado */}
                <div className="d-md-none">
                  {orders.map((order) => (
                    <Card key={order.id} className="mb-3 shadow-sm border-0" style={{ borderRadius: '1rem' }}>
                      <Card.Header className="py-3 bg-light" style={{ borderRadius: '1rem 1rem 0 0' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                 style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                              <i className="bi bi-box text-white"></i>
                            </div>
                            <div>
                              <div className="fw-bold small">{order.userName}</div>
                              <small className="text-muted">
                                {new Date(order.date).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </small>
                            </div>
                          </div>
                          <Badge 
                            bg={getStatusColor(order.status)} 
                            className="px-2 py-1 small"
                            style={{ borderRadius: '0.5rem' }}
                          >
                            {order.status === 'assigned' && '📋'}
                            {order.status === 'picked_up' && '📦'}
                            {order.status === 'in_transit' && '🚚'}
                            {order.status === 'delivered' && '✅'}
                            <span className="ms-1">{getStatusText(order.status)}</span>
                          </Badge>
                        </div>
                      </Card.Header>
                      
                      <Card.Body className="py-3">
                        {/* Información del pedido */}
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <div className="bg-light p-2 rounded text-center">
                              <div className="fw-bold text-success fs-5">${order.total.toFixed(2)}</div>
                              <small className="text-muted">Total</small>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-light p-2 rounded text-center">
                              <div className="fw-bold text-info fs-5">{order.items.length}</div>
                              <small className="text-muted">Productos</small>
                            </div>
                          </div>
                        </div>

                        {/* Producto principal si es solo uno */}
                        {order.items.length === 1 && (
                          <div className="mb-3">
                            <div className="bg-primary bg-opacity-10 p-2 rounded border-start border-primary border-3">
                              <div className="fw-bold small text-primary">
                                {order.items[0].title || order.items[0].name || 'Producto'}
                              </div>
                              <div className="small text-muted">
                                Cantidad: {order.items[0].quantity} • Precio: ${order.items[0].price}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Lista de productos compacta */}
                        <div className="mb-3">
                          <div className="small fw-bold mb-1 text-muted">Productos:</div>
                          <div className="bg-light p-2 rounded" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                            {order.items.slice(0, 3).map((item, index) => (
                              <div key={index} className="d-flex justify-content-between small mb-1">
                                <span className="text-truncate me-2" title={item.title || item.name}>
                                  {item.title || item.name || 'Producto'}
                                </span>
                                <span className="text-nowrap text-muted">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="small text-muted text-center mt-1">
                                +{order.items.length - 3} productos más...
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Email del cliente */}
                        <div className="mb-3">
                          <div className="small fw-bold mb-1 text-muted">Cliente:</div>
                          <div className="small text-muted bg-light p-2 rounded">
                            <i className="bi bi-envelope me-1"></i>
                            {order.userEmail.length > 25 ? order.userEmail.substring(0, 25) + '...' : order.userEmail}
                          </div>
                        </div>

                        {/* Notas de entrega */}
                        {order.deliveryNotes && (
                          <div className="mb-3">
                            <div className="small fw-bold mb-1 text-muted">Notas:</div>
                            <div className="small bg-warning bg-opacity-10 p-2 rounded border-start border-warning border-3">
                              <i className="bi bi-sticky me-1"></i>
                              {order.deliveryNotes}
                            </div>
                          </div>
                        )}
                        
                        {/* Botón de acción */}
                        <div className="d-grid mt-3">
                          {order.status === 'delivered' ? (
                            <Button
                              variant="success"
                              size="sm"
                              disabled
                              className="py-2"
                              style={{ borderRadius: '0.75rem' }}
                            >
                              <i className="bi bi-check-circle-fill me-2"></i>
                              Pedido Entregado
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              className="py-2"
                              onClick={() => handleUpdateStatus(order)}
                              style={{ borderRadius: '0.75rem' }}
                            >
                              <i className="bi bi-pencil-square me-2"></i>
                              Actualizar Estado
                            </Button>
                          )}
                        </div>
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
                                    {item.quantity}x {item.title || item.name || 'Producto'} - ${item.price}
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

            {/* Modal para actualizar estado - Mejorado y Responsive */}
            <Modal 
              show={showModal} 
              onHide={() => setShowModal(false)}
              fullscreen="sm-down"
              centered
            >
              <Modal.Header closeButton className="pb-2 border-0">
                <Modal.Title className="fs-6 fs-md-5 d-flex align-items-center">
                  <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                       style={{ width: '32px', height: '32px' }}>
                    <i className="bi bi-pencil-square text-white small"></i>
                  </div>
                  <span className="d-none d-sm-inline">Actualizar Estado de Entrega</span>
                  <span className="d-sm-none">Actualizar Estado</span>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="px-3 px-md-4">
                {selectedOrder && (
                  <>
                    {/* Información del pedido */}
                    <div className="bg-light p-3 rounded mb-4">
                      <div className="row g-2">
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-center mb-2">
                            <i className="bi bi-person-circle text-primary me-2"></i>
                            <div>
                              <div className="fw-bold small">{selectedOrder.userName}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {selectedOrder.userEmail}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-credit-card text-success me-2"></i>
                            <div>
                              <div className="fw-bold text-success">${selectedOrder.total.toFixed(2)}</div>
                              <div className="text-muted small">{selectedOrder.items.length} productos</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estado actual */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <label className="fw-bold small text-muted">ESTADO ACTUAL</label>
                        <Badge bg={getStatusColor(selectedOrder.status)} className="px-2 py-1">
                          {getStatusText(selectedOrder.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Selector de nuevo estado */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold small text-muted">NUEVO ESTADO</Form.Label>
                      <Form.Select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)}
                        size="sm"
                        className="py-2"
                        style={{ borderRadius: '0.75rem' }}
                        disabled={selectedOrder.status === 'delivered'}
                      >
                        <option value="assigned">📋 Asignado</option>
                        <option value="picked_up">📦 Recogido del almacén</option>
                        <option value="in_transit">🚚 En camino al cliente</option>
                        <option value="delivered">✅ Entregado al cliente</option>
                      </Form.Select>
                      {selectedOrder.status === 'delivered' && (
                        <div className="small text-success mt-1">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Este pedido ya fue entregado y no se puede modificar
                        </div>
                      )}
                    </Form.Group>
                    
                    {/* Notas de entrega */}
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold small text-muted">NOTAS DE ENTREGA</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Agregar comentarios sobre la entrega..."
                        size="sm"
                        style={{ borderRadius: '0.75rem' }}
                        disabled={selectedOrder.status === 'delivered'}
                      />
                      <div className="small text-muted mt-1">
                        <i className="bi bi-info-circle me-1"></i>
                        Ejemplo: "Cliente no estaba, dejado con vecino", "Entrega exitosa"
                      </div>
                    </Form.Group>

                    {/* Progreso visual de estados */}
                    <div className="mb-3">
                      <div className="small fw-bold text-muted mb-2">PROGRESO DE ENTREGA</div>
                      <div className="d-flex justify-content-between position-relative">
                        <div className="position-absolute w-100 h-1 bg-light top-50 translate-middle-y" style={{ zIndex: 0 }}></div>
                        {['assigned', 'picked_up', 'in_transit', 'delivered'].map((status, index) => {
                          const isCompleted = ['assigned', 'picked_up', 'in_transit', 'delivered'].indexOf(selectedOrder.status) >= index;
                          const isCurrent = selectedOrder.status === status;
                          return (
                            <div key={status} className="text-center position-relative" style={{ zIndex: 1 }}>
                              <div 
                                className={`rounded-circle d-flex align-items-center justify-content-center ${
                                  isCompleted ? 'bg-success text-white' : 'bg-light text-muted'
                                } ${isCurrent ? 'ring ring-success' : ''}`}
                                style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}
                              >
                                {status === 'assigned' && '📋'}
                                {status === 'picked_up' && '📦'}
                                {status === 'in_transit' && '🚚'}
                                {status === 'delivered' && '✅'}
                              </div>
                              <div className="small text-muted mt-1" style={{ fontSize: '0.6rem' }}>
                                {status === 'assigned' && 'Asignado'}
                                {status === 'picked_up' && 'Recogido'}
                                {status === 'in_transit' && 'En tránsito'}
                                {status === 'delivered' && 'Entregado'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer className="pt-2 border-0">
                <div className="d-flex gap-2 w-100">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setShowModal(false)} 
                    size="sm"
                    className="flex-fill py-2"
                    style={{ borderRadius: '0.75rem' }}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    Cancelar
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={saveStatusUpdate} 
                    size="sm"
                    className="flex-fill py-2"
                    style={{ borderRadius: '0.75rem' }}
                    disabled={selectedOrder?.status === 'delivered'}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    {selectedOrder?.status === 'delivered' ? 'Completado' : 'Guardar'}
                  </Button>
                </div>
              </Modal.Footer>
            </Modal>
          </Container>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default DeliveryOrdersPage;
