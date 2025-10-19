'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { cartService } from '../services/cartService';
import {SUBCATEGORIES, CATEGORIES} from '../constants/categories'; 
import { ChevronDown, ChevronUp } from "lucide-react";

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [clickedDropdown, setClickedDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Detectar click fuera del nav
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setClickedDropdown(null);
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (catId: string) => {
    if (clickedDropdown === catId) {
      setClickedDropdown(null); // cerrar si ya estaba activo con click
      setActiveDropdown(null);
    } else {
      setClickedDropdown(catId); // dejar fijo abierto
      setActiveDropdown(catId);
    }
  };


  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !user?.uid) {
      setCartCount(0);
      return;
    }

    // Migrar desde localStorage si es necesario
    cartService.migrateFromLocalStorage(user.uid);

    // Suscribirse a cambios del carrito en tiempo real
    const unsubscribe = cartService.subscribeToCartChanges(user.uid, (items) => {
      const count = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    });

    return unsubscribe;
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
      expand="lg"
      expanded={expanded}
      className="py-2 shadow-sm bg-cosmetic-secondary"
      ref={navbarRef}
    >
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} href="/" className="me-auto me-lg-0">
          <img style={{ maxWidth: "200px", height: "auto" }} src="/logo.png" alt="" />

        </Navbar.Brand>

        {/* Contenedor carrito + toggle para móviles */}
        <div className="d-flex align-items-center">
          {/* Carrito visible solo en móviles (fuera del menú) */}
          <Nav.Link
            as={Link}
            href="/cart"
            className="position-relative me-2 d-lg-none"
            style={{ fontSize: "1.5rem", color: "var(--cosmetic-accent)" }}

            aria-label="Carrito de compras"
          >
            <i className="bi bi-cart"></i>
            {cartCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                style={{ fontSize: "0.75rem", backgroundColor: "var(--cosmetic-accent)" }}
              >
                {cartCount}
              </span>
            )}
          </Nav.Link>

          {/* Toggle menú móvil */}
          <Navbar.Toggle className='btn-primary'
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          />
        </div>

        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          {/* Links principales */}
              <Nav ref={navRef} className="mx-auto text-center fw-medium mb-3 mb-lg-0">
                {CATEGORIES.map((cat) => {
                  const isOpen = activeDropdown === cat.id;

                  return (
                    <NavDropdown
                      key={cat.id}
                      title={
                        <span className="d-flex align-items-center gap-1">
                          {cat.label}
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      }
                      id={`nav-dropdown-${cat.id}`}
                      show={isOpen}
                      onMouseEnter={() => {
                        if (!clickedDropdown) setActiveDropdown(cat.id);
                      }}
                      onMouseLeave={() => {
                        if (!clickedDropdown) setActiveDropdown(null);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(cat.id);
                      }}
                    >
                      <div className="dropdown-grid">
                        {SUBCATEGORIES.filter((sub) => sub.id === cat.id).map((sub) => (
                          <NavDropdown.Item
                            key={sub.value}
                            as={Link}
                            href={`/categories/${sub.value}`}
                            onClick={() => {
                              setExpanded(false);
                              setClickedDropdown(null);
                              setActiveDropdown(null);
                            }}
                          >
                            {sub.label}
                          </NavDropdown.Item>
                        ))}
                      </div>
                    </NavDropdown>

                  );
                })}
              </Nav>


          {/* Contenedor sesión + carrito en desktop */}
          <div className="d-none d-lg-flex align-items-center ms-lg-4">
            {user ? (
              <>
                <Nav.Link as={Link} href="/profile" className="px-2 me-3 hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>
                  Mi cuenta
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  href="/cart"
                  className="position-relative hover-cosmetic-accent"
                  style={{ fontSize: "1.3rem", color: "var(--cosmetic-tertiary)" }}
                  aria-label="Carrito de compras"
                >
                  <i className="bi bi-cart"></i>
                  {cartCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{ fontSize: "0.75rem", backgroundColor: "var(--cosmetic-accent)" }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} href="/auth/login" className="px-2 me-3 hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>
                  Iniciar sesión
                </Nav.Link>

                <Nav.Link as={Link} href="/auth/register" className="px-2 me-3 hover-cosmetic-accent" style={{ color: "var(--cosmetic-tertiary)" }}>
                  Registrate
                </Nav.Link>

                <Nav.Link
                  as={Link}
                  href="/cart"
                  className="position-relative btn-cosmetic-primary hover-cosmetic-accent"
                  style={{ fontSize: "1.3rem", color: "var(--cosmetic-tertiary)" }}
                  aria-label="Carrito de compras"
                >
                  <i className="bi bi-cart"></i>
                  {cartCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                      style={{ fontSize: "0.75rem", backgroundColor: "var(--cosmetic-accent)" }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Nav.Link>
              </>
            )}
          </div>

          {/* Botón sesión visible solo en móviles dentro del menú */}
          <div className="d-lg-none rounded p-3 shadow-sm text-center" style={{ backgroundColor: "var(--cosmetic-secondary)" }}>
            {user ? (
              <Nav.Link
                as={Link}
                href="/profile"
                onClick={() => setExpanded(false)}
                className="btn btn-cosmetic-primary w-100 mb-2"
              >
                Mi cuenta
              </Nav.Link>
            ) : (
              <Nav.Link
                as={Link}
                href="/auth/login"
                onClick={() => setExpanded(false)}
                className="btn btn-primary w-100 mb-2"
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
