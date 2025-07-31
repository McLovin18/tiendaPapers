"use client";
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, ListGroup, Badge, Spinner, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { getUserPurchases } from "../services/purchaseService";
import Image from "next/image";
import Link from "next/link";
import Footer from "../components/Footer";


const MyOrdersPage = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para formatear fecha de manera legible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return `Hoy a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 2) {
      return `Ayer a las ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays <= 7) {
      return `Hace ${diffDays - 1} días`;
    } else {
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const data = await getUserPurchases(user.uid);
        
        // Ordenar por fecha (más reciente primero)
        const sortedPurchases = data.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        
        setPurchases(sortedPurchases);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [user?.uid]);

  if (!user) {
    return (
      <Container className="py-5 text-center">
        <h2>Debes iniciar sesión para ver tus compras</h2>
        <Button as={Link} href="/auth/login" variant="dark" className="mt-3">Iniciar sesión</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="fw-bold text-center mb-5">Mis Compras</h1>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="mb-3" />
          <p className="text-muted">Cargando tus compras...</p>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-box2 fs-1"></i>
          <h5 className="fw-bold mb-2">No tienes compras recientes</h5>
          <Button variant="dark" href="/products" className="rounded-1 px-4 mt-3">Ver Productos</Button>
        </div>
      ) : (
        <>
          <Row className="g-4 justify-content-center">
            {purchases.map((purchase, idx) => (
              <Col xs={12} md={10} lg={8} key={idx}>
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="fw-bold mb-1 text-primary">
                          <i className="bi bi-box me-2"></i>
                          Pedido #{idx + 1}
                        </h6>
                        <div className="small text-muted">
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(purchase.date)}
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold fs-5 mb-2 text-success">${purchase.total.toFixed(2)}</div>
                        <Badge bg="success">
                          <i className="bi bi-check-circle me-1"></i>
                          Pagado
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2 text-dark">
                        <i className="bi bi-bag me-2"></i>
                        Productos ({purchase.items.length})
                      </h6>
                      <Row className="g-2">
                        {purchase.items.map((item: any, i: number) => (
                          <Col xs={12} sm={6} md={4} key={i}>
                            <div className="d-flex align-items-center p-2 bg-light rounded">
                              <Image src={item.image} alt={item.name} width={40} height={40} className="me-3 rounded" />
                              <div className="flex-grow-1">
                                <div className="fw-bold small">{item.name}</div>
                                <div className="text-muted small">Cantidad: {item.quantity}</div>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
      <Footer />
    </Container>
  );
};

export default MyOrdersPage; 