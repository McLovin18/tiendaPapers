"use client";

import React, { useState } from "react";
import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import TopbarMobile from "../../components/TopbarMobile";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Footer from "../../components/Footer";
import { useProducts } from "../../hooks/useProducts";
import CATEGORIES from "@/app/constants/categories";
import { notFound } from "next/navigation";

// ✅ genera rutas estáticas para cada categoría
export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    category: cat.value,
  }));
}

const ProductsByCategoryPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { category } = useParams(); // /products/[category]

  // buscar la categoría en tu constante global
  const categoryInfo = CATEGORIES.find((c) => c.value === category);

  // si no existe la categoría -> 404
  if (!categoryInfo) {
    return notFound();
  }

  // hook para traer productos de la categoría
  const { products, loading } = useProducts(`/${category}`);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "var(--cosmetic-secondary)" }}
    >
      {/* ✅ Topbar solo en móviles */}
      {user && <TopbarMobile />}

      <div className="d-flex flex-grow-1">
        {/* ✅ Sidebar solo en pantallas grandes */}
        {user && <Sidebar />}

        <main className="flex-grow-1 w-100">
          <Container className="py-5">
            {/* Título y descripción dinámicos */}
            <h1 className="fw-bold text-center mb-5">
              {categoryInfo.icon || "🛍️"} {categoryInfo.label}
            </h1>
            {categoryInfo.description && (
              <p className="text-center text-muted mb-4">
                {categoryInfo.description}
              </p>
            )}

            {/* Barra de búsqueda */}
            <div className="d-flex justify-content-center mb-4">
              <form className="w-100" style={{ maxWidth: 500 }}>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder={`Buscar ${categoryInfo.label.toLowerCase()}...`}
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

            {/* Productos */}
            <Row className="g-4">
              {loading ? (
                <Col xs={12} className="text-center py-5">
                  <Spinner
                    animation="border"
                    style={{ color: "var(--cosmetic-primary)" }}
                  />
                  <h4 className="mt-3 text-muted">Cargando productos...</h4>
                  <p className="text-muted">
                    Obteniendo {categoryInfo.label.toLowerCase()}
                  </p>
                </Col>
              ) : filteredProducts.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <i
                    className="bi bi-emoji-frown"
                    style={{ fontSize: "2.5rem", color: "#888" }}
                  ></i>
                  <h4 className="mt-3 text-muted">
                    No se encontraron {categoryInfo.label.toLowerCase()}
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
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        transform: "scale(1)",
                      }}
                      onClick={() => handleCardClick(product.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 10px rgba(0,0,0,0.1)";
                      }}
                    >
                      {/* Imagen */}
                      <div
                        className="position-relative bg-cosmetic-secondary"
                        style={{
                          width: "auto",
                          height: "300px",
                          margin: "0 auto",
                          background: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "1rem 1rem 0 0",
                          overflow: "hidden",
                        }}
                      >
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={200}
                            height={300}
                            style={{
                              objectFit: "contain",
                              maxWidth: "100%",
                              maxHeight: "100%",
                              margin: "0 auto",
                            }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title
                            className="fw-bold h6 mb-2"
                            style={{ lineHeight: "1.3" }}
                          >
                            {product.name}
                          </Card.Title>
                          <Card.Text
                            className="fw-bold fs-5 mb-2"
                            style={{ color: "var(--cosmetic-primary)" }}
                          >
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

export default ProductsByCategoryPage;