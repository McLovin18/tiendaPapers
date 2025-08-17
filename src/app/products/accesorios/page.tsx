"use client";

import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import TopbarMobile from "../../components/TopbarMobile";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Footer from "../../components/Footer";
import { useProducts } from "../../hooks/useProducts";

const ProductsAccesoriosPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();


  const handleCardClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  
  // Usar el hook personalizado para cargar productos de la categoría accesorios
  const { products, loading } = useProducts("/accesorios");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="d-flex flex-column min-vh-100" style={{backgroundColor: "var(--cosmetic-secondary)"}}>
      {/* ✅ Topbar solo en móviles */}
      {user && <TopbarMobile />}

      <div className="d-flex flex-grow-1">
        {/* ✅ Sidebar solo en pantallas grandes */}
        {user && <Sidebar />}

        <main className="flex-grow-1 w-100">
          <Container className="py-5 py-lg-5 py-md-2 py-sm-2">
            <h1 className="fw-bold text-center mb-5">💅 Accesorios de Belleza</h1>
            <p className="text-center text-muted mb-4">
              Herramientas y accesorios profesionales para completar tu rutina de belleza. Brochas, esponjas y más.
            </p>

            <div className="d-flex justify-content-center mb-4">
              <form className="w-100" style={{ maxWidth: 500 }}>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Buscar accesorios de belleza..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-control rounded-start-pill"
                  />
                  <span className="input-group-text bg-white border-0 rounded-end-pill">
                    <i className="bi bi-search"></i>
                  </span>
                </div>
              </form>
            </div>

            <Row className="g-4">
              {loading ? (
                <Col xs={12} className="text-center py-5">
                  <Spinner animation="border" style={{ color: "var(--cosmetic-primary)" }} />
                  <h4 className="mt-3 text-muted">Cargando productos...</h4>
                  <p className="text-muted">Obteniendo accesorios de belleza</p>
                </Col>
              ) : filteredProducts.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <i
                    className="bi bi-emoji-frown"
                    style={{ fontSize: "2.5rem", color: "#888" }}
                  ></i>
                  <h4 className="mt-3 text-muted">
                    No se encontraron accesorios
                  </h4>
                  <p className="text-muted">
                    Intenta con otro término de búsqueda
                  </p>
                </Col>
              ) : (
                filteredProducts.map((product) => (
                  <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <Card 
                      className="h-100 border-0 shadow-sm product-card"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: 'scale(1)'
                      }}
                      onClick={() => handleCardClick(product.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
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
                          <Card.Title className="fw-bold h6 mb-2" style={{ lineHeight: '1.3' }}>
                            {product.name}
                          </Card.Title>
                          <Card.Text className="fw-bold fs-5 mb-2" style={{ color: "var(--cosmetic-primary)" }}>
                            ${product.price.toFixed(2)}
                          </Card.Text>
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
      <Footer />
    </div>
  );
};

export default ProductsAccesoriosPage;
