'use client';

import React, { useState, useEffect } from 'react';
import FavouriteButton from "../components/FavouriteButton";
import { Container, Row, Col, Card, Button, Form, Pagination, Badge, Modal, Accordion, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import TopbarMobile from '../components/TopbarMobile';
import Footer from "../components/Footer";
import { useProducts } from '../hooks/useProducts';


const ProductsPage = () => {
  const { user } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Productos por página responsivo: 24 en desktop (6 filas x 4 productos), 6 en mobile (6 filas x 1 producto)
  const productsPerPage = isMobile ? 6 : 24;

  // Filtrar productos por búsqueda, beneficios y disponibilidad
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBenefit = selectedBenefits.length === 0 || selectedBenefits.some(benefit => 
      product.details?.some(detail => detail.toLowerCase().includes(benefit.toLowerCase()))
    );
    const matchesBrand = selectedBrand.length === 0 || selectedBrand.some(brand => 
      product.name.toLowerCase().includes(brand.toLowerCase())
    );
    // Usar directamente la propiedad inStock del producto para mejor rendimiento
    const isAvailable = product.inStock !== false;
    
    return matchesSearch && matchesBenefit && matchesBrand && isAvailable;
  });

  // Calcular productos para la página actual después del filtrado
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Calcular número total de páginas
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Resetear a página 1 cuando cambien los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBenefits, selectedBrand]);

  // Detectar tamaño de pantalla para paginación responsiva
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint de Bootstrap
    };

    // Verificar al cargar la página
    checkIsMobile();

    // Escuchar cambios en el tamaño de ventana
    window.addEventListener('resize', checkIsMobile);

    // Limpiar el listener al desmontar
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Resetear página cuando cambie el modo mobile/desktop
  React.useEffect(() => {
    setCurrentPage(1);
  }, [isMobile]);

  // Obtener todos los beneficios únicos disponibles de los detalles de productos
  const availableBenefits = [...new Set(
    products.flatMap(product => 
      product.details?.flatMap(detail => {
        const keywords = ['hidratante', 'anti-edad', 'nutritivo', 'protección', 'vitamina', 'natural', 'orgánico', 'matificante'];
        return keywords.filter(keyword => detail.toLowerCase().includes(keyword));
      }) || []
    )
  )].sort();
  
  // Obtener marcas/tipos únicos disponibles (basado en palabras clave del nombre)
  const availableBrands = [...new Set(
    products.flatMap(product => {
      const brands = ['premium', 'profesional', 'natural', 'orgánico', 'luxury'];
      return brands.filter(brand => product.name.toLowerCase().includes(brand));
    })
  )].sort();

  // Manejar selección de beneficios
  const handleBenefitToggle = (benefit: string) => {
    setSelectedBenefits(prev => 
      prev.includes(benefit) 
        ? prev.filter(b => b !== benefit)
        : [...prev, benefit]
    );
  };

  // Manejar selección de marcas/tipos
  const handleBrandToggle = (brand: string) => {
    setSelectedBrand(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSelectedBenefits([]);
    setSelectedBrand([]);
  };

  // Cambiar página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Obtener categorías únicas
  const categories = [...new Set(products.map(product => product.category))];

  // Eliminar paginación, mostrar todos los productos
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Eliminar <NavbarComponent /> de aquí, ya que el layout global ya lo incluye */}
      
      {/* Topbar móvil - fuera del flujo flex para que no ocupe espacio vertical */}
      {user && <TopbarMobile />}
      
      <div className="d-flex flex-grow-1">
        {/* Sidebar desktop - solo se muestra en pantallas grandes */}
        {user && <Sidebar />}
        
        <main className="flex-grow-1 w-100">
          <Container className="py-5 py-lg-5 py-md-2 py-sm-2">
            <h1 className="fw-bold text-center mb-5">Catálogo de Productos</h1>
            
            {/* Barra de búsqueda con filtros */}
            <div className="d-flex justify-content-center mb-4">
              <div className="w-100" style={{ maxWidth: 600 }}>
                <div className="d-flex gap-2">
                  {/* Barra de búsqueda */}
                  <div className="flex-grow-1">
                    <div className="input-group">
                      <Form.Control
                        type="text"
                        placeholder="Buscar productos por nombre..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="rounded-start-pill"
                      />
                      <span className="input-group-text bg-white border-0 rounded-end-pill">
                        <i className="bi bi-search"></i>
                      </span>
                    </div>
                  </div>
                  
                  {/* Botón de filtros */}
                  <Button
                    variant="outline-primary"
                    onClick={() => setShowFilters(true)}
                    className="rounded-pill px-3 d-flex align-items-center"
                    style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                  >
                    <i className="bi bi-funnel me-2"></i>
                    <span className="d-none d-sm-inline">Filtros</span>
                    {(selectedBenefits.length > 0 || selectedBrand.length > 0) && (
                      <Badge bg="danger" className="ms-2 rounded-circle" style={{ fontSize: '0.6rem' }}>
                        {selectedBenefits.length + selectedBrand.length}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {/* Filtros activos */}
                {(selectedBenefits.length > 0 || selectedBrand.length > 0) && (
                  <div className="mt-2 d-flex flex-wrap gap-1 align-items-center">
                    <small className="text-muted me-2">Filtros activos:</small>
                    {selectedBenefits.map(benefit => (
                      <Badge 
                        key={benefit} 
                        bg="primary" 
                        className="d-flex align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleBenefitToggle(benefit)}
                      >
                        {benefit} <i className="bi bi-x ms-1"></i>
                      </Badge>
                    ))}
                    {selectedBrand.map(brand => (
                      <Badge 
                        key={brand} 
                        bg="info" 
                        className="d-flex align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleBrandToggle(brand)}
                      >
                        Tipo: {brand} <i className="bi bi-x ms-1"></i>
                      </Badge>
                    ))}
                    <Button
                      variant="link"
                      size="sm"
                      onClick={clearFilters}
                      className="text-decoration-none p-0 ms-1"
                    >
                      <small>Limpiar todo</small>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <Row className="g-4 products-container">
              {productsLoading ? (
                <Col xs={12} className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <h4 className="mt-3 text-muted">Cargando productos...</h4>
                  <p className="text-muted">Obteniendo productos del inventario</p>
                </Col>
              ) : filteredProducts.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <i className="bi bi-emoji-frown" style={{ fontSize: '2.5rem', color: '#888' }}></i>
                  <h4 className="mt-3 text-muted">No se encontraron productos</h4>
                  <p className="text-muted">Intenta ajustar los filtros de búsqueda</p>
                </Col>
              ) : (
                currentProducts.map((product) => (
                  <Col key={product.id} xs={12} sm={6} lg={3}>
                    <Card className="h-100 border-0 shadow-sm">
                      <div
                        className="position-relative"
                        style={{
                          width: 'auto',
                          height: '300px', // o el alto que prefieras
                          margin: '0 auto',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '1rem 1rem 0 0',
                          overflow: 'hidden'
                        }}
                      >
                        {product.images && product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={200} // o el ancho máximo que prefieras
                            height={300}
                            style={{
                              objectFit: 'contain',
                              maxWidth: '100%',
                              maxHeight: '100%',
                              margin: '0 auto'
                            }}
                          />
                        )}
                        {/* 📦 BADGE DE STOCK en la esquina superior derecha */}
                        <div className="position-absolute top-0 end-0 m-2">
                          {!product.inStock ? (
                            <span className="badge bg-secondary fs-6">
                              Agotado
                            </span>
                          ) : (
                            <span className="badge bg-success fs-6">
                              Stock: {(product as any).stockQuantity || 0}
                            </span>
                          )}
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title className="fw-bold">{product.name}</Card.Title>
                          <Card.Text className="text-primary fw-bold fs-5 mb-2">
                            ${product.price.toFixed(2)}
                          </Card.Text>
                        </div>

                        <div className="d-flex gap-2">
                          <Link href={`/products/${product.id}`} className="btn btn-dark flex-grow-1 rounded-1 text-decoration-none">
                            Ver Detalles
                          </Link>

                          <FavouriteButton 
                            product={{
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              images: product.images || [],
                              description: product.description
                            }} 
                          />

                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>

            {/* Información de paginación y controles */}
            {filteredProducts.length > 0 && (
              <div className="mt-5">
                {/* Información de resultados */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="text-muted">
                    Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} productos
                    <div className="small">
                      {isMobile ? '6 filas (1 producto por fila)' : '6 filas (4 productos por fila)'}
                    </div>
                  </div>
                  <div className="text-muted">
                    Página {currentPage} de {totalPages}
                  </div>
                </div>

                {/* Navegación de páginas */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center">
                    <Pagination className="mb-0">
                      {/* Botón Primera página */}
                      <Pagination.First 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        title="Primera página"
                      >
                        <i className="bi bi-chevron-double-left"></i>
                        {!isMobile && <span className="ms-1">Primero</span>}
                      </Pagination.First>
                      
                      {/* Botón Página anterior */}
                      <Pagination.Prev 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        title="Página anterior"
                      >
                        <i className="bi bi-chevron-left"></i>
                        {!isMobile && <span className="ms-1">Anterior</span>}
                      </Pagination.Prev>

                      {/* Páginas numeradas */}
                      {(() => {
                        const items = [];
                        // Mostrar la misma cantidad de páginas en móvil y desktop
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, currentPage + 2);

                        // Mostrar página 1 si no está en el rango visible
                        if (startPage > 1) {
                          items.push(
                            <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>
                              1
                            </Pagination.Item>
                          );
                          if (startPage > 2) {
                            items.push(<Pagination.Ellipsis key="start-ellipsis" />);
                          }
                        }

                        // Páginas en el rango visible
                        for (let page = startPage; page <= endPage; page++) {
                          items.push(
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        }

                        // Mostrar última página si no está en el rango visible
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            items.push(<Pagination.Ellipsis key="end-ellipsis" />);
                          }
                          items.push(
                            <Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>
                              {totalPages}
                            </Pagination.Item>
                          );
                        }

                        return items;
                      })()}

                      {/* Botón Página siguiente */}
                      <Pagination.Next 
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        title="Página siguiente"
                      >
                        {!isMobile && <span className="me-1">Siguiente</span>}
                        <i className="bi bi-chevron-right"></i>
                      </Pagination.Next>
                      
                      {/* Botón Última página */}
                      <Pagination.Last 
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Última página"
                      >
                        {!isMobile && <span className="me-1">Último</span>}
                        <i className="bi bi-chevron-double-right"></i>
                      </Pagination.Last>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </Container>
        </main>
      </div>

      {/* Modal de Filtros */}
      <Modal 
        show={showFilters} 
        onHide={() => setShowFilters(false)} 
        centered
        size="lg"
        fullscreen="sm-down"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-funnel-fill me-2 text-primary"></i>
            Filtrar Productos
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <Row>
            {/* Filtro por Beneficios */}
            <Col md={6} className="mb-4">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-heart me-2 text-danger"></i>
                Beneficios
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {availableBenefits.map(benefit => (
                  <div
                    key={benefit}
                    className={`badge ${
                      selectedBenefits.includes(benefit) 
                        ? 'bg-primary text-white' 
                        : 'bg-light text-dark border'
                    } p-2 fs-6`}
                    style={{ 
                      cursor: 'pointer',
                      minWidth: '80px',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => handleBenefitToggle(benefit)}
                  >
                    {benefit}
                  </div>
                ))}
              </div>
              {selectedBenefits.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    {selectedBenefits.length} beneficio{selectedBenefits.length !== 1 ? 's' : ''} seleccionado{selectedBenefits.length !== 1 ? 's' : ''}
                  </small>
                </div>
              )}
            </Col>

            {/* Filtro por Tipo/Marca */}
            <Col md={6} className="mb-4">
              <h6 className="fw-bold mb-3">
                <i className="bi bi-star me-2 text-warning"></i>
                Tipos Premium
              </h6>
              <div className="d-flex flex-wrap gap-2">
                {availableBrands.map(brand => (
                  <div
                    key={brand}
                    className={`badge ${
                      selectedBrand.includes(brand) 
                        ? 'bg-info text-white' 
                        : 'bg-light text-dark border'
                    } p-2 fs-6`}
                    style={{ 
                      cursor: 'pointer',
                      borderRadius: '0.5rem',
                      transition: 'all 0.2s ease',
                      maxWidth: '120px'
                    }}
                    onClick={() => handleBrandToggle(brand)}
                    title={brand}
                  >
                    <span className="text-truncate">{brand}</span>
                  </div>
                ))}
              </div>
              {selectedBrand.length > 0 && (
                <div className="mt-2">
                  <small className="text-muted">
                    {selectedBrand.length} tipo{selectedBrand.length !== 1 ? 's' : ''} seleccionado{selectedBrand.length !== 1 ? 's' : ''}
                  </small>
                </div>
              )}
            </Col>
          </Row>

          {/* Resumen de filtros */}
          <div className="bg-light p-3 rounded">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Productos encontrados: {filteredProducts.length}</strong>
                <div className="small text-muted">
                  Total de productos: {products.length}
                </div>
              </div>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearFilters}
                disabled={selectedBenefits.length === 0 && selectedBrand.length === 0}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShowFilters(false)}>
            <i className="bi bi-x-circle me-1"></i>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setShowFilters(false)}>
            <i className="bi bi-check-circle me-1"></i>
            Aplicar Filtros ({filteredProducts.length})
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Footer/>
      
    </div>
  );
};

export default ProductsPage;