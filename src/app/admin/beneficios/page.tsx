'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner, Badge, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';
import { inventoryService, type ProductInventory } from '../../services/inventoryService';
import {
  getSeasonalDiscountConfig,
  saveSeasonalDiscountConfig,
  SEASONAL_DISCOUNT_REASONS,
  type SeasonalDiscountConfig,
} from '../../services/seasonalDiscountService';
import { couponService, type AutoCouponConfig, type Coupon } from '../../services/couponService';
import { userNotificationService } from '../../services/userNotificationService';
import { DailyOrder, DailyOrdersDocument, getAllOrderDays } from '../../services/purchaseService';

interface ProductWithDiscount extends ProductInventory {
  discountPercent?: number;
}

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

const BeneficiosPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'seasonal' | 'coupons'>('seasonal');

  const [isActive, setIsActive] = useState(false);
  const [reason, setReason] = useState(SEASONAL_DISCOUNT_REASONS[0].value);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [products, setProducts] = useState<ProductWithDiscount[]>([]);
  const [productDiscounts, setProductDiscounts] = useState<Record<number, number>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para cupones
  const [autoCouponConfig, setAutoCouponConfig] = useState<AutoCouponConfig | null>(null);
  const [loadingAutoConfig, setLoadingAutoConfig] = useState(false);
  const [savingAutoConfig, setSavingAutoConfig] = useState(false);
  const [customers, setCustomers] = useState<{
    userId: string;
    userName?: string;
    userEmail?: string;
    totalOrders: number;
    totalAmount: number;
  }[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [manualCouponPercent, setManualCouponPercent] = useState(25);

  useEffect(() => {
    if (user && isAdmin) {
      loadInitialData();
      loadCouponsData();
    }
  }, [user, isAdmin]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [allProducts, config] = await Promise.all([
        inventoryService.getAllProducts(),
        getSeasonalDiscountConfig(),
      ]);

      const mappedProducts: ProductWithDiscount[] = allProducts.map((p) => ({ ...p }));
      const discounts: Record<number, number> = {};

      if (config) {
        const todayStr = new Date().toISOString().split('T')[0];
        const isExpired = !!config.endDate && config.endDate < todayStr;

        // Si la campaña ya terminó por fecha fin, el switch se muestra desactivado
        setIsActive(isExpired ? false : config.isActive);
        setReason(config.reason);
        setStartDate(config.startDate || '');
        setEndDate(config.endDate || '');

        config.products.forEach((item) => {
          discounts[item.productId] = item.discountPercent;
          const idx = mappedProducts.findIndex((p) => p.productId === item.productId);
          if (idx !== -1) {
            mappedProducts[idx].discountPercent = item.discountPercent;
          }
        });
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        setStartDate(todayStr);
      }

      setProducts(mappedProducts);
      setProductDiscounts(discounts);
    } catch (err: any) {
      console.error('Error cargando configuración de beneficios:', err);
      setError('Error al cargar la configuración de descuentos.');
    } finally {
      setLoading(false);
    }
  };

  const loadCouponsData = async () => {
    try {
      setLoadingAutoConfig(true);
      setLoadingCustomers(true);
      setError(null);

      const [config, days] = await Promise.all([
        couponService.getAutoConfig(),
        getAllOrderDays(),
      ]);

      setAutoCouponConfig(config);

      const customerMap = new Map<string, {
        userId: string;
        userName?: string;
        userEmail?: string;
        totalOrders: number;
        totalAmount: number;
      }>();

      (days || []).forEach((day: DailyOrdersDocument) => {
        (day.orders || []).forEach((order: DailyOrder) => {
          if (!order.userId) return;

          const key = order.userId;
          const existing = customerMap.get(key) || {
            userId: key,
            userName: order.userName,
            userEmail: order.userEmail,
            totalOrders: 0,
            totalAmount: 0,
          };

          existing.totalOrders += 1;
          existing.totalAmount += order.total;
          if (!existing.userName && order.userName) existing.userName = order.userName;
          if (!existing.userEmail && order.userEmail) existing.userEmail = order.userEmail;

          customerMap.set(key, existing);
        });
      });

      const list = Array.from(customerMap.values()).sort((a, b) => b.totalOrders - a.totalOrders);
      setCustomers(list);
    } catch (err: any) {
      console.error('Error cargando datos de cupones:', err);
      setError((prev) => prev || 'Error al cargar datos de cupones y clientes.');
    } finally {
      setLoadingAutoConfig(false);
      setLoadingCustomers(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter((p) =>
      p.name.toLowerCase().includes(term) ||
      p.productId.toString().includes(term) ||
      (p.category || '').toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  const handleDiscountChange = (productId: number, value: string) => {
    const numeric = parseFloat(value);
    setProductDiscounts((prev) => {
      const updated = { ...prev };
      if (isNaN(numeric) || numeric <= 0) {
        delete updated[productId];
      } else {
        updated[productId] = Math.min(90, Math.max(1, numeric));
      }
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!startDate) {
        setError('Debes elegir una fecha de inicio para la campaña.');
        return;
      }

      if (endDate && endDate < startDate) {
        setError('La fecha fin no puede ser anterior a la fecha de inicio.');
        return;
      }

      const selectedProducts = Object.entries(productDiscounts)
        .filter(([, discount]) => discount > 0)
        .map(([productId, discount]) => ({
          productId: Number(productId),
          discountPercent: Math.min(90, Math.max(1, discount)),
        }));

      const reasonData = SEASONAL_DISCOUNT_REASONS.find((r) => r.value === reason) || SEASONAL_DISCOUNT_REASONS[0];

      const payload: SeasonalDiscountConfig = {
        isActive,
        reason,
        reasonLabel: reasonData.label,
        startDate,
         endDate: endDate || undefined,
        products: selectedProducts,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveSeasonalDiscountConfig(payload);
      setSuccess('Configuración de descuentos guardada correctamente.');
    } catch (err: any) {
      console.error('Error guardando configuración de descuentos:', err);
      setError('Error al guardar la configuración.');
    } finally {
      setSaving(false);
    }
  };

  const isConfigLocked = !isActive;

  if (roleLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3 text-muted">Verificando permisos...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Debes iniciar sesión para acceder a esta página.</Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder a Beneficios.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="d-flex flex-column flex-lg-row" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <Sidebar />

      <div className="flex-grow-1 d-flex flex-column">
        <TopbarMobile />

        <main className="flex-grow-1 py-4 px-3 px-md-4" style={{ backgroundColor: 'var(--cosmetic-bg, #f8f9fa)' }}>
          <Container fluid>
            <Row className="mb-4">
              <Col>
                <h2 className="mb-1">Beneficios</h2>
                <p className="text-muted mb-2">
                  Administra descuentos de temporada y cupones especiales para clientes frecuentes.
                </p>
                <ButtonGroup>
                  <Button
                    variant={activeTab === 'seasonal' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setActiveTab('seasonal')}
                  >
                    Descuentos de temporada
                  </Button>
                  <Button
                    variant={activeTab === 'coupons' ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setActiveTab('coupons')}
                  >
                    Cupones
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>

            {error && (
              <Row className="mb-3">
                <Col>
                  <Alert variant="danger">{error}</Alert>
                </Col>
              </Row>
            )}

            {success && (
              <Row className="mb-3">
                <Col>
                  <Alert variant="success">{success}</Alert>
                </Col>
              </Row>
            )}

            {activeTab === 'seasonal' && (
            <Row className="mb-4">
              <Col lg={6} className="mb-3">
                <Card className="shadow-sm">
                  <Card.Header>
                    <strong>Configuración de campaña</strong>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3" controlId="toggleActive">
                      <Form.Check
                        type="switch"
                        label="Activar descuentos de temporada"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      <Form.Text className="text-muted">
                        Cuando está activado y la fecha es válida, la sección de descuentos se mostrará en la página principal.
                      </Form.Text>
                    </Form.Group>

                    <Row className="mb-3">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Label>Razón del descuento</Form.Label>
                        <Form.Select
                          value={reason}
                          onChange={(e) => setReason(e.target.value as any)}
                          disabled={isConfigLocked}
                        >
                          {SEASONAL_DISCOUNT_REASONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                      <Col md={3}>
                        <Form.Label>Fecha inicio</Form.Label>
                        <Form.Control
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          disabled={isConfigLocked}
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>Fecha fin</Form.Label>
                        <Form.Control
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          disabled={isConfigLocked}
                        />
                      </Col>
                    </Row>

                    <div className="mt-2 small text-muted">
                      <p className="mb-1">
                        La sección pública mostrará un mensaje como:
                      </p>
                      <p className="mb-0 fst-italic">
                        "Disfruta de increíbles descuentos por &lt;razón seleccionada&gt;".
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6} className="mb-3">
                <Card className="shadow-sm h-100">
                  <Card.Header>
                    <strong>Resumen rápido</strong>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-2">
                      Estado:{' '}
                      <Badge bg={isActive ? 'success' : 'secondary'}>
                        {isActive ? 'Campaña activa (si fecha válida)' : 'Campaña desactivada'}
                      </Badge>
                    </p>
                    <p className="mb-1">
                      Productos con descuento:{' '}
                      <strong>{Object.keys(productDiscounts).length}</strong>
                    </p>
                    <p className="mb-1 small text-muted">
                      Solo se guardan productos con porcentaje &gt; 0.
                    </p>
                    <Button
                      variant="primary"
                      disabled={saving}
                      onClick={handleSave}
                      className="mt-2"
                    >
                      {saving ? 'Guardando...' : 'Guardar configuración'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            )}

            {activeTab === 'coupons' && (
              <Row className="mb-4">
                <Col lg={5} className="mb-3">
                  <Card className="shadow-sm h-100">
                    <Card.Header>
                      <strong>Configuración de cupones automáticos</strong>
                    </Card.Header>
                    <Card.Body>
                      {loadingAutoConfig ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" />
                          <p className="mt-2 mb-0 text-muted">Cargando configuración...</p>
                        </div>
                      ) : (
                        <>
                          <Form.Group className="mb-3" controlId="autoCouponsActive">
                            <Form.Check
                              type="switch"
                              label="Activar cupones automáticos por número de pedidos"
                              checked={!!autoCouponConfig?.isActive}
                              onChange={async (e) => {
                                if (!autoCouponConfig) {
                                  setAutoCouponConfig({
                                    isActive: e.target.checked,
                                    orderMultiple: 10,
                                    discountPercent: 10,
                                    updatedAt: new Date().toISOString(),
                                  });
                                  return;
                                }
                                setAutoCouponConfig({ ...autoCouponConfig, isActive: e.target.checked });
                              }}
                            />
                            <Form.Text muted>
                              Configura aquí cada cuántos pedidos se generará un cupón automático. Si está desactivado, no se generarán cupones automáticos.
                            </Form.Text>
                          </Form.Group>

                          <Row className="mb-3">
                            <Col md={6} className="mb-3 mb-md-0">
                              <Form.Label>Múltiplo de pedidos</Form.Label>
                              <Form.Control
                                type="number"
                                min={1}
                                value={autoCouponConfig?.orderMultiple ?? 10}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10) || 1;
                                  setAutoCouponConfig((prev) => prev ? {
                                    ...prev,
                                    orderMultiple: value,
                                  } : {
                                    isActive: true,
                                    orderMultiple: value,
                                    discountPercent: 25,
                                    updatedAt: new Date().toISOString(),
                                  });
                                }}
                              />
                              <Form.Text muted>
                                Ejemplo: 10 para clientes muy frecuentes.
                              </Form.Text>
                            </Col>
                            <Col md={6}>
                              <Form.Label>% descuento automático</Form.Label>
                              <Form.Control
                                type="number"
                                min={1}
                                max={90}
                                value={autoCouponConfig?.discountPercent ?? 25}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || 1;
                                  setAutoCouponConfig((prev) => prev ? {
                                    ...prev,
                                    discountPercent: Math.min(90, Math.max(1, value)),
                                  } : {
                                    isActive: true,
                                    orderMultiple: 10,
                                    discountPercent: Math.min(90, Math.max(1, value)),
                                    updatedAt: new Date().toISOString(),
                                  });
                                }}
                              />
                            </Col>
                          </Row>

                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!autoCouponConfig || savingAutoConfig}
                            onClick={async () => {
                              if (!autoCouponConfig) return;
                              try {
                                setSavingAutoConfig(true);
                                await couponService.saveAutoConfig(autoCouponConfig);
                                setSuccess('Configuración de cupones automáticos guardada correctamente.');
                              } catch (err) {
                                console.error('Error guardando configuración de cupones:', err);
                                setError('Error al guardar la configuración de cupones automáticos.');
                              } finally {
                                setSavingAutoConfig(false);
                              }
                            }}
                          >
                            {savingAutoConfig ? 'Guardando...' : 'Guardar configuración'}
                          </Button>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={7} className="mb-3">
                  <Card className="shadow-sm h-100">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>Clientes con pedidos</span>
                      <div className="d-flex align-items-center gap-2">
                        <Form.Label className="mb-0 small">% cupón manual:</Form.Label>
                        <Form.Control
                          type="number"
                          size="sm"
                          style={{ width: '80px' }}
                          min={1}
                          max={90}
                          value={manualCouponPercent}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 1;
                            setManualCouponPercent(Math.min(90, Math.max(1, value)));
                          }}
                        />
                      </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                      {loadingCustomers ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" />
                          <p className="mt-2 mb-0 text-muted">Cargando clientes...</p>
                        </div>
                      ) : customers.length === 0 ? (
                        <div className="text-center py-3">
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
                                <th className="text-end">Total</th>
                                <th className="text-center">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {customers.map((c) => (
                                <tr key={c.userId}>
                                  <td>{c.userName || c.userId}</td>
                                  <td>{c.userEmail || '-'}</td>
                                  <td className="text-center">
                                    <Badge bg="danger">{c.totalOrders}</Badge>
                                  </td>
                                  <td className="text-end">{formatCurrency(c.totalAmount)}</td>
                                  <td className="text-center">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={async () => {
                                        try {
                                          setSaving(true);
                                          const coupon = await couponService.createCouponForUser({
                                            userId: c.userId,
                                            discountPercent: manualCouponPercent,
                                            source: 'manual',
                                          });
                                          setSuccess(`Cupón ${coupon.code} creado para ${c.userName || c.userEmail || c.userId}.`);
                                          await userNotificationService.createCouponNotification({
                                            userId: c.userId,
                                            userEmail: c.userEmail,
                                            couponCode: coupon.code,
                                            discountPercent: coupon.discountPercent,
                                            source: 'manual',
                                          });
                                        } catch (err) {
                                          console.error('Error creando cupón manual:', err);
                                          setError('Error al crear el cupón para este cliente.');
                                        } finally {
                                          setSaving(false);
                                        }
                                      }}
                                    >
                                      Enviar código
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
              </Row>
            )}

            <Row>
              <Col>
                <Card className="shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>Productos disponibles</span>
                    <Form.Control
                      type="text"
                      placeholder="Buscar por nombre, ID o categoría"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={isConfigLocked}
                      style={{ maxWidth: '280px' }}
                      size="sm"
                    />
                  </Card.Header>
                  <Card.Body className="p-0">
                    {loading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" role="status" size="sm" />
                        <p className="mt-2 mb-0 text-muted">Cargando productos...</p>
                      </div>
                    ) : filteredProducts.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="mb-0 text-muted">No se encontraron productos.</p>
                      </div>
                    ) : (
                      <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <Table hover size="sm" className="mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Producto</th>
                              <th className="text-end">Precio</th>
                              <th className="text-center">Descuento %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product) => {
                              const discount = productDiscounts[product.productId] || '';
                              return (
                                <tr key={product.productId}>
                                  <td>{product.productId}</td>
                                  <td>
                                    <div className="fw-semibold">{product.name}</div>
                                    <div className="small text-muted">{product.category || 'Sin categoría'}</div>
                                  </td>
                                  <td className="text-end">{formatCurrency(product.price)}</td>
                                  <td className="text-center" style={{ maxWidth: '120px' }}>
                                    <Form.Control
                                      type="number"
                                      min={0}
                                      max={90}
                                      step={1}
                                      size="sm"
                                      value={discount}
                                      onChange={(e) => handleDiscountChange(product.productId, e.target.value)}
                                      disabled={isConfigLocked}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default BeneficiosPage;
