'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, ProgressBar, ListGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import { ProtectedRoute } from '../../utils/securityMiddleware';
import { 
  migrateProductsToInventory, 
  checkMigrationStatus, 
  clearInventory 
} from '../../services/inventoryMigration';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';

interface MigrationResult {
  total: number;
  success: number;
  errors: number;
  errorDetails: string[];
}

interface MigrationStatus {
  totalInData: number;
  totalInInventory: number;
  migrated: number;
  pending: number;
  pendingIds: number[];
}

export default function InventoryMigrationPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useRole();
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'warning', text: string} | null>(null);

  const handleMigration = async () => {
    if (!confirm('¿Estás seguro de que quieres migrar todos los productos al inventario? Esto puede tardar unos minutos.')) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: 'warning', text: 'Iniciando migración de productos...' });
      
      const result = await migrateProductsToInventory();
      setMigrationResult(result);
      
      if (result.errors === 0) {
        setMessage({ 
          type: 'success', 
          text: `¡Migración completada exitosamente! ${result.success} productos migrados.` 
        });
      } else {
        setMessage({ 
          type: 'warning', 
          text: `Migración completada con algunos errores. ${result.success} exitosos, ${result.errors} errores.` 
        });
      }
      
      // Actualizar estado después de la migración
      await handleCheckStatus();
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error durante la migración: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      setLoading(true);
      const status = await checkMigrationStatus();
      if (status) {
        setMigrationStatus(status);
        setMessage({ 
          type: 'success', 
          text: `Estado verificado: ${status.migrated}/${status.totalInData} productos migrados.` 
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error verificando estado: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClearInventory = async () => {
    try {
      setLoading(true);
      const success = await clearInventory();
      if (success) {
        setMessage({ type: 'success', text: 'Inventario limpiado exitosamente.' });
        setMigrationStatus(null);
        setMigrationResult(null);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error limpiando inventario: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder a la migración de inventario.</p>
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
          
          <main className="flex-grow-1 w-100" style={{ paddingTop: '1rem' }}>
            <Container fluid className="px-2 px-md-4">
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h1 className="fw-bold text-dark mb-1">
                    <i className="bi bi-database-fill-gear me-2"></i>
                    Migración de Inventario
                  </h1>
                  <p className="text-muted mb-0">
                    Transfiere productos de productsData.ts al sistema de inventario
                  </p>
                </div>
              </div>

              {/* Mensaje de estado */}
              {message && (
                <Alert 
                  variant={message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'} 
                  dismissible 
                  onClose={() => setMessage(null)}
                >
                  {message.text}
                </Alert>
              )}

              {/* Estado actual */}
              {migrationStatus && (
                <Row className="mb-4">
                  <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <h3 className="fw-bold text-primary">{migrationStatus.totalInData}</h3>
                        <p className="text-muted mb-0 small">En ProductsData</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <h3 className="fw-bold text-success">{migrationStatus.migrated}</h3>
                        <p className="text-muted mb-0 small">Migrados</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <h3 className="fw-bold text-warning">{migrationStatus.pending}</h3>
                        <p className="text-muted mb-0 small">Pendientes</p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={3}>
                    <Card className="text-center border-0 shadow-sm">
                      <Card.Body>
                        <h3 className="fw-bold text-info">{migrationStatus.totalInInventory}</h3>
                        <p className="text-muted mb-0 small">En Inventario</p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Barra de progreso */}
              {migrationStatus && (
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold">Progreso de Migración</span>
                      <Badge bg="primary">
                        {migrationStatus.migrated}/{migrationStatus.totalInData}
                      </Badge>
                    </div>
                    <ProgressBar 
                      now={(migrationStatus.migrated / migrationStatus.totalInData) * 100}
                      variant={migrationStatus.pending === 0 ? 'success' : 'primary'}
                      style={{ height: '8px' }}
                    />
                    <small className="text-muted">
                      {migrationStatus.pending === 0 ? '¡Migración completa!' : `${migrationStatus.pending} productos pendientes`}
                    </small>
                  </Card.Body>
                </Card>
              )}

              {/* Controles de migración */}
              <Row>
                <Col lg={8}>
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">
                        <i className="bi bi-tools me-2"></i>
                        Herramientas de Migración
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-grid gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                          <div>
                            <h6 className="mb-1">Verificar Estado</h6>
                            <small className="text-muted">
                              Revisa cuántos productos están migrados y cuáles faltan
                            </small>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            onClick={handleCheckStatus}
                            disabled={loading}
                          >
                            <i className="bi bi-search me-2"></i>
                            Verificar
                          </Button>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                          <div>
                            <h6 className="mb-1">Migrar Productos</h6>
                            <small className="text-muted">
                              Transfiere todos los productos de productsData.ts al inventario con stock inicial aleatorio (5-25 unidades)
                            </small>
                          </div>
                          <Button 
                            variant="success" 
                            onClick={handleMigration}
                            disabled={loading}
                          >
                            <i className="bi bi-database-fill-add me-2"></i>
                            Migrar Todo
                          </Button>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 border rounded border-danger">
                          <div>
                            <h6 className="mb-1 text-danger">Limpiar Inventario</h6>
                            <small className="text-muted">
                              ⚠️ PELIGRO: Elimina TODOS los productos del inventario. Usar solo para empezar de cero.
                            </small>
                          </div>
                          <Button 
                            variant="outline-danger" 
                            onClick={handleClearInventory}
                            disabled={loading}
                          >
                            <i className="bi bi-trash me-2"></i>
                            Limpiar Todo
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4}>
                  {/* Resultados de la última migración */}
                  {migrationResult && (
                    <Card className="border-0 shadow-sm">
                      <Card.Header className="bg-light">
                        <h5 className="mb-0">
                          <i className="bi bi-clipboard-data me-2"></i>
                          Último Resultado
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Total procesados:</span>
                          <Badge bg="primary">{migrationResult.total}</Badge>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Exitosos:</span>
                          <Badge bg="success">{migrationResult.success}</Badge>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <span>Errores:</span>
                          <Badge bg="danger">{migrationResult.errors}</Badge>
                        </div>

                        {migrationResult.errorDetails.length > 0 && (
                          <div>
                            <h6 className="text-danger mb-2">Errores encontrados:</h6>
                            <ListGroup variant="flush" className="small">
                              {migrationResult.errorDetails.slice(0, 5).map((error, index) => (
                                <ListGroup.Item key={index} className="px-0 py-1 border-0">
                                  <small className="text-danger">{error}</small>
                                </ListGroup.Item>
                              ))}
                              {migrationResult.errorDetails.length > 5 && (
                                <ListGroup.Item className="px-0 py-1 border-0">
                                  <small className="text-muted">
                                    ... y {migrationResult.errorDetails.length - 5} errores más
                                  </small>
                                </ListGroup.Item>
                              )}
                            </ListGroup>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </Col>
              </Row>

              {loading && (
                <div className="position-fixed top-50 start-50 translate-middle bg-white rounded shadow p-4 text-center" style={{ zIndex: 1050 }}>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Procesando...</span>
                  </div>
                  <p className="mb-0">Procesando migración...</p>
                  <small className="text-muted">Esto puede tardar unos minutos</small>
                </div>
              )}
            </Container>
          </main>
        </div>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
