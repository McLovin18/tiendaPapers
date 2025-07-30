import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";

const Footer = () => (
  <footer className="bg-light text-dark py-5 border-top mt-auto">
    <Container>
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <h5 className="fw-bold mb-3">Comprar</h5>
          <ul className="list-unstyled">
            <li className="mb-2"><Link href="/products/mujer" className="text-dark text-decoration-none">Mujer</Link></li>
            <li className="mb-2"><Link href="/products/hombre" className="text-dark text-decoration-none">Hombre</Link></li>
            <li className="mb-2"><Link href="/products/ninos" className="text-dark text-decoration-none">Niños</Link></li>
            <li className="mb-2"><Link href="/products/bebe" className="text-dark text-decoration-none">Bebé</Link></li>
            <li className="mb-2"><Link href="/products/sport" className="text-dark text-decoration-none">Sport</Link></li>
          </ul>
        </Col>
        <Col md={6}>
          <h5 className="fw-bold mb-3">Contacto</h5>
          <p className="mb-1">Email: info@tiendaropa.com</p>
          <p className="mb-0">Teléfono: (123) 456-7890</p>
        </Col>
      </Row>
      <hr className="my-4" />
      <div className="text-center">
        <p className="small">&copy; {new Date().getFullYear()} Fashion Store. Todos los derechos reservados.</p>
      </div>
    </Container>
  </footer>
);

export default Footer;
