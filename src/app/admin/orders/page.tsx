'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import { ProtectedRoute } from '../../utils/securityMiddleware';
import { 
  getAllOrderDays, 
  getDailyOrders, 
  getTodayOrders, 
  getOrdersStatistics,
  DailyOrdersDocument,
  DailyOrder 
} from '../../services/purchaseService';
import { 
  getPendingOrders, 
  assignOrderToDelivery, 
  getAvailableDeliveryUsers,
  DeliveryOrder 
} from '../../services/deliveryService';
import { db } from '../../utils/firebase';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useRole();
  const [orderDays, setOrderDays] = useState<DailyOrdersDocument[]>([]);
  const [selectedDayOrders, setSelectedDayOrders] = useState<DailyOrdersDocument | null>(null);
  const [todayOrders, setTodayOrders] = useState<DailyOrdersDocument | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Estados para delivery management
  const [pendingDeliveries, setPendingDeliveries] = useState<DeliveryOrder[]>([]);
  const [availableDeliveryUsers, setAvailableDeliveryUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'deliveries'>('orders');

  useEffect(() => {
    if (user && isAdmin) {
      loadOrderData();
    }
  }, [user, isAdmin]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar días con pedidos
      const days = await getAllOrderDays();
      setOrderDays(days);

      // Cargar pedidos de hoy
      const today = await getTodayOrders();
      setTodayOrders(today);

      // Cargar estadísticas de los últimos 30 días
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const stats = await getOrdersStatistics(startDate, endDate);
      setStatistics(stats);

      // ✅ Cargar datos de delivery
      const pending = await getPendingOrders();
      setPendingDeliveries(pending);
      
      const deliveryUsers = getAvailableDeliveryUsers();
      setAvailableDeliveryUsers(deliveryUsers);

    } catch (error: any) {
      console.error('Error al cargar datos de pedidos:', error);
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
        setError(
          'Error de permisos: Las reglas de Firestore necesitan ser actualizadas para permitir acceso a la colección dailyOrders. ' +
          'Contacta al desarrollador para configurar los permisos correctos.'
        );
      } else {
        setError('Error al cargar los datos de pedidos: ' + (error?.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    try {
      setSelectedDate(date);
      const dayOrders = await getDailyOrders(date);
      setSelectedDayOrders(dayOrders);
    } catch (error) {
      console.error('Error al cargar pedidos del día:', error);
      setError('Error al cargar pedidos del día seleccionado');
    }
  };

  // ✅ Función para asignar orden a repartidor
  const handleAssignDelivery = async (orderId: string, deliveryEmail: string) => {
    try {
      await assignOrderToDelivery(orderId, deliveryEmail);
      
      // Actualizar la lista local
      setPendingDeliveries(prev => prev.filter(order => order.id !== orderId));
      
      // Mostrar éxito
      alert('✅ Orden asignada correctamente al repartidor');
      
    } catch (error) {
      console.error('Error asignando orden:', error);
      alert('❌ Error al asignar la orden');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mostrar spinner mientras se verifica el rol de admin
  if (adminLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Verificando permisos...</p>
      </Container>
    );
  }

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          Debes iniciar sesión para acceder a esta página.
        </Alert>
      </Container>
    );
  }

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <p className="small text-muted">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="d-flex flex-column min-vh-100">
        <TopbarMobile />
        
        <div className="d-flex flex-grow-1">
          <Sidebar />
          
          <main className="flex-grow-1 w-100">
          <Container className="py-4">
            {/* Header */}
            <Row className="mb-4">
              <Col>
                <h1 className="fw-bold text-dark mb-2">Panel de Administración</h1>
                <p className="text-muted">Gestiona pedidos y asigna entregas</p>
              </Col>
            </Row>

            {/* ✅ Tabs de navegación */}
            <Row className="mb-4">
              <Col>
                <div className="nav nav-pills" role="tablist">
                  <Button
                    variant={activeTab === 'orders' ? 'primary' : 'outline-primary'}
                    className="me-2"
                    onClick={() => setActiveTab('orders')}
                  >
                    <i className="bi bi-clipboard-data me-2"></i>
                    Pedidos
                  </Button>
                  <Button
                    variant={activeTab === 'deliveries' ? 'primary' : 'outline-primary'}
                    onClick={() => setActiveTab('deliveries')}
                  >
                    <i className="bi bi-truck me-2"></i>
                    Gestión Delivery
                    {pendingDeliveries.length > 0 && (
                      <Badge bg="danger" className="ms-2">
                        {pendingDeliveries.length}
                      </Badge>
                    )}
                  </Button>
                </div>
              </Col>
            </Row>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* ✅ Contenido según tab activo */}
            {activeTab === 'orders' && (
              <>
                {/* Estadísticas generales */}
                {statistics && (
                  <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-primary">{statistics.totalOrders}</h3>
                      <p className="text-muted mb-0 small">Pedidos (30 días)</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-success">{formatCurrency(statistics.totalAmount)}</h3>
                      <p className="text-muted mb-0 small">Ventas (30 días)</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-info">{formatCurrency(statistics.averageOrderValue)}</h3>
                      <p className="text-muted mb-0 small">Valor promedio</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-warning">{statistics.averageOrdersPerDay.toFixed(1)}</h3>
                      <p className="text-muted mb-0 small">Pedidos/día promedio</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Pedidos de hoy */}
            {todayOrders && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">📅 Pedidos de Hoy - {todayOrders.dateFormatted}</h5>
                  <small>Total: {todayOrders.totalOrdersCount} pedidos | {formatCurrency(todayOrders.totalDayAmount)}</small>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayOrders.orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.orderTime}</td>
                          <td>
                            <div>
                              {/* Mostrar el nombre del usuario o email */}
                              <strong className="text-primary">
                                {order.userName || 
                                 (order.userEmail ? order.userEmail.split('@')[0] : 'Usuario')}
                              </strong>
                              {/* Siempre mostrar el email si está disponible */}
                              {order.userEmail ? (
                                <div className="small text-muted">{order.userEmail}</div>
                              ) : (
                                <div className="small text-muted">ID: {order.userId.substring(0, 12)}...</div>
                              )}
                            </div>
                          </td>
                          <td>
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                          </td>
                          <td className="fw-bold text-success">{formatCurrency(order.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            <Row>
              {/* Lista de días con pedidos */}
              <Col lg={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">📋 Días con Pedidos</h5>
                  </Card.Header>
                  <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {loading ? (
                      <p className="text-center text-muted">Cargando...</p>
                    ) : orderDays.length === 0 ? (
                      <p className="text-center text-muted">No hay pedidos registrados</p>
                    ) : (
                      <div className="d-grid gap-2">
                        {orderDays.map((day) => (
                          <Button
                            key={day.date}
                            variant={selectedDate === day.date ? "primary" : "outline-primary"}
                            onClick={() => handleDateSelect(day.date)}
                            className="text-start"
                          >
                            <div>
                              <strong>{day.dateFormatted}</strong>
                              <br />
                              <small>
                                {day.totalOrdersCount} pedidos - {formatCurrency(day.totalDayAmount)}
                              </small>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Detalles del día seleccionado */}
              <Col lg={8}>
                {selectedDayOrders ? (
                  <Card className="border-0 shadow-sm">
                    <Card.Header>
                      <h5 className="mb-0">📝 Detalles - {selectedDayOrders.dateFormatted}</h5>
                      <small className="text-muted">
                        {selectedDayOrders.totalOrdersCount} pedidos | Total: {formatCurrency(selectedDayOrders.totalDayAmount)}
                      </small>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                            <th>Detalles</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDayOrders.orders.map((order) => (
                            <tr key={order.id}>
                              <td>{order.orderTime}</td>
                              <td>
                                <div>
                                  {/* Mostrar el nombre del usuario o email */}
                                  <strong className="text-primary">
                                    {order.userName || 
                                     (order.userEmail ? order.userEmail.split('@')[0] : 'Usuario')}
                                  </strong>
                                  {/* Siempre mostrar el email si está disponible */}
                                  {order.userEmail ? (
                                    <div className="small text-muted">{order.userEmail}</div>
                                  ) : (
                                    <div className="small text-muted">ID: {order.userId.substring(0, 12)}...</div>
                                  )}
                                </div>
                              </td>
                              <td>{order.items.length}</td>
                              <td>
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades
                              </td>
                              <td className="fw-bold text-success">{formatCurrency(order.total)}</td>
                              <td>
                                <details>
                                  <summary className="btn btn-sm btn-outline-info">Ver items</summary>
                                  <div className="mt-2">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="small text-muted">
                                        • {item.name} - Qty: {item.quantity} - {formatCurrency(item.price * item.quantity)}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                      <h5 className="text-muted">Selecciona un día para ver los pedidos</h5>
                      <p className="text-muted">Haz clic en cualquier día de la lista para ver sus detalles</p>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
            </>
            )}

            {/* ✅ Tab de Gestión de Delivery */}
            {activeTab === 'deliveries' && (
              <>
                <Row className="mb-4">
                  <Col>
                    <h3 className="fw-bold mb-3">
                      <i className="bi bi-truck me-2"></i>
                      Gestión de Entregas
                    </h3>
                    
                    {/* Órdenes pendientes de asignación */}
                    <Card className="mb-4">
                      <Card.Header className="bg-warning text-dark">
                        <h5 className="mb-0">
                          📦 Órdenes Pendientes de Asignación
                          <Badge bg="danger" className="ms-2">
                            {pendingDeliveries.length}
                          </Badge>
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        {pendingDeliveries.length === 0 ? (
                          <div className="text-center py-4">
                            <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                            <h5 className="mt-3 text-muted">¡Todas las órdenes están asignadas!</h5>
                            <p className="text-muted">No hay órdenes pendientes de asignación.</p>
                          </div>
                        ) : (
                          <Row>
                            {pendingDeliveries.map((order) => (
                              <Col xs={12} md={6} lg={4} key={order.id} className="mb-3">
                                <Card className="h-100 border-warning">
                                  <Card.Header className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                      {new Date(order.date).toLocaleDateString()}
                                    </small>
                                    <Badge bg="warning" text="dark">Pendiente</Badge>
                                  </Card.Header>
                                  <Card.Body>
                                    <h6 className="fw-bold">{order.userName}</h6>
                                    <p className="text-muted small mb-2">{order.userEmail}</p>
                                    
                                    <div className="mb-3">
                                      <strong>Total: ${order.total.toFixed(2)}</strong>
                                    </div>
                                    
                                    {/* ✅ Información de ubicación */}
                                    {order.deliveryLocation && (
                                      <div className="mb-3 p-2 bg-light rounded">
                                        <small className="fw-bold text-primary">📍 Ubicación:</small><br />
                                        <small>
                                          {order.deliveryLocation.address}<br />
                                          {order.deliveryLocation.city}
                                          {order.deliveryLocation.neighborhood && `, ${order.deliveryLocation.neighborhood}`}
                                          {order.deliveryLocation.deliveryZone && (
                                            <><br /><Badge bg="secondary" className="mt-1">
                                              Zona: {order.deliveryLocation.deliveryZone}
                                            </Badge></>
                                          )}
                                          {order.deliveryLocation.estimatedDistance && (
                                            <><br /><span className="text-muted">
                                              📏 ~{order.deliveryLocation.estimatedDistance}km aprox.
                                            </span></>
                                          )}
                                        </small>
                                      </div>
                                    )}
                                    
                                    <div className="mb-3">
                                      <small>
                                        <strong>Productos:</strong><br />
                                        {order.items.map((item, idx) => (
                                          <span key={idx}>
                                            {item.quantity}x {item.name}
                                            {idx < order.items.length - 1 && <br />}
                                          </span>
                                        ))}
                                      </small>
                                    </div>
                                    
                                    <Form.Group>
                                      <Form.Label className="small fw-bold">Asignar a:</Form.Label>
                                      <Form.Select
                                        size="sm"
                                        onChange={(e) => {
                                          if (e.target.value && order.id) {
                                            handleAssignDelivery(order.id, e.target.value);
                                          }
                                        }}
                                        defaultValue=""
                                      >
                                        <option value="">Seleccionar repartidor...</option>
                                        {availableDeliveryUsers
                                          .filter(delivery => {
                                            // ✅ Filtrar por zona si disponible
                                            if (!order.deliveryLocation?.deliveryZone || !delivery.preferredZones) {
                                              return true; // Mostrar todos si no hay info de zona
                                            }
                                            return delivery.preferredZones.includes(order.deliveryLocation.deliveryZone);
                                          })
                                          .map((delivery) => (
                                          <option key={delivery.email} value={delivery.email}>
                                            {delivery.name} 
                                            {delivery.preferredZones && ` (${delivery.preferredZones.join(', ')})`}
                                            {delivery.maxDistance && ` - ${delivery.maxDistance}km max`}
                                          </option>
                                        ))}
                                        {/* ✅ Separador para otros repartidores */}
                                        {availableDeliveryUsers.some(delivery => 
                                          order.deliveryLocation?.deliveryZone && 
                                          delivery.preferredZones && 
                                          !delivery.preferredZones.includes(order.deliveryLocation.deliveryZone)
                                        ) && (
                                          <>
                                            <option disabled>── Otros repartidores ──</option>
                                            {availableDeliveryUsers
                                              .filter(delivery => 
                                                order.deliveryLocation?.deliveryZone && 
                                                delivery.preferredZones && 
                                                !delivery.preferredZones.includes(order.deliveryLocation.deliveryZone)
                                              )
                                              .map((delivery) => (
                                              <option key={`other-${delivery.email}`} value={delivery.email}>
                                                {delivery.name} (Fuera de zona preferida)
                                              </option>
                                            ))}
                                          </>
                                        )}
                                      </Form.Select>
                                    </Form.Group>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>

                    {/* Información de repartidores */}
                    <Card>
                      <Card.Header className="bg-info text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-people me-2"></i>
                          Repartidores Disponibles
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        {availableDeliveryUsers.length === 0 ? (
                          <Alert variant="warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            No hay repartidores configurados. Contacta al desarrollador para agregar repartidores.
                          </Alert>
                        ) : (
                          <Row>
                            {availableDeliveryUsers.map((delivery) => (
                              <Col xs={12} md={6} lg={4} key={delivery.email} className="mb-3">
                                <Card className="border-info h-100">
                                  <Card.Body className="text-center">
                                    <i className="bi bi-person-circle text-info" style={{ fontSize: '2rem' }}></i>
                                    <h6 className="mt-2 mb-1">{delivery.name}</h6>
                                    <small className="text-muted d-block mb-2">{delivery.email}</small>
                                    
                                    {/* ✅ Zonas preferidas */}
                                    {delivery.preferredZones && delivery.preferredZones.length > 0 && (
                                      <div className="mb-2">
                                        <small className="fw-bold text-primary">Zonas:</small><br />
                                        {delivery.preferredZones.map((zone, idx) => (
                                          <Badge key={idx} bg="info" className="me-1 mb-1">
                                            {zone}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* ✅ Distancia máxima */}
                                    {delivery.maxDistance && (
                                      <div>
                                        <small className="text-muted">
                                          📏 Máximo: {delivery.maxDistance}km
                                        </small>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </Container>
        </main>
      </div>
      
      <Footer />
    </div>
    </ProtectedRoute>
  );
}