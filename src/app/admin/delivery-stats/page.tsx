'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Table, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import { ProtectedRoute } from '../../utils/securityMiddleware';
import { getAllDeliveryPersonsStats, DeliveryPersonStats } from '../../services/deliveryService';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';

export default function DeliveryStatsPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useRole();
  const [deliveryStats, setDeliveryStats] = useState<DeliveryPersonStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryPersonStats | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      loadDeliveryStats();
    }
  }, [user, isAdmin]);

  const loadDeliveryStats = async () => {
    try {
      setLoading(true);
      const stats = await getAllDeliveryPersonsStats();
      setDeliveryStats(stats);
      setError(null);
    } catch (error) {
      setError('Error al cargar las estadísticas de repartidores');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success';
    if (rating >= 4) return 'primary';
    if (rating >= 3.5) return 'info';
    if (rating >= 3) return 'warning';
    return 'danger';
  };

  const getPerformanceText = (rating: number) => {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4) return 'Muy Bueno';
    if (rating >= 3.5) return 'Bueno';
    if (rating >= 3) return 'Regular';
    return 'Necesita Mejora';
  };

  const showDeliveryDetails = (delivery: DeliveryPersonStats) => {
    setSelectedDelivery(delivery);
    setShowDetailsModal(true);
  };

  if (adminLoading || loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
    <div className="d-flex flex-column min-vh-100">
      <TopbarMobile />
      
      <div className="d-flex flex-grow-1">
        <Sidebar />
        
        <main className="flex-grow-1" style={{ paddingTop: '1rem' }}>
          <Container fluid className="px-2 px-md-4">
            {/* Header - Responsive */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
              <div className="mb-2 mb-md-0">
                <h2 className="fw-bold mb-1 fs-3 fs-md-2">
                  <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                  <span className="d-none d-sm-inline">Estadísticas de Repartidores</span>
                  <span className="d-sm-none">Stats Delivery</span>
                </h2>
                <p className="text-muted mb-0 small">
                  <span className="d-none d-md-inline">Rendimiento y calificaciones del equipo de delivery</span>
                  <span className="d-md-none">Rendimiento del equipo</span>
                </p>
              </div>
              <Button 
                variant="outline-primary" 
                onClick={loadDeliveryStats}
                size="sm"
                className="align-self-end align-self-md-center"
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                <span className="d-none d-sm-inline">Actualizar</span>
                <span className="d-sm-none">Sync</span>
              </Button>
            </div>

            {error && (
              <Alert variant="danger" className="mx-1">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <span className="small">{error}</span>
              </Alert>
            )}

            {/* Resumen general - Cards responsivas */}
            {deliveryStats.length > 0 && (
              <Row className="mb-3 mb-md-4 g-2 g-md-3">
                <Col xs={6} md={3}>
                  <Card className="text-center border-0 shadow-sm h-100">
                    <Card.Body className="py-2 py-md-3">
                      <h4 className="fw-bold text-primary mb-1 fs-5 fs-md-3">{deliveryStats.length}</h4>
                      <p className="text-muted mb-0 small">
                        <span className="d-none d-md-inline">Repartidores Activos</span>
                        <span className="d-md-none">Activos</span>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6} md={3}>
                  <Card className="text-center border-0 shadow-sm h-100">
                    <Card.Body className="py-2 py-md-3">
                      <h4 className="fw-bold text-success mb-1 fs-5 fs-md-3">
                        {deliveryStats.filter(d => d.averageRating > 0).length > 0 
                          ? `${(deliveryStats.filter(d => d.averageRating > 0).reduce((sum, d) => sum + d.averageRating, 0) / deliveryStats.filter(d => d.averageRating > 0).length).toFixed(1)}/5`
                          : '0/5'
                        }
                      </h4>
                      <p className="text-muted mb-0 small">
                        <span className="d-none d-md-inline">Calificación Promedio</span>
                        <span className="d-md-none">Rating</span>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6} md={3}>
                  <Card className="text-center border-0 shadow-sm h-100">
                    <Card.Body className="py-2 py-md-3">
                      <h4 className="fw-bold text-info mb-1 fs-5 fs-md-3">
                        {deliveryStats.reduce((sum, d) => sum + d.totalDeliveries, 0)}
                      </h4>
                      <p className="text-muted mb-0 small">
                        <span className="d-none d-md-inline">Total Entregas</span>
                        <span className="d-md-none">Entregas</span>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col xs={6} md={3}>
                  <Card className="text-center border-0 shadow-sm h-100">
                    <Card.Body className="py-2 py-md-3">
                      <h4 className="fw-bold text-warning mb-1 fs-5 fs-md-3">
                        {deliveryStats.reduce((sum, d) => sum + d.totalRatings, 0)}
                      </h4>
                      <p className="text-muted mb-0 small">
                        <span className="d-none d-md-inline">Total Calificaciones</span>
                        <span className="d-md-none">Reviews</span>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Tabla/Cards de repartidores - Responsive */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white py-2 py-md-3">
                <h5 className="mb-0 fs-6 fs-md-5">
                  <i className="bi bi-people-fill me-2"></i>
                  <span className="d-none d-sm-inline">Ranking de Repartidores</span>
                  <span className="d-sm-none">Ranking</span>
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {deliveryStats.length === 0 ? (
                  <div className="text-center py-4 py-md-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '2.5rem' }}></i>
                    <h5 className="mt-3 text-muted fs-6 fs-md-5">No hay datos disponibles</h5>
                    <p className="text-muted small">Los repartidores aparecerán aquí cuando reciban calificaciones.</p>
                  </div>
                ) : (
                  <>
                    {/* Vista de tabla para desktop */}
                    <div className="d-none d-md-block">
                      <Table responsive hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th>#</th>
                            <th>Repartidor</th>
                            <th>Calificación</th>
                            <th>Entregas</th>
                            <th>Reviews</th>
                            <th>Rendimiento</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deliveryStats.map((delivery, index) => (
                            <tr key={delivery.email}>
                              <td>
                                <Badge bg={index < 3 ? 'warning' : 'secondary'}>
                                  {index + 1}
                                </Badge>
                              </td>
                              <td>
                                <div>
                                  <strong>{delivery.name}</strong>
                                  <div className="small text-muted">{delivery.email}</div>
                                </div>
                              </td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="me-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                      const filled = delivery.averageRating >= star;
                                      const partial = delivery.averageRating > star - 1 && delivery.averageRating < star;
                                      const fillPercentage = partial ? Math.round((delivery.averageRating - (star - 1)) * 100) : 0;
                                      
                                      return (
                                        <span key={star} className="position-relative d-inline-block">
                                          <i className="bi bi-star text-muted small"></i>
                                          <i 
                                            className={`bi ${filled ? 'bi-star-fill' : 'bi-star-fill'} text-warning small position-absolute`}
                                            style={{
                                              top: 0,
                                              left: 0,
                                              clipPath: filled 
                                                ? 'none' 
                                                : partial 
                                                  ? `inset(0 ${100 - fillPercentage}% 0 0)`
                                                  : 'inset(0 100% 0 0)',
                                              opacity: filled ? 1 : partial ? 1 : 0
                                            }}
                                          ></i>
                                        </span>
                                      );
                                    })}
                                  </div>
                                  <Badge bg={getRatingColor(delivery.averageRating)}>
                                    {delivery.averageRating > 0 ? `${delivery.averageRating.toFixed(1)}/5` : 'N/A'}
                                  </Badge>
                                </div>
                              </td>
                              <td>
                                <span className="fw-bold">{delivery.totalDeliveries}</span>
                              </td>
                              <td>
                                <span className="text-muted">{delivery.totalRatings}</span>
                              </td>
                              <td>
                                <Badge bg={getRatingColor(delivery.averageRating)}>
                                  {delivery.averageRating > 0 ? getPerformanceText(delivery.averageRating) : 'Sin datos'}
                                </Badge>
                              </td>
                              <td>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => showDeliveryDetails(delivery)}
                                  disabled={delivery.totalRatings === 0}
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Ver
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Vista de cards para móvil */}
                    <div className="d-md-none">
                      {deliveryStats.map((delivery, index) => (
                        <div key={delivery.email} className="border-bottom p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <Badge bg={index < 3 ? 'warning' : 'secondary'} className="me-2">
                                #{index + 1}
                              </Badge>
                              <div>
                                <div className="fw-bold small">{delivery.name}</div>
                                <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  {delivery.email.length > 20 ? delivery.email.substring(0, 20) + '...' : delivery.email}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => showDeliveryDetails(delivery)}
                              disabled={delivery.totalRatings === 0}
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            >
                              <i className="bi bi-eye"></i>
                            </Button>
                          </div>
                          
                          <div className="row g-2 text-center">
                            <div className="col-3">
                              <div className="small text-muted">Rating</div>
                              <Badge bg={getRatingColor(delivery.averageRating)} className="small">
                                {delivery.averageRating > 0 ? `${delivery.averageRating.toFixed(1)}` : 'N/A'}
                              </Badge>
                            </div>
                            <div className="col-3">
                              <div className="small text-muted">Entregas</div>
                              <div className="fw-bold small">{delivery.totalDeliveries}</div>
                            </div>
                            <div className="col-3">
                              <div className="small text-muted">Reviews</div>
                              <div className="small">{delivery.totalRatings}</div>
                            </div>
                            <div className="col-3">
                              <div className="small text-muted">Estado</div>
                              <Badge bg={getRatingColor(delivery.averageRating)} className="small">
                                {delivery.averageRating > 0 ? 
                                  (delivery.averageRating >= 4.5 ? '🌟' : 
                                   delivery.averageRating >= 4 ? '👍' : 
                                   delivery.averageRating >= 3.5 ? '👌' : 
                                   delivery.averageRating >= 3 ? '⚠️' : '❌') : '➖'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>

      {/* Modal de detalles - Responsive */}
      {selectedDelivery && (
        <Modal 
          show={showDetailsModal} 
          onHide={() => setShowDetailsModal(false)} 
          size="lg"
          fullscreen="sm-down"
        >
          <Modal.Header closeButton className="pb-2">
            <Modal.Title className="fs-6 fs-md-5">
              <i className="bi bi-person-circle me-2"></i>
              <span className="d-none d-sm-inline">{selectedDelivery.name}</span>
              <span className="d-sm-none">{selectedDelivery.name.split(' ')[0]}</span>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="px-2 px-md-3">
            <Row className="g-3">
              <Col md={6}>
                <h6 className="fw-bold mb-3 fs-6">Estadísticas Generales</h6>
                <div className="bg-light p-3 rounded">
                  <div className="mb-2 small">
                    <strong>Email:</strong>
                    <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                      {selectedDelivery.email}
                    </div>
                  </div>
                  <div className="row g-2 text-center mt-3">
                    <div className="col-6">
                      <div className="bg-white p-2 rounded">
                        <div className="fw-bold text-primary fs-5">{selectedDelivery.totalDeliveries}</div>
                        <div className="small text-muted">Entregas</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="bg-white p-2 rounded">
                        <div className="fw-bold text-info fs-5">{selectedDelivery.totalRatings}</div>
                        <div className="small text-muted">Reviews</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3">
                    <div className="bg-white p-2 rounded">
                      <div className="fw-bold text-success fs-4">
                        {selectedDelivery.averageRating.toFixed(1)} ⭐
                      </div>
                      <div className="small text-muted">Calificación Promedio</div>
                      <Badge bg={getRatingColor(selectedDelivery.averageRating)} className="mt-1">
                        {getPerformanceText(selectedDelivery.averageRating)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 mt-4 fs-6">Distribución de Calificaciones</h6>
                <div className="bg-light p-3 rounded">
                  {Object.entries(selectedDelivery.ratingsBreakdown).map(([rating, count]) => (
                    <div key={rating} className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small">{rating} ⭐</span>
                      <div className="d-flex align-items-center">
                        <div 
                          className="bg-primary rounded me-2" 
                          style={{ 
                            height: '8px', 
                            width: `${Math.max((count / selectedDelivery.totalRatings) * 100, 5)}%`,
                            minWidth: '20px'
                          }}
                        ></div>
                        <Badge bg="secondary" className="small">{count}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
              
              <Col md={6}>
                <h6 className="fw-bold mb-3 fs-6">Comentarios Recientes</h6>
                {selectedDelivery.recentComments.length === 0 ? (
                  <div className="text-center py-4 bg-light rounded">
                    <i className="bi bi-chat-dots text-muted fs-1"></i>
                    <p className="text-muted mb-0 mt-2 small">No hay comentarios disponibles</p>
                  </div>
                ) : (
                  <div className="comments-container bg-light p-3 rounded" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {selectedDelivery.recentComments.map((comment, index) => (
                      <div key={index} className="bg-white border-start border-3 border-primary ps-3 p-2 mb-2 rounded">
                        <p className="mb-0 small">{comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="pt-2">
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)} size="sm">
              <i className="bi bi-x-circle me-1"></i>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      <Footer />
    </div>
    </ProtectedRoute>
  );
}
