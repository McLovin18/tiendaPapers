'use client';

import React, { useState } from 'react';
import FavouriteButton from "../components/FavouriteButton";
import { Container, Row, Col, Card, Button, Form, Pagination, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import TopbarMobile from '../components/TopbarMobile';
import allProducts from './productsData';

const ProductsPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState(allProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 4;

  // Usar allProducts directamente para el catálogo completo

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  // Filtrar productos por búsqueda en el nombre
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="d-flex justify-content-center mb-4">
              <Form className="w-100" style={{ maxWidth: 500 }}>
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
              </Form>
            </div>
            <Row className="g-4">
              {filteredProducts.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <i className="bi bi-emoji-frown" style={{ fontSize: '2.5rem', color: '#888' }}></i>
                  <h4 className="mt-3 text-muted">No se encontraron productos</h4>
                </Col>
              ) : (
                filteredProducts.map((product) => (
                  <Col key={product.id} xs={12} sm={6} md={3}>
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
                      </div>
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title className="fw-bold">{product.name}</Card.Title>
                          <Card.Text className="text-primary fw-bold fs-5 mb-2">
                            ${product.price.toFixed(2)}
                          </Card.Text>
                        </div>

                        <div className="d-flex gap-2">
                          <Button 
                            as={Link} 
                            href={`/products/${product.id}`} 
                            variant="dark" 
                            className="flex-grow-1 rounded-1"
                          >
                            Ver Detalles
                          </Button>

                          <FavouriteButton 
                            product={{
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.images?.[0] || "",
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
          </Container>
        </main>
      </div>
      
      <footer className="bg-light text-dark py-5 border-top">
        <Container>
          <Row>
            <Col md={3}>
              <h5 className="fw-bold mb-3">Comprar</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/products/mujer" className="text-dark text-decoration-none">Mujer</Link></li>
                <li className="mb-2"><Link href="/products/hombre" className="text-dark text-decoration-none">Hombre</Link></li>
                <li className="mb-2"><Link href="/products/ninos" className="text-dark text-decoration-none">Niños</Link></li>
                <li className="mb-2"><Link href="/products/bebe" className="text-dark text-decoration-none">Bebé</Link></li>
                <li className="mb-2"><Link href="/products/sport" className="text-dark text-decoration-none">Sport</Link></li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="fw-bold mb-3">Información Corporativa</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/about" className="text-dark text-decoration-none">Acerca de nosotros</Link></li>
                <li className="mb-2"><Link href="/sustainability" className="text-dark text-decoration-none">Sostenibilidad</Link></li>
                <li className="mb-2"><Link href="/press" className="text-dark text-decoration-none">Sala de prensa</Link></li>
                <li className="mb-2"><Link href="/investors" className="text-dark text-decoration-none">Relación con inversores</Link></li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="fw-bold mb-3">Ayuda</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/customer-service" className="text-dark text-decoration-none">Servicio al cliente</Link></li>
                <li className="mb-2"><Link href="/my-account" className="text-dark text-decoration-none">Mi cuenta</Link></li>
                <li className="mb-2"><Link href="/store-locator" className="text-dark text-decoration-none">Encontrar tiendas</Link></li>
                <li className="mb-2"><Link href="/legal" className="text-dark text-decoration-none">Términos legales</Link></li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="fw-bold mb-3">Únete a nosotros</h5>
              <p>Recibe noticias sobre nuevas colecciones y ofertas exclusivas</p>
              <div className="d-flex gap-3 mt-3">
                <Link href="#" className="text-dark fs-5"><i className="bi bi-facebook"></i></Link>
                <Link href="#" className="text-dark fs-5"><i className="bi bi-instagram"></i></Link>
                <Link href="#" className="text-dark fs-5"><i className="bi bi-twitter"></i></Link>
                <Link href="#" className="text-dark fs-5"><i className="bi bi-youtube"></i></Link>
              </div>
            </Col>
          </Row>
          <hr className="my-4" />
          <div className="text-center">
            <p className="small">&copy; {new Date().getFullYear()} Fashion Store. Todos los derechos reservados.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default ProductsPage;