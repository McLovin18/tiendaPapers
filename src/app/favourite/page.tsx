"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { getUserFavourites } from '../services/purchaseService';
import { Container, Button, Row, Col, Card, Image } from "react-bootstrap";
import Footer from "../components/Footer";

import Link from "next/link";

const FavouritePage = () => {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavourites = async () => {
      if (!user?.uid) {
        setFavourites([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const favsFromFirebase = await getUserFavourites(user.uid);
        setFavourites(favsFromFirebase);
      } catch (error) {
        console.error("Error cargando favoritos:", error);
        setFavourites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavourites();

    window.addEventListener("favourites-updated", loadFavourites);

    return () => window.removeEventListener("favourites-updated", loadFavourites);
  }, [user?.uid]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h1 className="fw-bold mb-5">Mis Favoritos</h1>
        <p>Cargando favoritos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 text-center">
      <h1 className="fw-bold mb-5">Mis Favoritos</h1>

      {favourites.length === 0 ? (
        <div className="py-5">
          <i className="bi bi-heart fs-1 text-danger mb-3"></i>
          <h5 className="fw-bold mb-2">Aún no tienes productos favoritos</h5>
          <Button
            variant="dark"
            href="/products"
            className="rounded-1 px-4 mt-3"
          >
            Ver Productos
          </Button>
        </div>
      ) : (
        <Row className="g-4 justify-content-center">
          {favourites.map((fav) => (
            <Col xs={12} md={6} lg={4} key={fav.id}>
              <Card className="mb-4 border-0 shadow-sm text-start">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <Image
                      src={fav.image}
                      alt={fav.name}
                      width={60}
                      height={60}
                      className="me-3 rounded-1"
                    />
                    <div>
                      <h5 className="fw-bold mb-1">{fav.name}</h5>
                      <div className="text-primary fw-bold mb-1">
                        ${fav.price.toFixed(2)}
                      </div>
                      <div className="small text-muted mb-2">
                        {fav.description?.substring(0, 60)}...
                      </div>
                      <Button
                        as={Link}
                        href={`/products/${fav.id}`}
                        variant="dark"
                        size="sm"
                        className="mt-2 rounded-1"
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
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

export default FavouritePage;
