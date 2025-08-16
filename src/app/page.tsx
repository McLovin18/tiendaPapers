'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { Container, Row, Col, Button, Card, Carousel, Spinner } from 'react-bootstrap';
import NavbarComponent from './components/Navbar';
import Sidebar from './components/Sidebar';
import TopbarMobile from './components/TopbarMobile';
import { useProducts } from './hooks/useProducts';
import { useRouter } from 'next/navigation';
import FavouriteButton from "./components/FavouriteButton";
import Footer from "./components/Footer";

export default function Home() {
  const { user } = useAuth();
  const [favSuccess, setFavSuccess] = useState<string | null>(null);
  const [favsUpdate, setFavsUpdate] = useState(0);
    const router = useRouter();
  
  // 🔥 USAR EL HOOK OPTIMIZADO para productos con stock
  const { products: allProductsWithStock, loading: loadingProducts } = useProducts();

  const handleCardClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };
  
  // 🌟 FILTRAR PRODUCTOS DESTACADOS que tienen stock
  const featuredProducts = allProductsWithStock.filter(p => p.featured && p.inStock);

  useEffect(() => {
    const handleFavUpdate = () => setFavsUpdate(prev => prev + 1);
    window.addEventListener("favourites-updated", handleFavUpdate);

    return () => window.removeEventListener("favourites-updated", handleFavUpdate);
  }, []);

  // Página para usuarios no autenticados (similar a la imagen de referencia)
  const UnauthenticatedHome = () => (
    <div className="d-flex flex-column min-vh-100" style={{backgroundColor: "var(--cosmetic-secondary)"}}>
      

      {/* Carrusel principal */}
      <Carousel className="mb-4" controls={false} indicators={false}>
        <Carousel.Item>
          <div style={{ height: '500px', position: 'relative' }}>
            <Image 
              src= "https://imagenes.heraldo.es/files/og_thumbnail/uploads/imagenes/2018/01/25/_cosmeticanatural_39d1b8d0.jpg"
              alt="Colección de verano" 
              fill 
            />
            <Carousel.Caption className="text-start">
              <h2 className="display-4 fw-bold" style={{ color: "var(--cosmetic-accent)" }}>Nueva Colección</h2>
              <p className="lead" style={{ color: "var(--cosmetic-ac)" }}>Descubre las últimas tendencias en cosméticos</p>
              <Button variant="cosmetic-primary" size="lg" className="mt-3 btn-primary">Comprar ahora</Button>
            </Carousel.Caption>
          </div>
        </Carousel.Item>
      </Carousel>
      
      {/* Sección de categorías */}
      <Container className="py-4">
        <h2 className="text-center mb-4 fw-bold" style={{ color: "var(--cosmetic-tertiary)" }}>Categorías Destacadas</h2>
        <Row>
          <Col md={4} className="mb-4">
            <div className="position-relative hover-scale" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
              <Image 
                src="/images/category-women.svg" 
                alt="Maquillaje" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'linear-gradient(to top, rgba(58,48,41,0.8), transparent)' }}>
                <h3 className="text-white fw-bold mb-3">Maquillaje</h3>
                <Link href="/products/maquillaje" className="btn btn-cosmetic-accent rounded-1 px-4 text-decoration-none">Ver Colección</Link>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="position-relative hover-scale" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
              <Image 
                src="/images/category-men.svg" 
                alt="Cuidado de Piel" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'linear-gradient(to top, rgba(58,48,41,0.8), transparent)' }}>
                <h3 className="text-white fw-bold mb-3">Cuidado de Piel</h3>
                <Link href="/products/cuidado-piel" className="btn btn-cosmetic-accent rounded-1 px-4 text-decoration-none">Ver Colección</Link>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="position-relative hover-scale" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
              <Image 
                src="/images/category-kids.svg" 
                alt="Fragancias" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'linear-gradient(to top, rgba(58,48,41,0.8), transparent)' }}>
                <h3 className="text-white fw-bold mb-3">Fragancias</h3>
                <Link href="/products/fragancias" className="btn btn-cosmetic-accent rounded-1 px-4 text-decoration-none">Ver Colección</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Sección de productos destacados */}
      <Container className="py-5" style={{ backgroundColor: "var(--cosmetic-secondary)" }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: "var(--cosmetic-tertiary)" }}>Productos Destacados</h2>
        {loadingProducts ? (
          <Row className="justify-content-center">
            <Col xs={12} className="text-center py-5">
              <Spinner animation="border" style={{ color: "var(--cosmetic-primary)" }} />
              <h4 className="mt-3" style={{ color: "var(--cosmetic-tertiary)" }}>Cargando productos destacados...</h4>
              <p style={{ color: "var(--cosmetic-tertiary-light)" }}>Verificando stock disponible</p>
            </Col>
          </Row>
        ) : featuredProducts.length === 0 ? (
          <Row className="justify-content-center">
            <Col xs={12} className="text-center py-5">
              <i className="bi bi-emoji-frown" style={{ fontSize: "2.5rem", color: "var(--cosmetic-accent)" }}></i>
              <h4 className="mt-3" style={{ color: "var(--cosmetic-tertiary)" }}>No hay productos destacados disponibles</h4>
              <p style={{ color: "var(--cosmetic-tertiary-light)" }}>Todos los productos destacados están agotados</p>
            </Col>
          </Row>
        ) : (
          <Row>
            {featuredProducts.map((product) => (
              <Col key={product.id} md={3} sm={6} className="mb-4">
                <Card 
                  className="h-100 border-0 shadow-sm card-cosmetic hover-scale"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCardClick(product.id)}
                >
                  <div
                    className="position-relative"
                    style={{
                      width: 'auto',
                      height: '300px',
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
                        width={200}
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
                  
                  <Card.Body className="text-center">
                    <Card.Title className="h6 mb-2" style={{ color: "var(--cosmetic-tertiary)" }}>
                      {product.name}
                    </Card.Title>
                    <Card.Text className="fw-bold mb-2" style={{ color: "var(--cosmetic-primary)", fontSize: "1.2rem" }}>
                      ${product.price.toFixed(2)}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
          ))}
          </Row>
        )}
        
        {!loadingProducts && featuredProducts.length > 0 && (
          <div className="text-center mt-4">
            <Link href="/products" passHref>
              <Button className="rounded-1 px-4" style={{backgroundColor: "var(--cosmetic-primary)"}}>
                Ver todos los productos
              </Button>
            </Link>
          </div>
        )}
      </Container>
      

      {/* Footer */}
      <footer className="footer-cosmetic py-5 mt-auto" style={{backgroundColor: "var(--cosmetic-secondary)"}}>
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Categorías</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/products/maquillaje" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Maquillaje</Link></li>
                <li className="mb-2"><Link href="/products/cuidado-piel" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Cuidado de Piel</Link></li>
                <li className="mb-2"><Link href="/products/fragancias" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Fragancias</Link></li>
                <li className="mb-2"><Link href="/products/accesorios" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Accesorios</Link></li>
              </ul>
            </Col>

            <Col md={4}>
              <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Contacto</h5>
              <p className="mb-1" style={{ color: "var(--cosmetic-tertiary)" }}>Email: lucilaaquino79@gmail.com</p>
              <p className="mb-0" style={{ color: "var(--cosmetic-tertiary)" }}>Teléfono: (593) 99-577-0937</p>
            </Col>
          </Row>
          <hr className="my-4" style={{ borderColor: "var(--cosmetic-accent)" }} />
          <div className="text-center">
            <p className="small" style={{ color: "var(--cosmetic-tertiary)" }}>&copy; {new Date().getFullYear()} Lua Beauty. Todos los derechos reservados.</p>
          </div>
        </Container>
      </footer>
    </div>
  );

  // Página para usuarios autenticados
  const AuthenticatedHome = () => (
    <div className="d-flex flex-column min-vh-100">
      {/* Topbar móvil - fuera del flujo flex para que no ocupe espacio vertical */}
      <TopbarMobile />
      
      <div className="d-flex flex-grow-1">
        {/* Sidebar desktop - solo se muestra en pantallas grandes */}
        <Sidebar />
        
        <main className="flex-grow-1 w-100" style={{ backgroundColor: "var(--cosmetic-secondary)" }}>
          <Container className="py-5 py-lg-5 py-md-2 py-sm-2">
            <h1 className="fw-bold text-center mb-5" style={{ color: "var(--cosmetic-tertiary)" }}>Bienvenido a Lua Beauty</h1>
            <h3 className="fw-bold text-center mb-5" style={{ color: "var(--cosmetic-primary)" }}>Aquí te presentamos los productos destacados</h3>

            {loadingProducts ? (
              <Row className="justify-content-center">
                <Col xs={12} className="text-center py-5">
                  <Spinner animation="border" style={{ color: "var(--cosmetic-primary)" }} />
                  <h4 className="mt-3" style={{ color: "var(--cosmetic-tertiary)" }}>Cargando productos destacados...</h4>
                  <p style={{ color: "var(--cosmetic-tertiary-light)" }}>Verificando stock disponible</p>
                </Col>
              </Row>
            ) : featuredProducts.length === 0 ? (
              <Row className="justify-content-center">
                <Col xs={12} className="text-center py-5">
                  <i className="bi bi-emoji-frown" style={{ fontSize: "2.5rem", color: "var(--cosmetic-accent)" }}></i>
                  <h4 className="mt-3" style={{ color: "var(--cosmetic-tertiary)" }}>No hay productos destacados disponibles</h4>
                  <p style={{ color: "var(--cosmetic-tertiary-light)" }}>Todos los productos destacados están agotados</p>
                </Col>
              </Row>
            ) : (
              <Row className="g-4">
                {featuredProducts.map((product) => (
                  <Col key={`${product.id}-${favsUpdate}`} xs={12} sm={6} md={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm card-cosmetic"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'scale(1)'
                      }}
                      onClick={() => handleCardClick(product.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(140, 156, 132, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(140, 156, 132, 0.1)';
                      }}
                    >
                      {/* Imagen del Producto */}
                      <div
                        className="position-relative"
                        style={{
                          width: 'auto',
                          height: '300px',
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
                            width={200}
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

                      {/* Información del Producto */}
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title className="fw-bold h6 mb-2" style={{ lineHeight: '1.3', color: "var(--cosmetic-tertiary)" }}>
                            {product.name}
                          </Card.Title>
                          <Card.Text className="fw-bold fs-5 mb-2" style={{ color: "var(--cosmetic-primary)" }}>
                            ${product.price.toFixed(2)}
                          </Card.Text>
                        </div>
                      </Card.Body>
                    </Card>
                </Col>
              ))}
              </Row>
            )}

          </Container>
        </main>
      </div>
      <Footer/>


    </div>
  );

  return user ? <AuthenticatedHome /> : <UnauthenticatedHome />;
}
