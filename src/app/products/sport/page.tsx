"use client";

import React, { useState } from "react";
import Footer from "../../components/Footer";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import TopbarMobile from "../../components/TopbarMobile";
import Image from "next/image";
import Link from "next/link";
import { useProducts } from "../../hooks/useProducts";

const ProductsSportPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 USAR EL HOOK UNIFICADO que filtra por stock automáticamente
  const { products, loading } = useProducts("/sport");

  // Filtrar por término de búsqueda
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🔍 Productos de Sport con stock:', {
    total: filteredProducts.length,
    conStock: filteredProducts.filter(p => p.inStock !== false).length
  });

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* ✅ Topbar solo en móviles */}
      {user && <TopbarMobile />}

      <div className="d-flex flex-grow-1">
        {/* ✅ Sidebar solo en pantallas grandes */}
        {user && <Sidebar />}

        <main className="flex-grow-1 w-100">
          <Container className="py-5 py-lg-5 py-md-2 py-sm-2">
            <h1 className="fw-bold text-center mb-5">Colección Deporte</h1>

            <div className="d-flex justify-content-center mb-4">
              <form className="w-100" style={{ maxWidth: 500 }}>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre..."
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
                  <Spinner animation="border" variant="primary" />
                  <h4 className="mt-3 text-muted">Cargando productos...</h4>
                  <p className="text-muted">Verificando stock disponible</p>
                </Col>
              ) : filteredProducts.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <i
                    className="bi bi-emoji-frown"
                    style={{ fontSize: "2.5rem", color: "#888" }}
                  ></i>
                  <h4 className="mt-3 text-muted">
                    No hay productos disponibles
                  </h4>
                  <p className="text-muted">
                    Todos los productos están agotados o no hay productos en esta categoría
                  </p>
                </Col>
              ) : (
                filteredProducts.map((product) => (
                  <Col key={product.id} xs={12} sm={6} md={3}>
                    <Card className="h-100 border-0 shadow-sm">
                      <div
                        className="position-relative"
                        style={{ height: "220px" }}
                      >
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          style={{
                            objectFit: "cover",
                            borderRadius: "1rem 1rem 0 0",
                          }}
                        />
                        {/* 📦 BADGE DE STOCK en la esquina superior derecha */}
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-success fs-6">
                            Stock: {(product as any).stockQuantity || 0}
                          </span>
                        </div>
                      </div>
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title className="fw-bold">
                            {product.name}
                          </Card.Title>
                          <Card.Text className="text-primary fw-bold fs-5 mb-2">
                            ${product.price.toFixed(2)}
                          </Card.Text>
                        </div>
                        <Link href={`/products/${product.id}`} passHref>
                          <Button
                            variant="dark"
                            className="w-100 mt-2 rounded-1"
                          >
                            Ver Detalles
                          </Button>
                        </Link>
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

export default ProductsSportPage;
