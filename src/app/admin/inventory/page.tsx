'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import { inventoryService, type ProductInventory } from '../../services/inventoryService';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';
import ProductFormModal from '../../components/ProductFormModal';

// Componente simple de protección local
const SimpleProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useRole();

  if (adminLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger">
              <h4>Acceso Denegado</h4>
              <p>No tienes permisos para acceder a esta página.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function InventoryManagementPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useRole();
  const [products, setProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductInventory | null>(null);
  const [stockChange, setStockChange] = useState<number>(0);
  const [actionType, setActionType] = useState<'add' | 'reduce'>('add');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user && isAdmin) {
      loadProducts();
    }
  }, [user, isAdmin]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const allProducts = await inventoryService.getAllProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setMessage({type: 'error', text: 'Error al cargar productos'});
    } finally {
      setLoading(false);
    }
  };

  const handleStockChange = async () => {
    if (!selectedProduct || stockChange === 0) return;

    try {
      let success = false;
      
      if (actionType === 'add') {
        success = await inventoryService.addStock(selectedProduct.productId, Math.abs(stockChange));
      } else if (actionType === 'reduce') {
        success = await inventoryService.reduceStock(selectedProduct.productId, Math.abs(stockChange));
      }

      if (success) {
        setMessage({type: 'success', text: `Stock ${actionType === 'add' ? 'agregado' : 'reducido'} exitosamente`});
        await loadProducts();
        setShowStockModal(false);
        setStockChange(0);
      } else {
        setMessage({type: 'error', text: 'Error al actualizar stock'});
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Error al procesar la acción'});
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const success = await inventoryService.deleteProduct(productId);
      
      if (success) {
        setMessage({type: 'success', text: 'Producto eliminado exitosamente'});
        await loadProducts();
      } else {
        setMessage({type: 'error', text: 'Error al eliminar producto'});
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Error al procesar la acción'});
    }
  };

  const openStockModal = (product: ProductInventory, action: 'add' | 'reduce') => {
    setSelectedProduct(product);
    setActionType(action);
    setStockChange(0);
    setShowStockModal(true);
  };

  const openProductModal = (product?: ProductInventory) => {
    setSelectedProduct(product || null);
    setShowProductModal(true);
  };

  const handleProductSaved = () => {
    loadProducts();
    setMessage({type: 'success', text: 'Producto guardado exitosamente'});
  };

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return 'danger';
    if (stock <= 5) return 'warning';
    return 'success';
  };

  if (!user || !isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder a la gestión de inventario.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <SimpleProtectedRoute>
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
                    <i className="bi bi-boxes me-2"></i>
                    Gestión de Inventario
                  </h1>
                  <p className="text-muted mb-0">
                    Controla el stock y disponibilidad de productos
                  </p>
                </div>
                <Button variant="primary" onClick={() => openProductModal()}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Agregar Producto
                </Button>
              </div>

              {/* Mensaje de estado */}
              {message && (
                <Alert 
                  variant={message.type === 'success' ? 'success' : 'danger'} 
                  dismissible 
                  onClose={() => setMessage(null)}
                >
                  {message.text}
                </Alert>
              )}

              {/* Estadísticas rápidas */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-primary">{products.length}</h3>
                      <p className="text-muted mb-0 small">Total Productos</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-success">
                        {products.filter(p => p.stock > 0).length}
                      </h3>
                      <p className="text-muted mb-0 small">Con Stock</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-warning">
                        {products.filter(p => p.stock <= 5 && p.stock > 0).length}
                      </h3>
                      <p className="text-muted mb-0 small">Stock Bajo</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-danger">
                        {products.filter(p => p.stock === 0).length}
                      </h3>
                      <p className="text-muted mb-0 small">Sin Stock</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Tabla de productos */}
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-table me-2"></i>
                    Lista de Productos
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="mt-3 text-muted">Cargando inventario...</p>
                    </div>
                  ) : (
                    <Table responsive striped hover className="mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th>ID</th>
                          <th>Producto</th>
                          <th>Precio</th>
                          <th>Stock</th>
                          <th>Tallas/Colores</th>
                          <th>Última Act.</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.productId}>
                            <td className="fw-bold">{product.productId}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                {product.images && product.images.length > 0 && (
                                  <img 
                                    src={product.images[0]} 
                                    alt={product.name}
                                    width="40" 
                                    height="40" 
                                    className="rounded me-2"
                                    style={{ objectFit: 'cover' }}
                                  />
                                )}
                                <div>
                                  <div className="fw-bold">{product.name}</div>
                                  {product.category && (
                                    <small className="text-muted">{product.category}</small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="fw-bold text-success">${product.price.toFixed(2)}</td>
                            <td>
                              <Badge bg={getStockBadgeVariant(product.stock)}>
                                {product.stock} unidades
                              </Badge>
                            </td>
                            <td>
                              <div>
                                {product.sizes && product.sizes.length > 0 && (
                                  <div className="mb-1">
                                    <small className="text-muted">Tallas: </small>
                                    {product.sizes.slice(0, 3).map((size, index) => (
                                      <Badge key={index} bg="light" text="dark" className="me-1">
                                        {size}
                                      </Badge>
                                    ))}
                                    {product.sizes.length > 3 && (
                                      <Badge bg="light" text="muted">+{product.sizes.length - 3}</Badge>
                                    )}
                                  </div>
                                )}
                                {product.colors && product.colors.length > 0 && (
                                  <div>
                                    <small className="text-muted">Colores: </small>
                                    {product.colors.slice(0, 2).map((color, index) => (
                                      <Badge key={index} bg="secondary" className="me-1">
                                        {color}
                                      </Badge>
                                    ))}
                                    {product.colors.length > 2 && (
                                      <Badge bg="secondary">+{product.colors.length - 2}</Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <small className="text-muted">
                                {new Date(product.lastUpdated).toLocaleDateString()}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline-success"
                                  onClick={() => openStockModal(product, 'add')}
                                  title="Agregar stock"
                                >
                                  <i className="bi bi-plus"></i>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-warning"
                                  onClick={() => openStockModal(product, 'reduce')}
                                  title="Reducir stock"
                                  disabled={product.stock === 0}
                                >
                                  <i className="bi bi-dash"></i>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-primary"
                                  onClick={() => openProductModal(product)}
                                  title="Editar producto"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline-danger"
                                  onClick={() => handleDeleteProduct(product.productId)}
                                  title="Eliminar producto"
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-4 text-muted">
                              No hay productos en el inventario
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </Container>
          </main>
        </div>
        
        <Footer />
        
        {/* Modal para acciones de stock */}
        <Modal show={showStockModal} onHide={() => setShowStockModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <i className={`bi bi-${actionType === 'add' ? 'plus' : 'dash'}-circle me-2`}></i>
              {actionType === 'add' ? 'Agregar Stock' : 'Reducir Stock'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <div>
                <Alert variant="info">
                  <div className="d-flex align-items-center">
                    {selectedProduct.images && selectedProduct.images.length > 0 && (
                      <img 
                        src={selectedProduct.images[0]} 
                        alt={selectedProduct.name}
                        width="50" 
                        height="50" 
                        className="rounded me-3"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <strong>{selectedProduct.name}</strong>
                      <br />
                      <small className="text-muted">Stock actual: {selectedProduct.stock} unidades</small>
                    </div>
                  </div>
                </Alert>
                
                <Form.Group>
                  <Form.Label>
                    <i className={`bi bi-${actionType === 'add' ? 'plus' : 'dash'} me-2`}></i>
                    Cantidad a {actionType === 'add' ? 'agregar' : 'reducir'}:
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max={actionType === 'reduce' ? selectedProduct.stock : undefined}
                    value={stockChange}
                    onChange={(e) => setStockChange(parseInt(e.target.value) || 0)}
                    placeholder="Ingresa la cantidad"
                  />
                  {actionType === 'reduce' && stockChange > selectedProduct.stock && (
                    <Form.Text className="text-danger">
                      No puedes reducir más stock del disponible
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStockModal(false)}>
              <i className="bi bi-x me-2"></i>
              Cancelar
            </Button>
            <Button 
              variant={actionType === 'add' ? 'success' : 'warning'} 
              onClick={handleStockChange}
              disabled={stockChange <= 0 || (actionType === 'reduce' && stockChange > (selectedProduct?.stock || 0))}
            >
              <i className={`bi bi-${actionType === 'add' ? 'plus' : 'dash'} me-2`}></i>
              {actionType === 'add' ? 'Agregar Stock' : 'Reducir Stock'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para crear/editar producto */}
        <ProductFormModal
          show={showProductModal}
          onHide={() => setShowProductModal(false)}
          product={selectedProduct}
          onProductSaved={handleProductSaved}
        />
      </div>
    </SimpleProtectedRoute>
  );
}
