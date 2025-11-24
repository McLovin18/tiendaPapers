'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { cartService } from '../services/cartService';
import { SUBCATEGORIES, CATEGORIES } from '../constants/categories';
import { ChevronDown, ChevronUp } from "lucide-react";

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  // detectar click fuera del nav para cerrar
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(ev.target as Node)) {
        setActiveDropdown(null);
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (!isClient) return;
    if (!user?.uid) {
      const updateGuestCount = () => {
        const guestItems = cartService.getGuestCart();
        const count = guestItems.reduce((acc, it) => acc + it.quantity, 0);
        setCartCount(count);
      };
      updateGuestCount();
      window.addEventListener('cart-updated', updateGuestCount);
      return () => window.removeEventListener('cart-updated', updateGuestCount);
    }

    // usuario logueado
    cartService.migrateFromLocalStorage(user.uid);
    const unsub = cartService.subscribe((items) => {
      const count = items.reduce((acc, it) => acc + it.quantity, 0);
      setCartCount(count);
    }, user.uid);

    return unsub;
  }, [isClient, user?.uid]);

  const handleLogout = async () => {
    try { await logout(); } catch (err) { console.error(err); }
  };

  // Maneja click en título de categoría (abre/cierra acordeón)
  const toggleCategory = (catId: string) => {
    setActiveDropdown(prev => (prev === catId ? null : catId));
  };

  // Maneja click en subcategoria en móvil:
  //  - si la categoría NO está abierta -> ABRIR (prevent navigation)
  //  - si la categoría YA está abierta -> NAVEGAR
  const handleSubcategoryClick = (catId: string, subValue: string, e: React.MouseEvent) => {
    if (activeDropdown !== catId) {
      // primera pulsación: abrir categoría en vez de navegar
      e.preventDefault();
      setActiveDropdown(catId);
      return;
    }

    // segunda pulsación: navegar
    e.preventDefault();
    setExpanded(false);
    setActiveDropdown(null);
    // navegación programática (router.push) para el control total
    router.push(`/categories/${subValue}`);
  };

  return (
    <Navbar expand="lg" expanded={expanded} className="py-2 shadow-sm bg-cosmetic-secondary" ref={navRef}>
      <Container className="navbar-container">
        {/* fila 1 */}
        <div className="first-row d-flex justify-content-between align-items-center w-100 px-3 py-1">
          <Navbar.Brand as={Link} href="/" className="me-auto">
            <img className='logo_img' style={{ maxWidth: "360px", height: "auto" }} src="/logo.png" alt="Logo" />
          </Navbar.Brand>

          <div className="d-flex align-items-center">
            <Nav className="d-none d-lg-flex me-4">
              <Nav.Link as={Link} href="/blogs" className="fw-medium">Blog</Nav.Link>
            </Nav>

            <Nav.Link as={Link} href="/cart" className="me-4 position-relative" aria-label="Carrito">
              <i className="bi bi-cart" style={{ fontSize: "1.5rem", color: "var(--cosmetic-accent)" }}></i>
              {cartCount > 0 && (
                <span className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle p-1">
                  {cartCount}
                </span>
              )}
            </Nav.Link>

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

            <Navbar.Toggle
              className="btn btn-primary d-lg-none ms-3"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(prev => !prev);
              }}
            />
          </div>
        </div>

        {/* fila 2 - desktop (mantenemos NavDropdown para desktop) */}
        <div className="second-row d-none d-lg-flex flex-wrap justify-content-center w-100 px-3 pb-2">
          <Nav className="flex-wrap justify-content-center">
            {CATEGORIES.map(cat => {
              const isOpen = activeDropdown === cat.id;
              return (
                <NavDropdown
                  key={cat.id}
                  title={
                    <span className="d-flex align-items-center gap-1">
                      {cat.label}
                    </span>
                  }
                  id={`nav-dropdown-${cat.id}`}
                  show={isOpen}
                  onMouseEnter={() => setActiveDropdown(cat.id)}
                  onMouseLeave={() => setActiveDropdown(prev => (prev === cat.id ? null : prev))}
                  className="mx-2 my-1"
                >
                  <div className="dropdown-grid">
                    {SUBCATEGORIES.filter(s => s.id === cat.id).map(sub => (
                      <NavDropdown.Item
                        key={sub.value}
                        as={Link}
                        href={`/categories/${sub.value}`}
                        onClick={() => {
                          setActiveDropdown(null);
                          setExpanded(false);
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

        {/* MENÚ MÓVIL - propio (acordeón) */}
        <Navbar.Collapse id="basic-navbar-nav" className="d-lg-none">
          <Nav className="flex-column text-start px-3">

            {CATEGORIES.map(cat => {
              const isOpen = activeDropdown === cat.id;
              return (
                <div key={cat.id} className="mb-2 w-100">
                  {/* título categoría */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="w-100 bg-transparent border-0 d-flex justify-content-between align-items-center py-2 fw-bold"
                    aria-expanded={isOpen}
                    aria-controls={`mobile-cat-${cat.id}`}
                    style={{ fontSize: "1.05rem", cursor: "pointer" }}
                  >
                    {cat.label}
                    <span aria-hidden>{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* lista subcategorías */}
                  <div id={`mobile-cat-${cat.id}`} className={`ps-3 ${isOpen ? 'd-block' : 'd-none'}`}>
                    {SUBCATEGORIES.filter(s => s.id === cat.id).map(sub => (
                      <a
                        key={sub.value}
                        href={`/categories/${sub.value}`}
                        onClick={(e) => handleSubcategoryClick(cat.id, sub.value, e)}
                        className="d-block py-2 text-decoration-none"
                        style={{ color: '#333', fontSize: '1rem' }}
                        role="link"
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="mt-3">
              <a className="btn btn-primary w-100 mb-2 d-block text-center" href="/blogs" onClick={(e) => { e.preventDefault(); setExpanded(false); router.push('/blogs'); }}>
                Blog
              </a>

              {user ? (
                <a className="btn btn-primary w-100 d-block text-center" href="/profile" onClick={(e) => { e.preventDefault(); setExpanded(false); router.push('/profile'); }}>
                  Mi cuenta
                </a>
              ) : (
                <>
                  <a className="btn btn-primary w-100 mb-2 d-block text-center" href="/auth/login" onClick={(e) => { e.preventDefault(); setExpanded(false); router.push('/auth/login'); }}>
                    Iniciar sesión
                  </a>
                  <a className="btn btn-secondary w-100 d-block text-center" href="/auth/register" onClick={(e) => { e.preventDefault(); setExpanded(false); router.push('/auth/register'); }}>
                    Registrate
                  </a>
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
