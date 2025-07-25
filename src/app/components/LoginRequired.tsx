'use client';

import React from 'react';
import Link from 'next/link';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

const LoginRequired = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow border-0">
            <Card.Body className="p-5">
              <div className="mb-4">
                <i className="bi bi-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
              </div>
              <Card.Title as="h2" className="mb-3">Inicie sesión para continuar</Card.Title>
              <Card.Text className="text-muted mb-4">
                Para acceder a esta funcionalidad, es necesario que inicie sesión o cree una cuenta.
              </Card.Text>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button as={Link} href="/auth/login" variant="primary" className="px-4 py-2">
                  Iniciar Sesión
                </Button>
                <Button as={Link} href="/auth/register" variant="outline-primary" className="px-4 py-2">
                  Crear Cuenta
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginRequired;