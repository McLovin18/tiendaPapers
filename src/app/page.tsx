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
import { getSeasonalDiscountConfig, type SeasonalDiscountConfig } from './services/seasonalDiscountService';


import { Dr_Sugiyama } from 'next/font/google';


const drSugiyama = Dr_Sugiyama({
  weight: '400', // Dr Sugiyama solo tiene un peso disponible
  subsets: ['latin'],
});

export default function Home() {
  const { user } = useAuth();
  const [favsUpdate, setFavsUpdate] = useState(0);
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [seasonalConfig, setSeasonalConfig] = useState<SeasonalDiscountConfig | null>(null);
  const [loadingSeasonal, setLoadingSeasonal] = useState(false);


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
    router.push(`/products/${productId}`);
  };

  
  // 🌟 FILTRAR PRODUCTOS DESTACADOS que tienen stock
  const featuredProducts = allProductsWithStock.filter(p => p.featured && p.inStock);

  // Productos con descuento de temporada (ordenados por mayor descuento)
  const discountedProducts = React.useMemo(() => {
    if (loadingSeasonal) return [] as any[];
    if (!seasonalConfig || !seasonalConfig.products || seasonalConfig.products.length === 0) return [] as any[];

    const todayStr = new Date().toISOString().split('T')[0];
    const isActiveNow =
      seasonalConfig.isActive &&
      (!seasonalConfig.startDate || seasonalConfig.startDate <= todayStr) &&
      (!seasonalConfig.endDate || seasonalConfig.endDate >= todayStr);

    if (!isActiveNow) return [] as any[];

    // Mapear por ID para encontrar datos de producto
    const productMap = new Map<number, any>();
    allProductsWithStock.forEach((p) => {
      productMap.set(p.id, p);
    });

    const detailed = seasonalConfig.products
      .map((item) => {
        const base = productMap.get(item.productId);
        if (!base) return null;
        const discountPercent = item.discountPercent;
        const discountedPrice = Math.max(0, base.price * (1 - discountPercent / 100));
        return { ...base, discountPercent, discountedPrice };
      })
      .filter(Boolean) as any[];

    // Ordenar por mayor descuento
    detailed.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));

    return detailed.slice(0, 4);
  }, [seasonalConfig, allProductsWithStock, loadingSeasonal]);

  useEffect(() => {
    const handleFavUpdate = () => setFavsUpdate(prev => prev + 1);
    window.addEventListener("favourites-updated", handleFavUpdate);

    return () => window.removeEventListener("favourites-updated", handleFavUpdate);
  }, []);



    useEffect(() => {
      const updateNavbarHeight = () => {
        const nav = document.getElementById("main-navbar");
        if (!nav) return;
  
        const height = nav.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--navbar-height", `${height}px`);
      };
  
      // calcular al inicio
      updateNavbarHeight();
  
      // recalcular cada vez que se abre/cierra el menú
      setTimeout(updateNavbarHeight, 20);
  
      window.addEventListener("resize", updateNavbarHeight);
      return () => window.removeEventListener("resize", updateNavbarHeight);
    }, [expanded]);

  // Cargar configuración pública de descuentos de temporada
  useEffect(() => {
    const loadSeasonal = async () => {
      try {
        setLoadingSeasonal(true);
        const config = await getSeasonalDiscountConfig();
        setSeasonalConfig(config);
      } catch (err) {
        console.error('Error cargando configuración de descuentos de temporada:', err);
      } finally {
        setLoadingSeasonal(false);
      }
    };

    loadSeasonal();
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

      {/* Sección de descuentos de temporada (solo si hay campaña activa) */}
      {discountedProducts.length > 0 && (
        <Container className="py-4" style={{ backgroundColor: "var(--cosmetic-secondary)" }}>
          <div
            className="shadow-sm mx-auto"
            style={{
              borderRadius: '1.5rem',
              background: 'linear-gradient(135deg, #ffe9e0 0%, #fff 60%, #ffe9e0 100%)',
              border: '1px solid rgba(0,0,0,0.04)',
              padding: '1.6rem 1.8rem',
              maxWidth: '1120px'
            }}
          >
            <Row className="mb-4 justify-content-center">
              <Col xs={12} md={10} lg={9} className="text-center">
                <h2
                  className="fw-bold mb-0"
                  style={{
                    color: 'var(--cosmetic-primary)',
                    fontSize: '1.9rem',
                    letterSpacing: '0.03em'
                  }}
                >
                  Disfruta de increíbles descuentos por {seasonalConfig?.reasonLabel || 'nuestra campaña especial'}
                </h2>
              </Col>
            </Row>

            <Row>
              {discountedProducts.map((product) => (
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
                        height: '260px',
                        margin: '0 auto',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '1rem 1rem 0 0',
                        overflow: 'hidden'
                      }}
                    >
                      {product.discountPercent && (
                        <div
                          className="position-absolute"
                          style={{
                            top: '0.5rem',
                            right: '0.5rem',
                            transform: 'rotate(8deg)',
                            backgroundColor: '#e53935',
                            color: '#fff',
                            padding: '0.45rem 1.7rem',
                            borderRadius: '0.7rem',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                          }}
                        >
                          <span
                            style={{
                              fontSize: '1.3rem',
                              fontWeight: 800,
                              lineHeight: 1
                            }}
                          >
                            -{product.discountPercent}%
                          </span>
                          <span
                            style={{
                              fontSize: '0.8rem',
                              letterSpacing: '0.12em',
                              fontWeight: 600
                            }}
                          >
                            OFF
                          </span>
                        </div>
                      )}
                      {product.images && product.images[0] && (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={200}
                          height={260}
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
                      {product.discountedPrice !== undefined && product.discountPercent ? (
                        <>
                          <Card.Text className="mb-1" style={{ textDecoration: 'line-through', color: '#888' }}>
                            ${product.price.toFixed(2)}
                          </Card.Text>
                          <Card.Text className="fw-bold mb-2" style={{ color: "var(--cosmetic-primary)", fontSize: '1.2rem' }}>
                            ${product.discountedPrice.toFixed(2)}
                          </Card.Text>
                        </>
                      ) : (
                        <Card.Text className="fw-bold mb-2" style={{ color: "var(--cosmetic-primary)", fontSize: '1.2rem' }}>
                          ${product.price.toFixed(2)}
                        </Card.Text>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            <div className="text-center mt-1 mt-md-2">
              <Button
                onClick={() => router.push('/products')}
                className="rounded-1 px-4"
                style={{ backgroundColor: "var(--cosmetic-primary)" }}
              >
                Ver productos
              </Button>
            </div>
          </div>
        </Container>
      )}

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
            <div className="flex flex-col items-center text-center">
              <h1 className="font-bold text-cosmetic-tertiary text-2xl md:text-3xl">
                Bienvenido a
              </h1>

              <div className="flex flex-col md:flex-row items-center justify-center">
                <h1
                  className={`${drSugiyama.className} font-bold text-cosmetic-tertiary
                  text-5xl md:text-6xl lg:text-7xl leading-none px-2`}
                >
                  Tiffany's
                </h1>

                <h1 className="font-bold text-cosmetic-tertiary
                  text-xl md:text-2xl lg:text-3xl leading-tight mt-2 md:mt-0">
                  suministros y variedades
                </h1>
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
