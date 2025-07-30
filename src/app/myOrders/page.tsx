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

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const data = await getUserPurchases(user.uid);
        setPurchases(data);
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
        <Row className="g-4 justify-content-center">
          {purchases.map((purchase, idx) => (
            <Col xs={12} md={8} key={idx}>
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6 className="fw-bold mb-1">Pedido #{purchase.id}</h6>
                      <div className="small text-muted mb-2">{purchase.date}</div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold fs-5 mb-2">${purchase.total.toFixed(2)}</div>
                      <Badge bg="success">Pagado</Badge>
                    </div>
                  </div>
                  <ListGroup horizontal className="flex-wrap">
                    {purchase.items.map((item: any, i: number) => (
                      <ListGroup.Item key={i} className="border-0 bg-transparent p-0 me-3 mb-2 d-flex align-items-center">
                        <Image src={item.image} alt={item.name} width={40} height={40} className="me-2 rounded-1" />
                        <span>{item.name} x{item.quantity}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
      <Footer />
    </Container>
  );
};

export default MyOrdersPage; 