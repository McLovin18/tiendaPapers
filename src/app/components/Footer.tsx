"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Link from "next/link";
import { CATEGORIES, SUBCATEGORIES } from "../constants/categories"; 

const Footer = () => (
  <footer 
    className="footer-cosmetic py-5 border-top mt-auto bg-inherit" 
    style={{ backgroundColor: "var(--cosmetic-secondary)" }}
  >
    <Container>
      <Row>
        {/* Sección de categorías con 60% del ancho en desktop */}
        <Col xs={12} md={7} className="mb-4 mb-md-0">
          <Row>
            {CATEGORIES.map((category) => (
              <Col xs={6} sm={4} key={category.id} className="mb-4">
                {/* Nombre Categoría */}
                <h6 
                  className="fw-bold text-decoration-underline mb-3"
                  style={{ color: "var(--cosmetic-accent)" }}
                >
                  {category.label}
                </h6>

                {/* Subcategorías */}
                <ul className="list-unstyled">
                  {SUBCATEGORIES.filter(sub => sub.id === category.id).map(sub => (
                    <li className="mb-2" key={sub.value}>
                      <Link
                        href={`/categories/${sub.value}`}
                        className="footer-link"
                        style={{ color: "var(--cosmetic-tertiary)" }}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Col>
            ))}
          </Row>
        </Col>

        {/* Sección contacto 40% del ancho */}
        <Col xs={12} md={5} className="d-flex align-items-center justify-content-center flex-column text-center">
          <h5 className="fw-bold mb-3" style={{ color: "var(--cosmetic-accent)" }}>Contáctanos</h5>
          <p className="mb-1" style={{ color: "var(--cosmetic-tertiary)" }}>
            Email: tiffanysvariedades@gmail.com
          </p>
          <p className="mb-0" style={{ color: "var(--cosmetic-tertiary)" }}>
            Teléfono: +593 958845516
          </p>
        </Col>
      </Row>

      <hr className="my-4" style={{ borderColor: "var(--cosmetic-accent)" }} />

      <div className="text-center">
        <p className="small" style={{ color: "var(--cosmetic-tertiary)" }}>
          &copy; {new Date().getFullYear()} Tiffany's Variedades. Todos los derechos reservados.
        </p>
      </div>
    </Container>

    {/* Estilos del hover de links */}
    <style jsx>{`
      .footer-link {
        position: relative;
        text-decoration: none;
      }
      .footer-link::after {
        content: "";
        position: absolute;
        width: 0;
        height: 2px;
        background-color: var(--cosmetic-accent);
        left: 0;
        bottom: -2px;
        transition: width 0.3s;
      }
      .footer-link:hover::after {
        width: 100%;
      }
    `}</style>
  </footer>
);

export default Footer;

