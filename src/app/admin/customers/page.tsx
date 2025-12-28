'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Form, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import { DailyOrder, DailyOrdersDocument, getAllOrderDays } from '../../services/purchaseService';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';

interface CustomerSummary {
  userId: string;
  customerCode?: string;
  userName?: string;
  userEmail?: string;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate?: string;
  orders: DailyOrder[];
}

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      loadCustomerData();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = customers.filter((c) => {
      const name = c.userName?.toLowerCase() || '';
      const email = c.userEmail?.toLowerCase() || '';
      const id = c.userId.toLowerCase();
      return name.includes(term) || email.includes(term) || id.includes(term);
    });
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const days: DailyOrdersDocument[] = await getAllOrderDays();
      const customerMap = new Map<string, CustomerSummary>();

      days.forEach((day) => {
        (day.orders || []).forEach((order) => {
          if (!order.userId) return;

          const key = order.userId;
          const existing = customerMap.get(key) || {
            userId: key,
            customerCode: order.customerCode,
            userName: order.userName,
            userEmail: order.userEmail,
            totalOrders: 0,
            totalAmount: 0,
            lastOrderDate: undefined,
            orders: [],
          };

          existing.totalOrders += 1;
          existing.totalAmount += order.total;
          existing.orders.push(order);

          if (!existing.userName && order.userName) {
            existing.userName = order.userName;
          }
          if (!existing.userEmail && order.userEmail) {
            existing.userEmail = order.userEmail;
          }
          if (!existing.customerCode && order.customerCode) {
            existing.customerCode = order.customerCode;
          }
          if (!existing.lastOrderDate || order.date > existing.lastOrderDate) {
            existing.lastOrderDate = order.date;
          }

          customerMap.set(key, existing);
        });
      });

      const list = Array.from(customerMap.values()).sort((a, b) => b.totalOrders - a.totalOrders);
      setCustomers(list);
      setFilteredCustomers(list);
    } catch (err: any) {
      console.error('Error al cargar datos de clientes:', err);
      setError('Error al cargar la información de clientes. Revisa las reglas de Firestore para la colección dailyOrders.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReadableOrderId = (order: DailyOrder, customerCodeFallback?: string) => {
    if (order.fullOrderId) return order.fullOrderId;
    const customerCode = order.customerCode || customerCodeFallback;
    if (customerCode && order.orderNumber) {
      return `${customerCode}${order.orderNumber}`;
    }
    if (order.orderNumber) return order.orderNumber;
    return order.id;
  };

  const handleSelectCustomer = (customer: CustomerSummary) => {
    if (selectedCustomer && selectedCustomer.userId === customer.userId) {
      setSelectedCustomer(null);
      setExpandedOrderId(null);
    } else {
      setSelectedCustomer({
        ...customer,
        orders: [...customer.orders].sort((a, b) => (a.date < b.date ? 1 : -1)),
      });
      setExpandedOrderId(null);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Estado de carga de rol
  if (roleLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Verificando permisos...</p>
      </Container>
    );
  }

  // Usuario no autenticado
  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert className="alert-cosmetic-warning">Debes iniciar sesión para acceder a esta página.</Alert>
      </Container>
    );
  }

  // Usuario sin rol de admin
  if (!isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert className="alert-cosmetic-danger">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <p className="small text-muted">Si crees que esto es un error, contacta al administrador del sistema.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <Sidebar />

      <div className="flex-grow-1 d-flex flex-column">
        <TopbarMobile />

        <main
          className="flex-grow-1 py-4 px-3 px-md-4"
          style={{ backgroundColor: 'var(--cosmetic-bg, #f8f9fa)' }}
        >
          <Container fluid>
            <Row className="mb-4">
              <Col>
                <h2 className="mb-1">Clientes</h2>
                <p className="text-muted mb-0">
                  Resumen de clientes con el número de pedidos y montos totales.
                </p>
              </Col>
            </Row>

            {error && (
              <Row className="mb-3">
                <Col>
                  <Alert variant="danger">{error}</Alert>
                </Col>
              </Row>
            )}

            <Row className="mb-3 align-items-center">
              <Col md={6} className="mb-2 mb-md-0">
                <Form.Control
                  type="text"
                  placeholder="Buscar por nombre, email o ID de usuario"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={6} className="text-md-end text-start">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={loadCustomerData}
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar datos'}
                </Button>
              </Col>
            </Row>

            <Row>
              <Col xl={selectedCustomer ? 7 : 12} className="mb-3">
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Lista de clientes ({filteredCustomers.length})</span>
                  </Card.Header>
                  <Card.Body className="p-0">
                    {loading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status" size="sm" />
                        <p className="mt-2 mb-0 text-muted">Cargando información de clientes...</p>
                      </div>
                    ) : filteredCustomers.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="mb-0 text-muted">No se encontraron clientes con pedidos registrados.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table hover size="sm" className="mb-0">
                          <thead>
                            <tr>
                              <th>Cliente</th>
                              <th>Email</th>
                              <th className="text-center">Pedidos</th>
                              <th className="text-end">Total gastado</th>
                              <th className="text-end">Último pedido</th>
                              <th className="text-end">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCustomers.map((customer) => (
                              <tr key={customer.userId}>
                                <td>
                                  <div className="fw-semibold">
                                    {customer.userName || 'Sin nombre'}
                                  </div>
                                  <div className="text-muted small">Usuario: {customer.userId}</div>
                                  {customer.customerCode && (
                                    <div className="text-muted small">Código cliente: {customer.customerCode}</div>
                                  )}
                                </td>
                                <td>{customer.userEmail || '-'}</td>
                                <td className="text-center">
                                  <Badge bg="primary" pill>
                                    {customer.totalOrders}
                                  </Badge>
                                </td>
                                <td className="text-end">{formatCurrency(customer.totalAmount)}</td>
                                <td className="text-end">
                                  {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '-'}
                                </td>
                                <td className="text-end">
                                  <Button
                                    size="sm"
                                    variant={
                                      selectedCustomer && selectedCustomer.userId === customer.userId
                                        ? 'outline-primary'
                                        : 'primary'
                                    }
                                    onClick={() => handleSelectCustomer(customer)}
                                  >
                                    {selectedCustomer && selectedCustomer.userId === customer.userId
                                      ? 'Ocultar pedidos'
                                      : 'Ver pedidos'}
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {selectedCustomer && (
                <Col xl={5} className="mb-3 mt-3 mt-xl-0">
                  <Card className="shadow-sm h-100">
                    <Card.Header>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <Card.Title as="h5" className="mb-0">
                            {selectedCustomer.userName || 'Cliente sin nombre'}
                          </Card.Title>
                          <Card.Subtitle className="text-muted small">
                            {selectedCustomer.userEmail || 'Sin email registrado'}
                          </Card.Subtitle>
                          <div className="text-muted small mt-1">
                            Usuario: {selectedCustomer.userId}
                          </div>
                          {selectedCustomer.customerCode && (
                            <div className="text-muted small">
                              Código cliente: {selectedCustomer.customerCode}
                            </div>
                          )}
                        </div>
                        <div className="text-end">
                          <div className="mb-1">
                            <Badge bg="primary" pill>
                              {selectedCustomer.totalOrders} pedidos
                            </Badge>
                          </div>
                          <div className="fw-semibold">
                            {formatCurrency(selectedCustomer.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {selectedCustomer.orders.length === 0 ? (
                        <div className="text-center py-4">
                          <p className="mb-0 text-muted">Este cliente no tiene pedidos registrados.</p>
                        </div>
                      ) : (
                        <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                          <Table hover size="sm" className="mb-0">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th className="text-center">Productos</th>
                                <th className="text-end">Total</th>
                                <th className="text-end">Detalle</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCustomer.orders.map((order) => (
                                <React.Fragment key={order.id}>
                                  <tr>
                                    <td>
                                      <div className="fw-semibold">{formatDate(order.date)}</div>
                                      <div className="text-muted small">
                                        ID pedido: {getReadableOrderId(order, selectedCustomer.customerCode)}
                                      </div>
                                    </td>
                                    <td className="text-center">{order.items?.length || 0}</td>
                                    <td className="text-end">{formatCurrency(order.total)}</td>
                                    <td className="text-end">
                                      <Button
                                        size="sm"
                                        variant={expandedOrderId === order.id ? 'outline-secondary' : 'outline-primary'}
                                        onClick={() => toggleOrderDetails(order.id)}
                                      >
                                        {expandedOrderId === order.id ? 'Ocultar' : 'Ver productos'}
                                      </Button>
                                    </td>
                                  </tr>
                                  {expandedOrderId === order.id && (
                                    <tr>
                                      <td colSpan={4}>
                                        <div className="small">
                                          <strong>Productos del pedido:</strong>
                                          <ul className="mb-0 mt-2 ps-3">
                                            {order.items && order.items.length > 0 ? (
                                              order.items.map((item, idx) => (
                                                <li key={item.id || idx}>
                                                  {item.name} x {item.quantity}
                                                </li>
                                              ))
                                            ) : (
                                              <li>Sin productos registrados</li>
                                            )}
                                          </ul>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>
          </Container>
        </main>

        <Footer />
      </div>
    </div>
  );
}
