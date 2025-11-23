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
  const [dropdownAlign, setDropdownAlign] = useState<Record<string, 'start' | 'end'>>({});
  const dropdownRefs = useRef<Record<string, HTMLElement | null>>({});



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


  useEffect(() => {
    if (!activeDropdown) return;

    const el = dropdownRefs.current[activeDropdown];
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.left;

    // Umbral de 400px (ajústate si es necesario)
const newAlign: 'start' | 'end' = spaceRight < 650 ? 'end' : 'start';

    setDropdownAlign((prev) => ({
      ...prev,
      [activeDropdown]: newAlign,
    }));
  }, [activeDropdown, window.innerWidth]);





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
    if (!isClient) return;

    // 🟣 INVITADO
    if (!user?.uid) {
      const updateGuestCount = () => {
        const guestItems = cartService.getGuestCart();
        const count = guestItems.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      };

      updateGuestCount(); // cargar inicial
      window.addEventListener("cart-updated", updateGuestCount);

      return () => {
        window.removeEventListener("cart-updated", updateGuestCount);
      };
    }

    // 🟢 LOGUEADO
    cartService.migrateFromLocalStorage(user.uid);

    const unsubscribe = cartService.subscribe((items) => {
      const count = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    }, user.uid);

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
    

    <Navbar expand="lg" expanded={expanded} className="py-2 shadow-sm bg-cosmetic-secondary" ref={navbarRef}>
      <Container className="navbar-container">
        
        {/* Fila 1: Logo + botones importantes */}
        <div className="first-row d-flex justify-content-between align-items-center w-100 px-3 py-1">
          <Navbar.Brand as={Link} href="/" className="me-auto">
            <img className='logo_img' style={ { maxWidth: "360px", height: "auto"}} src="/logo.png" alt="Logo" />
          </Navbar.Brand>

          <div className="d-flex align-items-center">
            {/* Blog (solo desktop) */}
            <Nav className="d-none d-lg-flex me-4">
              <Nav.Link as={Link} href="/blogs" className="fw-medium">Blog</Nav.Link>
            </Nav>

            {/* Carrito (siempre visible) */}
            <Nav.Link as={Link} href="/cart" className="me-4 position-relative" aria-label="Carrito">
              <i className="bi bi-cart" style={{ fontSize: "1.5rem", color: "var(--cosmetic-accent)" }}></i>
              {cartCount > 0 && (
                <span className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle p-1">
                  {cartCount}
                </span>
              )}
            </Nav.Link>

            {/* Iniciar sesión / Registro (solo desktop) */}
            <div className="d-none d-lg-flex">
              {user ? (
                <Nav.Link as={Link} href="/profile" className="me-2">Mi cuenta</Nav.Link>
              ) : (
                <>

                  <Nav.Link as={Link} href="/auth/login" className="me-2">Iniciar sesión</Nav.Link>
                  <Nav.Link as={Link} href="/auth/register">Registrate</Nav.Link>
                </>
              )}
            </div>

            {/* Menú toggle (solo móvil) */}
            <Navbar.Toggle className="btn btn-primary d-lg-none ms-3 " onClick={() => setExpanded(!expanded)} />
          </div>
        </div>

        {/* Fila 2: Categorías (solo desktop) */}
        <div className="second-row d-none d-lg-flex flex-wrap justify-content-center w-100 px-3 pb-2">
          <Nav ref={navRef} className="flex-wrap justify-content-center">
            {CATEGORIES.map((cat) => {
              const isOpen = activeDropdown === cat.id;
              return (
                <NavDropdown
                  key={cat.id}
                  align={dropdownAlign[cat.id] || 'start'}  // usa ‘end’ cuando detectado
                  title={
                    <span
                      ref={(el) => {
                        dropdownRefs.current[cat.id] = el;
                      }}
                      className="d-flex align-items-center gap-1"
                    >
                      {cat.label}
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  }
                  id={`nav-dropdown-${cat.id}`}
                  show={isOpen}
                  onMouseEnter={() => !clickedDropdown && setActiveDropdown(cat.id)}
                  onMouseLeave={() => !clickedDropdown && setActiveDropdown(null)}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(cat.id);
                  }}
                  className="mx-2 my-1"
                >
                  <div className={`dropdown-grid ${dropdownAlign[cat.id] === 'end' ? 'dropdown-align-left' : ''}`}>
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
        </div>

        {/* Menú colapsable para móviles */}
        <Navbar.Collapse id="basic-navbar-nav" className="d-lg-none">
          <Nav className="flex-column text-center">
            {CATEGORIES.map((cat) => (
              <NavDropdown
                key={cat.id}
                title={cat.label}
                id={`nav-dropdown-mobile-${cat.id}`}
                show={activeDropdown === cat.id}
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
            ))}

            {/* Botones de sesión para móviles */}
            <div className="mt-3">
              {user ? (
                <>
                <Nav.Link as={Link} href="/blogs" onClick={() => setExpanded(false)} className="btn btn-primary w-100 mb-2">
                  Blog
                </Nav.Link>
                <Nav.Link as={Link} href="/profile" onClick={() => setExpanded(false)} className="btn btn-primary w-100 mb-3">
                  Mi cuenta
                </Nav.Link>

                </>


              ) : (
                <>
                  <Nav.Link as={Link} href="/blogs" onClick={() => setExpanded(false)} className="btn btn-primary w-100 mb-2">
                    Blog
                  </Nav.Link>
                  <Nav.Link as={Link} href="/auth/login" onClick={() => setExpanded(false)} className="btn btn-primary w-100 mb-2">
                    Iniciar sesión
                  </Nav.Link>
                  <Nav.Link as={Link} href="/auth/register" onClick={() => setExpanded(false)} className="btn btn-secondary w-100">
                    Registrate
                  </Nav.Link>
                </>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>



  );
};

export default NavbarComponent;
