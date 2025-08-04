"use client";

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import TopbarMobile from "../../components/TopbarMobile";
import Image from "next/image";
import Link from "next/link";
import allProducts from "../productsData";
import Footer from "../../components/Footer";
import { inventoryService, type ProductInventory } from "../../services/inventoryService";

// Tipo combinado para productos estáticos y dinámicos
interface CombinedProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  categoryLink?: string;
  category?: string;
  isFromFirebase?: boolean;
}

const ProductsHombrePage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [firebaseProducts, setFirebaseProducts] = useState<ProductInventory[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos de Firebase al montar el componente
  useEffect(() => {
    const loadFirebaseProducts = async () => {
      try {
        // Usar el método específico para obtener productos de la categoría "hombre"
        const products = await inventoryService.getProductsByCategory("hombre");
        console.log('📦 Productos de Firebase para categoría "hombre":', products);
        setFirebaseProducts(products);
      } catch (error) {
        console.error('❌ Error cargando productos de Firebase:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFirebaseProducts();
  }, []);

  // Combinar productos estáticos y dinámicos
  const allCombinedProducts: CombinedProduct[] = [
    // Productos estáticos filtrados por categoría "hombre"
    ...allProducts
      .filter(product => product.categoryLink === "/hombre")
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        categoryLink: product.categoryLink,
        isFromFirebase: false
      })),
    // Productos de Firebase (ya filtrados por categoría "hombre" en la consulta)
    ...firebaseProducts
      .map(product => ({
        id: product.productId,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
        isFromFirebase: true
      }))
  ];

  // Filtrar por término de búsqueda
  const filteredProducts = allCombinedProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🔍 Productos combinados para Hombre:', {
    estaticos: allProducts.filter(p => p.categoryLink === "/hombre").length,
    firebase: firebaseProducts.filter(p => p.category === "hombre").length,
    total: filteredProducts.length
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
            <h1 className="fw-bold text-center mb-5">Colección Hombre</h1>

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
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando productos...</span>
                  </div>
                  <h4 className="mt-3 text-muted">Cargando productos de hombre...</h4>
                </Col>
              ) : filteredProducts.length === 0 ? (
                <Col xs={12} className="text-center py-5">
                  <i
                    className="bi bi-emoji-frown"
                    style={{ fontSize: "2.5rem", color: "#888" }}
                  ></i>
                  <h4 className="mt-3 text-muted">
                    No se encontraron productos para hombre
                  </h4>
                  {searchTerm && (
                    <p className="text-muted">
                      Intenta con otro término de búsqueda
                    </p>
                  )}
                </Col>
              ) : (
                filteredProducts.map((product) => (
                  <Col key={`${product.isFromFirebase ? 'fb' : 'static'}-${product.id}`} xs={12} sm={6} md={3}>
                    <Card className="h-100 border-0 shadow-sm">
                      <div
                        className="position-relative"
                        style={{ height: "220px" }}
                      >
                        <Image
                          src={product.images[0] || '/images/product1.svg'}
                          alt={product.name}
                          fill
                          style={{
                            objectFit: "cover",
                            borderRadius: "1rem 1rem 0 0",
                          }}
                        />
                        {product.isFromFirebase && (
                          <div className="position-absolute top-0 end-0 m-2">
                            <span className="badge bg-success">Nuevo</span>
                          </div>
                        )}
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
      <Footer/>
    </div>
  );
};

export default ProductsHombrePage;
