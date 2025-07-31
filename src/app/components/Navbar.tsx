'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container } from 'react-bootstrap';

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateCartCount = () => {
      if (!user?.uid) {
        setCartCount(0);
        return;
      }
      const cartKey = `cartItems_${user.uid}`;
      const cartItems = JSON.parse(localStorage.getItem(cartKey) || '[]');
      const count = cartItems.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
      setCartCount(count);
    };
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [user?.uid, isClient]);

  // Cerrar menú si se hace click fuera (solo para móviles)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (expanded && navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expanded]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Navbar
      bg="white"
      expand="lg"
      expanded={expanded}
      className="py-2 shadow-sm"
      ref={navbarRef}
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} href="/" className="mx-auto mx-lg-0">
          <Image
            src="/logoShop1.png"
            alt="Logo Tienda"
            width={120}
            height={40}
            priority
          />
        </Navbar.Brand>

        {/* Contenedor carrito + toggle para móviles */}
        <div className="d-flex align-items-center">
          {/* Carrito visible solo en móviles (fuera del menú) */}
          <Nav.Link
            as={Link}
            href="/cart"
            className="text-dark position-relative me-2 d-lg-none"
            style={{ fontSize: "1.5rem" }}
            aria-label="Carrito de compras"
          >
            <i className="bi bi-cart"></i>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.75rem" }}
              >
                {cartCount}
              </span>
            )}
          </Nav.Link>

          {/* Toggle menú móvil */}
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          />
        </div>

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          {/* Links principales */}
          <Nav className="mx-auto text-center fw-medium mb-3 mb-lg-0">
            <Nav.Link as={Link} href="/products/mujer" onClick={() => setExpanded(false)}>
              Mujer
            </Nav.Link>
            <Nav.Link as={Link} href="/products/hombre" onClick={() => setExpanded(false)}>
              Hombre
            </Nav.Link>
            <Nav.Link as={Link} href="/products/bebe" onClick={() => setExpanded(false)}>
              Bebé
            </Nav.Link>
            <Nav.Link as={Link} href="/products/ninos" onClick={() => setExpanded(false)}>
              Niños
            </Nav.Link>
            <Nav.Link as={Link} href="/products/sport" onClick={() => setExpanded(false)}>
              Sport
            </Nav.Link>
          </Nav>

          {/* Contenedor sesión + carrito en desktop */}
          <div className="d-none d-lg-flex align-items-center ms-lg-4">
            {user ? (
              <>
                <Nav.Link as={Link} href="/profile" className="text-dark px-2 me-3">
                  Mi cuenta
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  href="/cart"
                  className="text-dark position-relative"
                  style={{ fontSize: "1.3rem" }}
                  aria-label="Carrito de compras"
                >
                  <i className="bi bi-cart"></i>
                  {cartCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} href="/auth/login" className="text-dark px-2 me-3">
                  Iniciar sesión
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  href="/cart"
                  className="text-dark position-relative"
                  style={{ fontSize: "1.3rem" }}
                  aria-label="Carrito de compras"
                >
                  <i className="bi bi-cart"></i>
                  {cartCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "0.75rem" }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Nav.Link>
              </>
            )}
          </div>

          {/* Botón sesión visible solo en móviles dentro del menú */}
          <div className="d-lg-none bg-light rounded p-3 shadow-sm text-center">
            {user ? (
              <Nav.Link
                as={Link}
                href="/profile"
                onClick={() => setExpanded(false)}
                className="btn btn-dark w-100 mb-2"
              >
                Mi cuenta
              </Nav.Link>
            ) : (
              <Nav.Link
                as={Link}
                href="/auth/login"
                onClick={() => setExpanded(false)}
                className="btn btn-dark w-100 mb-2"
              >
                Iniciar sesión
              </Nav.Link>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
