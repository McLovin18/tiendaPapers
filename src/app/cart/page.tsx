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
import PayPalButton from '../components/paypalButton';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import Footer from "../components/Footer";

import { savePurchase, getUserDisplayInfo } from '../services/purchaseService';

// PayPal Client ID - Get from environment variables
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

console.log('🔧 PayPal Client ID:', PAYPAL_CLIENT_ID);

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
    
    // Reset payment success state when cart loads
    setPaymentSuccess(false);
    setSaveError('');
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
  // Estado para el procesamiento del pago
  const [processing, setProcessing] = useState(false);

  // Función para manejar el éxito del pago de PayPal
  const handlePayPalSuccess = async (details: any) => {
    if (!user?.uid) {
      setSaveError('Error: Usuario no autenticado');
      return;
    }

    console.log('💰 Pago exitoso con PayPal:', details);
    setProcessing(true);
    setSaveError('');

    try {
      // Obtener información del usuario
      const userInfo = getUserDisplayInfo(user);
      
      // Preparar datos de la compra
      const purchaseData = {
        userId: user.uid,
        date: new Date().toISOString(),
        items: cartItems.map(item => ({
          id: item.id.toString(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: calculateTotal()
      };

      console.log('💾 Guardando compra:', purchaseData);
      
      // Guardar la compra en Firestore
      const purchaseId = await savePurchase(purchaseData, userInfo.userName, userInfo.userEmail);
      console.log('✅ Compra guardada con ID:', purchaseId);
      
      // Limpiar el carrito
      const cartKey = `cartItems_${user.uid}`;
      localStorage.removeItem(cartKey);
      setCartItems([]);
      
      // Mostrar éxito
      setPaymentSuccess(true);
      
    } catch (error) {
      console.error('❌ Error al guardar la compra:', error);
      setSaveError('Hubo un problema al guardar tu compra. Por favor, contacta al soporte.');
    } finally {
      setProcessing(false);
    }
  };

  // Función para manejar errores del pago de PayPal
  const handlePayPalError = (error: any) => {
    console.error('❌ Error en el pago de PayPal:', error);
    setSaveError('Hubo un problema con el pago. Por favor, inténtalo de nuevo.');
    setProcessing(false);
  };

  if (!user) {
    return <LoginRequired />;
  }

  console.log('🔍 Estado actual del carrito:', {
    paymentSuccess,
    cartItemsLength: cartItems.length,
    saveError
  });

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
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture",
        vault: false,
        "data-sdk-integration-source": "react-paypal-js",
        "disable-funding": "",
        "enable-funding": "venmo,paylater,card",
        components: "buttons"
      }}
    >
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
                {/*Pago con paypal*/}

                <Col xs={12} md={4}>
                    <Card className="p-4 border-0 shadow-sm position-sticky" style={{ top: '20px' }}>
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
                      
                      {/* ✅ AQUÍ REEMPLAZAMOS EL BOTÓN MANUAL CON PAYPAL */}
                      {saveError && (
                        <Alert variant="danger" className="mb-3">
                          {saveError}
                        </Alert>
                      )}
                      
                      {processing && (
                        <Alert variant="info" className="mb-3">
                          <i className="bi bi-hourglass-split me-2"></i>
                          Procesando compra...
                        </Alert>
                      )}
                      
                      <PayPalButton
                        amount={calculateTotal()}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                        disabled={cartItems.length === 0 || processing}
                      />
                      
                      <div className="text-center mt-3">
                        <small className="text-muted">
                          <i className="bi bi-shield-check me-1"></i>
                          Pago seguro con PayPal
                        </small>
                      </div>
                    </Card>
                </Col>
              </Row>
            )}
          </Container>
        </main>
        </div>
        <Footer />
      </div>
    </PayPalScriptProvider>
  );
};

export default CartPage;