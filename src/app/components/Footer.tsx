import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";

const Footer = () => (
  <footer className="footer-cosmetic py-5 border-top mt-auto bg-inherit" style={{ backgroundColor: "var(--cosmetic-secondary)" }}>
    <Container>
      <Row>
        <Col md={6} className="mb-4 mb-md-0">
          <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Categorías</h5>
          <ul className="list-unstyled">
            <li className="mb-2"><Link href="/products/maquillaje" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Maquillaje</Link></li>
            <li className="mb-2"><Link href="/products/cuidado-piel" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Cuidado de Piel</Link></li>
            <li className="mb-2"><Link href="/products/fragancias" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Fragancias</Link></li>
            <li className="mb-2"><Link href="/products/accesorios" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Accesorios</Link></li>
          </ul>
        </Col>
        <Col md={6}>
          <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Contacto</h5>
          <p className="mb-1"style={{ color: "var(--cosmetic-tertiary)" }}>Email: hectorcobea03@gmail.com</p>
          <p className="mb-0" style={{ color: "var(--cosmetic-tertiary)" }}>Teléfono: (593) 96-332-8168</p>
        </Col>
      </Row>
      <hr className="my-4" style={{ borderColor: "var(--cosmetic-accent)", color: "var(--cosmetic-tertiary)" }} />
      <div className="text-center">
        <p className="small" style={{ color: "var(--cosmetic-tertiary)" }}>&copy; {new Date().getFullYear()} Lua Beauty. Todos los derechos reservados.</p>
      </div>
    </Container>
  </footer>
);

export default Footer;
