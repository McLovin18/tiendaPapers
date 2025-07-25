'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { Navbar, Nav, Container, NavDropdown, Form, Button, InputGroup } from 'react-bootstrap';

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
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
    // Custom event for cross-component update
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [user?.uid, isClient]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <Navbar bg="white" expand="lg" expanded={expanded} className="py-2 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} href="/" className="mx-auto mx-lg-0">
          <Image 
            src="/images/logo.svg" 
            alt="Logo Tienda" 
            width={120} 
            height={40} 
            priority 
          />
        </Navbar.Brand>
        <Navbar.Toggle 
          aria-controls="basic-navbar-nav" 
          onClick={() => setExpanded(expanded ? false : true)} 
        />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="mx-auto text-center fw-medium">
            <Nav.Link as={Link} href="/products/mujer" onClick={() => setExpanded(false)} className="px-3">Mujer</Nav.Link>
            <Nav.Link as={Link} href="/products/hombre" onClick={() => setExpanded(false)} className="px-3">Hombre</Nav.Link>
            <Nav.Link as={Link} href="/products/bebe" onClick={() => setExpanded(false)} className="px-3">Bebé</Nav.Link>
            <Nav.Link as={Link} href="/products/ninos" onClick={() => setExpanded(false)} className="px-3">Niños</Nav.Link>
            <Nav.Link as={Link} href="/products/sport" onClick={() => setExpanded(false)} className="px-3">Sport</Nav.Link>
          </Nav>
          <Nav className="ms-lg-4">
            {user ? (
              <Nav.Link as={Link} href="/profile" className="text-dark px-2">Mi cuenta</Nav.Link>
            ) : (
              <Nav.Link as={Link} href="/auth/login" className="text-dark px-2">Iniciar sesión</Nav.Link>
            )}
            <Nav.Link as={Link} href="/cart" className="text-dark px-2 position-relative">
              <i className="bi bi-cart" style={{ fontSize: '1.3rem' }}></i>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.75rem' }}>
                  {cartCount}
                </span>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;