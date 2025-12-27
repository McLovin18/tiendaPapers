'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { cartService } from '../services/cartService';
import { SUBCATEGORIES, CATEGORIES } from '../constants/categories';

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const [dropdownAlignment, setDropdownAlignment] = useState<Record<string, 'start' | 'end'>>({});


  // 🔥 Hook para actualizar altura SOLO del navbar (sin el contenido expandido)
    useEffect(() => {
      if (!activeDropdown) return; // Solo ejecutar si hay un menú abierto

      const handlePosition = () => {
        // Evitar la ejecución en móvil
        if (window.innerWidth < 992) return; 

        // 1. Buscamos el elemento del botón de la categoría
        const dropdownButton = document.getElementById(`nav-dropdown-${activeDropdown}`);
        if (!dropdownButton) return;

        // 2. Usamos el botón del dropdown para calcular si está cerca del borde
        const rect = dropdownButton.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        
        // ✅ UMERAL: Distancia en píxeles desde el borde derecho para que se considere "cerca".
        // Si el botón está a menos de 400px del borde derecho, expandimos a la izquierda.
        // Puedes ajustar este valor (400) según el ancho de tu menú desplegable.
        const threshold = 600; 
        
        let newAlignment: 'start' | 'end' = 'start'; // 'start' es el valor por defecto

        // Si el borde derecho del botón está más allá del límite de seguridad (pantalla - umbral)
        if (rect.right > screenWidth - threshold) {
            newAlignment = 'end'; // Usar 'end' para forzar la expansión hacia la izquierda
        }
        
        // Solo actualiza el estado si el alineamiento realmente cambió
        setDropdownAlignment(prev => {
          if (prev[activeDropdown] !== newAlignment) {
              return {
                  ...prev,
                  [activeDropdown]: newAlignment
              };
          }
          return prev;
        });
      };

      // Ejecutar la corrección justo después de que el dropdown se muestre (asíncrono)
      const timeoutId = setTimeout(handlePosition, 0); 

      // Recalcular en resize si el menú está abierto
      window.addEventListener('resize', handlePosition);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handlePosition);
      };
    }, [activeDropdown]); // Se ejecuta cada vez que cambia el dropdown activo



  // detectar click fuera del nav para cerrar (solo en desktop)
  useEffect(() => {
    const handleClickOutside = (ev: MouseEvent) => {
      const isMobile = window.innerWidth < 992;

      if (isMobile) {
        return; 
      }

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

  // Maneja click en subcategoria en móvil
  const handleSubcategoryClick = (catId: string, subValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Cerrar menú y navegar
    setExpanded(false);
    setActiveDropdown(null);
    
    // Navegar a la categoría
    router.push(`/categories/${subValue}`);
  };

  return (
    <>
      <Navbar 
        id="main-navbar" 
        expand="lg" 
        expanded={expanded} 
        className="py-2 shadow-sm bg-cosmetic-secondary position-sticky top-0" 
        ref={navRef}
        style={{ zIndex: 1030 }}
      >
        <Container className="navbar-container">
          {/* fila 1 (sin cambios) */}
          <div className="first-row d-flex justify-content-between align-items-center w-100 px-3 py-1">
            <Navbar.Brand as={Link} href="/" className="me-auto">
              <img className='logo_img' style={{ maxWidth: "280px", height: "auto" }} src="/logo.png" alt="Logo" />
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
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(prev => !prev);
                }}
              />
            </div>
          </div>

          {/* Fila 2 - CATEGORÍAS (Desktop) */}
          <div className="second-row d-none d-lg-flex flex-wrap justify-content-center w-100 px-3 pb-2">
            <Nav className="flex-wrap justify-content-center">
              {CATEGORIES.map(cat => {
                const isOpen = activeDropdown === cat.id;

                // ✅ Lógica: Si la categoría está en nuestra lista de "problemas de borde derecho",
                // la forzamos a alinearse al 'end' (que hace que se expanda a la izquierda).
                // De lo contrario, usamos el valor por defecto ('start' o null).
                const alignment = dropdownAlignment[cat.id] || 'start';
                return (
                  <NavDropdown
                    key={cat.id}
                    title={<span className="d-flex align-items-center gap-1">{cat.label}</span>}
                    id={`nav-dropdown-${cat.id}`}
                    show={isOpen}
                    onMouseEnter={() => setActiveDropdown(cat.id)}
                    onMouseLeave={() => setActiveDropdown(prev => (prev === cat.id ? null : prev))}
                    className="mx-2 my-1"
                    // ✅ APLICAMOS el alineamiento forzado
                    align={alignment}
                  >
                    <div id={`dropdown-${cat.id}`} className="dropdown-grid">
                      {SUBCATEGORIES.filter(s => s.id === cat.id).map(sub => (
                        <NavDropdown.Item
                          key={sub.value}
                          as={Link}
                          href={`/categories/${sub.value}`}
                          className="nav-subcategory"
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

          {/* 🔥 MENÚ MÓVIL (sin cambios) */}
          <Navbar.Collapse id="basic-navbar-nav" className="d-lg-none">
            <div className="d-flex flex-column" style={{ maxHeight: '70vh' }}>
              {/* 🔥 Área de categorías con scroll */}
              <div 
                className="mobile-menu-content flex-grow-1"
                style={{
                  maxHeight: '25vh', 
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  paddingBottom: '0.5rem'
                }}
              >
                <Nav className="flex-column text-start px-3 py-3">
                  {CATEGORIES.map(cat => {
                    const isOpen = activeDropdown === cat.id;
                    return (
                      <div key={cat.id} className="mb-3 w-100">
                        {/* título categoría */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className="w-100 bg-transparent border-0 d-flex justify-content-between align-items-center nav-category py-2"
                          aria-expanded={isOpen}
                          aria-controls={`mobile-cat-${cat.id}`}
                          style={{ 
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            fontWeight: isOpen ? '600' : '500',
                            color: 'var(--cosmetic-tertiary)'
                          }}
                        >
                          {cat.label}
                          <span aria-hidden style={{ 
                            transition: 'transform 0.2s',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            fontSize: '0.9rem'
                          }}>
                            ▼
                          </span>
                        </button>

                        {/* lista subcategorías con animación */}
                        <div 
                          id={`mobile-cat-${cat.id}`} 
                          className={`ps-3 ${isOpen ? 'd-block' : 'd-none'}`}
                          style={{
                            animation: isOpen ? 'slideDown 0.2s ease-out' : 'none'
                          }}
                        >
                          {SUBCATEGORIES.filter(s => s.id === cat.id).map(sub => (
                            <a
                              key={sub.value}
                              href={`/categories/${sub.value}`}
                              onClick={(e) => handleSubcategoryClick(cat.id, sub.value, e)}
                              className="nav-subcategory d-block py-2 px-2"
                              role="link"
                              style={{
                                color: 'var(--cosmetic-tertiary)',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                fontSize: '0.95rem',
                                borderRadius: '0.5rem'
                              }}
                            >
                              {sub.label}
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </Nav>
              </div>

              {/* 🔥 Botones fijos siempre visibles */}
              <div 
                className="mobile-menu-actions border-top px-3 py-3 bg-cosmetic-secondary"
                style={{ 
                  borderColor: 'rgba(140, 156, 132, 0.2) !important',
                  flexShrink: 0
                }}
              >
                <a 
                  className="btn btn-primary w-100 mb-2 d-block text-center py-2" 
                  href="/blogs" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    setExpanded(false); 
                    router.push('/blogs'); 
                  }}
                >
                  Blog
                </a>

                {user ? (
                  <a 
                    className="btn btn-primary w-100 d-block text-center py-2" 
                    href="/profile" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setExpanded(false); 
                      router.push('/profile'); 
                    }}
                  >
                    Mi cuenta
                  </a>
                ) : (
                  <>
                    <a 
                      className="btn btn-primary w-100 mb-2 d-block text-center py-2" 
                      href="/auth/login" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setExpanded(false); 
                        router.push('/auth/login'); 
                      }}
                    >
                      Iniciar sesión
                    </a>
                    <a 
                      className="btn btn-secondary w-100 d-block text-center py-2" 
                      href="/auth/register" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        setExpanded(false); 
                        router.push('/auth/register'); 
                      }}
                    >
                      Registrate
                    </a>
                  </>
                )}
              </div>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 🔥 Estilos CSS (sin cambios) */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-menu-content::-webkit-scrollbar {
          width: 8px;
        }

        .mobile-menu-content::-webkit-scrollbar-track {
          background: var(--cosmetic-secondary);
          border-radius: 4px;
        }

        .mobile-menu-content::-webkit-scrollbar-thumb {
          background: var(--cosmetic-primary);
          border-radius: 4px;
        }

        .mobile-menu-content::-webkit-scrollbar-thumb:hover {
          background: var(--cosmetic-accent);
        }

        .nav-subcategory:hover {
          background-color: rgba(140, 156, 132, 0.1);
          color: var(--cosmetic-primary) !important;
          padding-left: 1rem !important;
        }

        /* 🔥 Sombra superior en botones para indicar que hay scroll arriba */
        .mobile-menu-actions {
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }

        #main-navbar {
          transition: none !important;
        }

        .navbar-collapse {
          transition: none !important;
        }

        /* Asegurar que el navbar-collapse no afecte el cálculo de altura */
        #basic-navbar-nav.collapsing,
        #basic-navbar-nav.collapse.show {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--cosmetic-secondary);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        
        /* Aseguramos que el menú de Bootstrap no tenga un ancho fijo que cause problemas */
        .dropdown-menu {
          min-width: 250px; 
          max-width: max-content; 
          width: auto;
        }
      `}</style>
    </>
  );
};

export default NavbarComponent;