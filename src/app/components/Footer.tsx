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
            <li className="mb-2"><Link href="/products/maquillaje" className="text-dark text-decoration-none">Maquillaje</Link></li>
            <li className="mb-2"><Link href="/products/cuidado-piel" className="text-dark text-decoration-none">Cuidado de Piel</Link></li>
            <li className="mb-2"><Link href="/products/fragancias" className="text-dark text-decoration-none">Fragancias</Link></li>
            <li className="mb-2"><Link href="/products/accesorios" className="text-dark text-decoration-none">Accesorios</Link></li>
          </ul>
        </Col>
        <Col md={6}>
          <h5 className="fw-bold mb-3">Contacto</h5>
          <p className="mb-1">Email: info@cosmeticosonline.com</p>
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
