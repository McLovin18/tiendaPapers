'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/adminContext';
import { 
  getAllOrderDays, 
  getDailyOrders, 
  getTodayOrders, 
  getOrdersStatistics,
  DailyOrdersDocument,
  DailyOrder 
} from '../../services/purchaseService';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [orderDays, setOrderDays] = useState<DailyOrdersDocument[]>([]);
  const [selectedDayOrders, setSelectedDayOrders] = useState<DailyOrdersDocument | null>(null);
  const [todayOrders, setTodayOrders] = useState<DailyOrdersDocument | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    <div className="d-flex flex-column min-vh-100">
      <TopbarMobile />
      
      <div className="d-flex flex-grow-1">
        <Sidebar />
        
        <main className="flex-grow-1 w-100">
          <Container className="py-4">
            {/* Header */}
            <Row className="mb-4">
              <Col>
                <h1 className="fw-bold text-dark mb-2">Panel de Administración - Pedidos</h1>
                <p className="text-muted">Gestiona y visualiza todos los pedidos organizados por fecha</p>
              </Col>
            </Row>

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

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
          </Container>
        </main>
      </div>
      
      <Footer />
    </div>
  );
}