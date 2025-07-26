'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import TopbarMobile from '../components/TopbarMobile';
import NavbarComponent from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import LoginRequired from '../components/LoginRequired';
import Image from 'next/image';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { savePurchase } from '../services/purchaseService';

// PayPal Client ID - Replace with your actual client ID in production
const PAYPAL_CLIENT_ID = 'test';

// Tipo para los items del carrito
interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

const CartPage = () => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const updateQuantity = (id: number, newQuantity: number, size?: string, color?: string) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id && item.size === size && item.color === color 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const removeItem = (id: number, size?: string, color?: string) => {
    setCartItems(cartItems.filter(item => 
      !(item.id === id && item.size === size && item.color === color)
    ));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart items from localStorage on component mount and user change
  useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    if (!isClient) return;
    
    // Wait for auth to finish loading
    if (loading) {
      return;
    }
    
    if (!user?.uid) {
      setCartItems([]);
      return;
    }
    
    const cartKey = `cartItems_${user.uid}`;
    const storedCart = localStorage.getItem(cartKey);
    const items = storedCart ? JSON.parse(storedCart) : [];
    setCartItems(items);
  }, [user?.uid, loading, isClient]);

  // Listen for cart updates from other components
  useEffect(() => {
    // Only run on client-side
    if (!isClient) return;
    
    const updateCart = () => {
      if (loading || !user?.uid) return;
      const cartKey = `cartItems_${user.uid}`;
      const storedCart = localStorage.getItem(cartKey);
      const items = storedCart ? JSON.parse(storedCart) : [];

      setCartItems(items);
    };

    window.addEventListener('cart-updated', updateCart);
    return () => {
      window.removeEventListener('cart-updated', updateCart);
    };
  }, [user?.uid, loading, isClient]);

  // Save cart items to localStorage when cartItems change
  useEffect(() => {
    // Only run on client-side
    if (!isClient || loading || !user?.uid) return;
    
    const cartKey = `cartItems_${user.uid}`;
    const currentStored = localStorage.getItem(cartKey);
    const newCartString = JSON.stringify(cartItems);
    
    // Only update localStorage if the data has actually changed
    if (currentStored !== newCartString) {

      localStorage.setItem(cartKey, newCartString);
    }
  }, [cartItems, user?.uid, loading, isClient]);

  // Estado para mostrar confirmación de compra
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Estado para manejar errores de guardado
  const [saveError, setSaveError] = useState('');

  if (!user) {
    return <LoginRequired />;
  }

  if (paymentSuccess) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Container className="py-5 flex-grow-1 text-center">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          <h2 className="mt-3">¡Pago realizado con éxito!</h2>
          <p className="text-muted">Gracias por tu compra. Pronto recibirás un correo con los detalles de tu pedido.</p>
          {saveError && (
            <Alert variant="warning" className="mt-3">
              {saveError}
              <br />
              <small>No te preocupes, tu compra ha sido procesada correctamente.</small>
            </Alert>
          )}
          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button href="/products" variant="dark" className="px-4 py-2">Seguir comprando</Button>
            <Button href="/profile?tab=orders" variant="outline-dark" className="px-4 py-2">
              <i className="bi bi-clock-history me-2"></i>Ver mis compras
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Eliminar <NavbarComponent /> de aquí, ya que el layout global ya lo incluye */}

      {user && <TopbarMobile />}
      
      <div className="d-flex flex-grow-1 w-100">
        {user && <Sidebar />}

        <main className="flex-grow-1">
        <Container className="py-5 py-lg-5 py-md-2 py-sm-2">
          <h1 className="fw-bold text-center mb-5">Tu Carrito</h1>
          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-bag" style={{ fontSize: '4rem' }}></i>
              <h2 className="fw-bold mb-3">Tu carrito está vacío</h2>
              <Button href="/products" variant="dark" className="rounded-1 px-4 py-2 mt-3">Ver Productos</Button>
            </div>
          ) : (
            <Row className="g-4">
              <Col xs={12} md={8}>
                {cartItems.map((item) => (
                  <Card key={item.id} className="mb-4 border-0 shadow-sm">
                    <Row className="g-0 align-items-center">
                      <Col xs={4} md={3} className="p-3">
                        <Image src={item.image} alt={item.name} width={100} height={120} style={{ objectFit: 'cover', borderRadius: '0.5rem' }} />
                      </Col>
                      <Col xs={8} md={9} className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="fw-bold mb-0">{item.name}</h5>
                          <Button variant="link" className="text-danger p-0" onClick={() => removeItem(item.id, item.size, item.color)}><i className="bi bi-x-lg"></i></Button>
                        </div>
                        {(item.size || item.color) && (
                          <div className="text-muted mb-2">
                            {item.size && <span className="me-3"><strong>Talla:</strong> {item.size}</span>}
                            {item.color && <span><strong>Color:</strong> {item.color}</span>}
                          </div>
                        )}
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2">Cantidad:</span>
                          <Button variant="outline-dark" size="sm" className="px-2 py-0" onClick={() => updateQuantity(item.id, item.quantity - 1, item.size, item.color)}>-</Button>
                          <span className="mx-2">{item.quantity}</span>
                          <Button variant="outline-dark" size="sm" className="px-2 py-0" onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}>+</Button>
                        </div>
                        <div className="fw-bold text-primary fs-5">${(item.price * item.quantity).toFixed(2)}</div>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Col>
              <Col xs={12} md={4}>
                <Card className="p-4 border-0 shadow-sm">
                  <h4 className="fw-bold mb-4">Resumen</h4>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Envío</span>
                    <span className="text-success">Gratis</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between mb-4">
                    <strong>Total</strong>
                    <strong>${calculateTotal().toFixed(2)}</strong>
                  </div>
                  <Button 
                    variant="dark" 
                    className="w-100 py-2 rounded-1 mb-3"
                    disabled={cartItems.length === 0}
                    onClick={() => {
                      try {
                        // Verificar autenticación
                        if (!user?.uid) {
                          alert('Debes iniciar sesión para completar la compra');
                          return;
                        }
                        
                        console.log('Usuario autenticado:', user.uid);
                        console.log('Datos de la compra:', {
                          items: cartItems,
                          total: calculateTotal()
                        });
                        
                        // Guardar compra en localStorage temporalmente para depuración
                        const purchase = {
                          id: Date.now().toString(),
                          userId: user.uid,
                          date: new Date().toLocaleString(),
                          items: cartItems.map(item => ({
                            id: item.id.toString(),
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image
                          })),
                          total: calculateTotal()
                        };
                        
                        // Guardar en localStorage para depuración
                        const existingPurchases = JSON.parse(localStorage.getItem('purchases') || '[]');
                        existingPurchases.push(purchase);
                        localStorage.setItem('purchases', JSON.stringify(existingPurchases));
                        
                        // Guardar compra en Firestore
                        savePurchase({
                          userId: user.uid,
                          date: new Date().toLocaleString(),
                          items: cartItems.map(item => ({
                            id: item.id.toString(),
                            name: item.name,
                            price: item.price,
                            quantity: item.quantity,
                            image: item.image
                          })),
                          total: calculateTotal()
                        })
                        .then(() => {
                          // Limpiar carrito
                          setCartItems([]);
                          localStorage.removeItem('cartItems');
                          setPaymentSuccess(true);
                          setSaveError('');
                          console.log('Compra completada con éxito');
                        })
                        .catch((error) => {
                          console.error('Error al guardar la compra:', error);
                          setSaveError('Hubo un problema al guardar tu compra en la base de datos, pero tu compra ha sido procesada.');
                          setPaymentSuccess(true); // Aún así mostramos éxito porque la compra se procesó
                        });
                      } catch (error) {
                        console.error('Error al procesar la compra:', error);
                        alert('Ocurrió un error al procesar tu compra. Por favor, intenta de nuevo.');
                      }
                    }}
                  >
                    Completar Compra
                  </Button>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </main>
      </div>
      
      <footer className="bg-light text-dark py-5 border-top">
        <Container>
          <Row>
            <Col md={6} className="mb-4 mb-md-0">
              <h5 className="fw-bold mb-3">Comprar</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><Link href="/products/mujer" className="text-dark text-decoration-none">Mujer</Link></li>
                <li className="mb-2"><Link href="/products/hombre" className="text-dark text-decoration-none">Hombre</Link></li>
                <li className="mb-2"><Link href="/products/ninos" className="text-dark text-decoration-none">Niños</Link></li>
                <li className="mb-2"><Link href="/products/bebe" className="text-dark text-decoration-none">Bebé</Link></li>
                <li className="mb-2"><Link href="/products/sport" className="text-dark text-decoration-none">Sport</Link></li>
              </ul>
            </Col>
            <Col md={6}>
              <h5 className="fw-bold mb-3">Contacto</h5>
              <p className="mb-1">Email: info@tiendaropa.com</p>
              <p className="mb-0">Teléfono: (123) 456-7890</p>
            </Col>
          </Row>
          <hr className="my-4" />
          <div className="text-center">
            <p className="small">&copy; {new Date().getFullYear()} Fashion Store. Todos los derechos reservados.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default CartPage;