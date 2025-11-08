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
import FeaturedCategories from "./components/categoriasDestacadas";


import { Dr_Sugiyama } from 'next/font/google';


const drSugiyama = Dr_Sugiyama({
  weight: '400', // Dr Sugiyama solo tiene un peso disponible
  subsets: ['latin'],
});

export default function Home() {
  const { user } = useAuth();
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


  // Función que se llama al hacer click en un producto
  const handleCardClick = (productId: number) => {
    if (!user) {
      // Guardamos la ruta que quería visitar
      sessionStorage.setItem('redirectAfterLogin', `/products/${productId}`);
      router.push('/auth/login'); // Redirigimos a login
    } else {
      router.push(`/products/${productId}`);
    }
  };

  
  // 🌟 FILTRAR PRODUCTOS DESTACADOS que tienen stock
  const featuredProducts = allProductsWithStock.filter(p => p.featured && p.inStock);

  useEffect(() => {
    const handleFavUpdate = () => setFavsUpdate(prev => prev + 1);
    window.addEventListener("favourites-updated", handleFavUpdate);

    return () => window.removeEventListener("favourites-updated", handleFavUpdate);
  }, []);


  useEffect(() => {
  if (user) {
    const redirect = sessionStorage.getItem('redirectAfterLogin');
    if (redirect) {
      router.push(redirect);
      sessionStorage.removeItem('redirectAfterLogin'); // Limpiamos
    } else {
      router.push('/'); // Ruta por defecto si no había producto
    }
  }
}, [user]);


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
        <FeaturedCategories/>

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
      <Footer/>

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
          <Container className="py-2 py-lg-5 py-md-2 py-sm-2">
          <div className='flex flex-column justify-center'>
              <h1 className="fw-bold text-center" style={{fontSize: "2em", color: "var(--cosmetic-tertiary)" }}>Bienvenido a</h1>
              <div className='flex flex-row justify-center'>
                <h1 className={`${drSugiyama.className} px-3 fw-bold text-center`} style={{fontSize: "4em", color: "var(--cosmetic-tertiary)", alignContent: "center",}}>  Tiffany's </h1>
                <div style={{display: "flex", justifyContent: "center", alignItems: "center",}}>           
                  <h1 className="fw-bold text-center " style={{fontSize: "2em", color: "var(--cosmetic-tertiary)" }}>suministros y variedades</h1>
                </div>
              </div>



          </div>
            <h3 className="fw-bold text-center mt-5" style={{fontSize:"2.8em", color: "var(--cosmetic-primary)" }}>Productos destacados</h3>

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
