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
        
        <main className="flex-grow-1 p-3">
          <Container fluid>
            {/* Header */}
            <Row className="mb-4">
              <Col>
                <h2 className="fw-bold mb-2">
                  <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
                  Estadísticas de Repartidores
                </h2>
                <p className="text-muted">Rendimiento y calificaciones del equipo de delivery</p>
              </Col>
              <Col xs="auto">
                <Button variant="outline-primary" onClick={loadDeliveryStats}>
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Actualizar
                </Button>
              </Col>
            </Row>

            {error && (
              <Alert variant="danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {/* Resumen general */}
            {deliveryStats.length > 0 && (
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-primary">{deliveryStats.length}</h3>
                      <p className="text-muted mb-0 small">Repartidores Activos</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-success">
                        {deliveryStats.filter(d => d.averageRating > 0).length > 0 
                          ? `${(deliveryStats.filter(d => d.averageRating > 0).reduce((sum, d) => sum + d.averageRating, 0) / deliveryStats.filter(d => d.averageRating > 0).length).toFixed(1)}/5`
                          : '0/5'
                        }
                      </h3>
                      <p className="text-muted mb-0 small">Calificación Promedio</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-info">
                        {deliveryStats.reduce((sum, d) => sum + d.totalDeliveries, 0)}
                      </h3>
                      <p className="text-muted mb-0 small">Total Entregas</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-warning">
                        {deliveryStats.reduce((sum, d) => sum + d.totalRatings, 0)}
                      </h3>
                      <p className="text-muted mb-0 small">Total Calificaciones</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Tabla de repartidores */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-people-fill me-2"></i>
                  Ranking de Repartidores
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                {deliveryStats.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="mt-3 text-muted">No hay datos disponibles</h5>
                    <p className="text-muted">Los repartidores aparecerán aquí cuando reciban calificaciones.</p>
                  </div>
                ) : (
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
                                      {/* Estrella vacía de fondo */}
                                      <i className="bi bi-star text-muted small"></i>
                                      {/* Estrella llena o parcial */}
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
                )}
              </Card.Body>
            </Card>
          </Container>
        </main>
      </div>

      {/* Modal de detalles */}
      {selectedDelivery && (
        <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <i className="bi bi-person-circle me-2"></i>
              {selectedDelivery.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <h6 className="fw-bold mb-3">Estadísticas Generales</h6>
                <div className="mb-2">
                  <strong>Email:</strong> {selectedDelivery.email}
                </div>
                <div className="mb-2">
                  <strong>Total Entregas:</strong> {selectedDelivery.totalDeliveries}
                </div>
                <div className="mb-2">
                  <strong>Total Calificaciones:</strong> {selectedDelivery.totalRatings}
                </div>
                <div className="mb-3">
                  <strong>Calificación Promedio:</strong> 
                  <Badge bg={getRatingColor(selectedDelivery.averageRating)} className="ms-2">
                    {selectedDelivery.averageRating.toFixed(1)} ⭐
                  </Badge>
                </div>

                <h6 className="fw-bold mb-3">Distribución de Calificaciones</h6>
                {Object.entries(selectedDelivery.ratingsBreakdown).map(([rating, count]) => (
                  <div key={rating} className="d-flex justify-content-between mb-1">
                    <span>{rating} ⭐</span>
                    <Badge bg="secondary">{count}</Badge>
                  </div>
                ))}
              </Col>
              
              <Col md={6}>
                <h6 className="fw-bold mb-3">Comentarios Recientes</h6>
                {selectedDelivery.recentComments.length === 0 ? (
                  <p className="text-muted">No hay comentarios disponibles</p>
                ) : (
                  <div className="comments-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedDelivery.recentComments.map((comment, index) => (
                      <div key={index} className="border-start border-3 border-primary ps-3 mb-3">
                        <p className="mb-1 small">{comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
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
