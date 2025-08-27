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
            <li className="mb-2"><Link href="/categories/papeleria" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Papeleria</Link></li>
            <li className="mb-2"><Link href="/categories/escritura" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Escritura</Link></li>
            <li className="mb-2"><Link href="/categories/organizacion" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Organización</Link></li>
            <li className="mb-2"><Link href="/categories/accesorios" className="text-decoration-none hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>Accesorios</Link></li>
          </ul>
        </Col>
        <Col md={6}>
          <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Contacto</h5>
          <p className="mb-1"style={{ color: "var(--cosmetic-tertiary)" }}>Email: tiffanysvariedades@gmail.com</p>
          <p className="mb-0" style={{ color: "var(--cosmetic-tertiary)" }}>Teléfono: +593 </p>
        </Col>
      </Row>
      <hr className="my-4" style={{ borderColor: "var(--cosmetic-accent)", color: "var(--cosmetic-tertiary)" }} />
      <div className="text-center">
        <p className="small" style={{ color: "var(--cosmetic-tertiary)" }}>&copy; {new Date().getFullYear()} Paulina Papers. Todos los derechos reservados.</p>
      </div>
    </Container>
  </footer>
);

export default Footer;
