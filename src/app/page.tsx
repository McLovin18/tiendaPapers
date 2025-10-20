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

import { Dr_Sugiyama } from 'next/font/google';


const drSugiyama = Dr_Sugiyama({
  weight: '400', // Dr Sugiyama solo tiene un peso disponible
  subsets: ['latin'],
});

export default function Home() {
  const { user } = useAuth();
  const [favSuccess, setFavSuccess] = useState<string | null>(null);
  const [favsUpdate, setFavsUpdate] = useState(0);
  const router = useRouter();

  const imagenes = [
    { 
      src: "/banner.jpg",
      alt: "Engrapadora y útiles de oficina",
      titulo: "Útiles de oficina esenciales",
      descripcion: "Cuadernos, hojas, libretas y todo lo que necesitas en tu día a día.",
      botonTexto: "Explorar ahora",
      botonLink: "#productosDestacados"
    },
    { 
      src: "/banner2.jpg",
      alt: "Ofertas en suministros de oficina",
      titulo: "Compra lo que necesites de suministro y más aquí",
      descripcion: "Artículos a muy buen precio, que necesitas para la escuela o trabajo.",
      botonTexto: "Comprar ya",
      botonLink: "/products"

    },
  ];
  
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
      <Carousel className="mb-4" controls={true} indicators={true} interval={null}>
        {imagenes.map((img, index) => (
          <Carousel.Item key={index}>
            <div style={{ height: '500px', position: 'relative' }}>
              <Image 
                src={img.src}
                alt={img.alt} 
                fill 
                style={{ objectFit: 'cover' }}
              />

              {/* Overlay marrón con opacidad */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(139, 69, 19, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 2rem'
                }}
              >
                <div className="text-start text-white">
                  <h2 className="display-4 fw-bold">{img.titulo}</h2>
                  <p className="lead">{img.descripcion}</p>
                  <Button
                  onClick={() => router.push(img.botonLink)} // 👈 Aquí usamos el link

                   variant="cosmetic-primary" size="lg" className="bg-cosmetic-primary mt-3">

                    {img.botonTexto}
                  </Button>
                </div>
              </div>
            </div>
          </Carousel.Item>

        ))} 
      </Carousel>

      
      {/* Sección de categorías */}
      <Container className="py-4">
        <h2 className="text-center mb-4 fw-bold" style={{fontSize: "2rem", color: "var(--cosmetic-tertiary)" }}>Categorías Destacadas</h2>
        <Row>
          <Col md={4} className="mb-4">
            <div className="position-relative hover-scale" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
              <Image 
                src="https://thafd.bing.com/th/id/OIP.WgVvXcg5LIhbdfljZ8h8yQHaJQ?w=145&h=181&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3" 
                alt="Papeleria" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'linear-gradient(to top, rgba(58,48,41,0.8), transparent)' }}>
                <h3 className="text-white fw-bold mb-3">Papeleria</h3>
                <Link href="/categories/papeleria" className="btn rounded-1 btn-cosmetic-primary px-4 text-decoration-none">Ver Colección</Link>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="position-relative hover-scale" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
              <Image 
                src="data:image/webp;base64,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" 
                alt="Escritura" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'linear-gradient(to top, rgba(58,48,41,0.8), transparent)' }}>
                <h3 className="text-white fw-bold mb-3">Escritura</h3>
                <Link href="/categories/escritura"  className="btn btn-cosmetic-primary rounded-1 px-4 text-decoration-none">Ver Colección</Link>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="position-relative hover-scale" style={{ height: '400px', borderRadius: '1rem', overflow: 'hidden' }}>
              <Image 
                src="https://tse2.mm.bing.net/th/id/OIP.gJX1OtHZehmTYcpHsOJMHwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" 
                alt="Accesorios" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center" style={{ background: 'linear-gradient(to top, rgba(58,48,41,0.8), transparent)' }}>
                <h3 className="text-white fw-bold mb-3">Accesorios</h3>
                <Link href="/categories/accesorios" className="btn btn-cosmetic-primary rounded-1 px-4 text-decoration-none">Ver Colección</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Sección de productos destacados */}
      <Container id='productosDestacados' className="py-5" style={{ backgroundColor: "var(--cosmetic-secondary)" }}>
        <h2 className="text-center mb-4 fw-bold" style={{fontSize: "2rem", color: "var(--cosmetic-tertiary)" }}>Productos Destacados</h2>
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
                  className="h-100 border-0 shadow-sm card-cosmetic hover-scale bg-cosmetic-secondary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCardClick(product.id)}
                >
                  <div
                    className="position-relative bg-cosmetic-secondary"
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
                <li className="mb-2"><Link href="/categories/papeleria" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Papelería</Link></li>
                <li className="mb-2"><Link href="/categories/escritura" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Escritura</Link></li>
                <li className="mb-2"><Link href="/categories/organizacion" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Organización</Link></li>
                <li className="mb-2"><Link href="/categories/accesorios" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Accesorios</Link></li>
              </ul>
            </Col>

            <Col md={4}>
              <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Contacto</h5>
              <p className="mb-1" style={{ color: "var(--cosmetic-tertiary)" }}>Email: tiffanysvariedades@gmail.com</p>
              <p className="mb-0" style={{ color: "var(--cosmetic-tertiary)" }}>Teléfono: +593 98 727 5333</p>
            </Col>
          </Row>
          <hr className="my-4" style={{ borderColor: "var(--cosmetic-accent)" }} />
          <div className="text-center">
            <p className="small" style={{ color: "var(--cosmetic-tertiary)" }}>&copy; {new Date().getFullYear()} Tiffany's Variedades. Todos los derechos reservados.</p>
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
            <h1 className={`${drSugiyama.className} fw-bold text-center mb-5`} style={{fontSize: "3em", color: "var(--cosmetic-tertiary)" }}>Bienvenido a Tiffany's Suministros y variedades</h1>
            <h3 className={`${drSugiyama.className} fw-bold text-center mb-5`} style={{fontSize:"2.8em", color: "var(--cosmetic-primary)" }}>Productos destacados</h3>

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
                      className="h-100 border-0 shadow-sm card-cosmetic bg-cosmetic-secondary"
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
                        className="position-relative bg-cosmetic-secondary"
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
