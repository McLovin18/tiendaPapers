'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import TopbarMobile from '../components/TopbarMobile';
import Sidebar from '../components/Sidebar';
import Image from 'next/image';
import PayPalButton from '../components/paypalButton';
import WhatsAppButton from '../components/WhatsAppButton';
import DeliveryLocationSelector from '../components/DeliveryLocationSelector';
import PayPalProvider from '../components/paypalProvider';
import Footer from "../components/Footer";

import { savePurchase, getUserDisplayInfo } from '../services/purchaseService';
import { createDeliveryOrder } from '../services/deliveryService';
import { cartService, type CartItem } from '../services/cartService';
import { guestPurchaseService } from "../services/guestPurchaseService";
import { inventoryService } from '../services/inventoryService';

const CartPage = () => {
  const { user, loading, anonymousId } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<{city: string; zone: string; address?: string; phone?: string} | null>(null);
  const [guestEmail, setGuestEmail] = useState('');

  const calculateTotal = () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => setIsClient(true), []);

  // Suscripción al carrito
  useEffect(() => {
    if (!isClient || loading) return;

    if (!user?.uid) {
      const handler = () => setCartItems(JSON.parse(localStorage.getItem("cartItems_guest") || "[]"));
      window.addEventListener("cart-updated", handler);
      handler();
      return () => window.removeEventListener("cart-updated", handler);
    }

    cartService.migrateFromLocalStorage(user.uid);
    const unsub = cartService.subscribe(setCartItems, user?.uid);
    return unsub;
  }, [user?.uid, loading, isClient]);

  // Actualizar cantidad de producto en carrito
  const updateQuantity = async (id: number, newQuantity: number) => {
    try {
      if (newQuantity < 1) return removeItem(id);

      if (!user?.uid) {
        const guestItems = JSON.parse(localStorage.getItem("cartItems_guest") || "[]");
        const updated = guestItems.map((item: any) => item.id === id ? { ...item, quantity: newQuantity } : item);
        localStorage.setItem("cartItems_guest", JSON.stringify(updated));
        window.dispatchEvent(new Event("cart-updated"));
        return;
      }

      await cartService.updateCartItemQuantity(user.uid, id, newQuantity);
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
    }
  };

  const removeItem = async (id: number) => {
    try {
      if (!user?.uid) {
        const guestItems = JSON.parse(localStorage.getItem("cartItems_guest") || "[]");
        localStorage.setItem("cartItems_guest", JSON.stringify(guestItems.filter((item: any) => item.id !== id)));
        window.dispatchEvent(new Event("cart-updated"));
        return;
      }

      await cartService.removeFromCart(user.uid, id);
    } catch (error) {
      console.error("Error al remover item", error);
    }
  };


  // Pago exitoso
  const handlePaymentSuccess = async (details: any) => {
    setProcessing(true);
    setSaveError('');

    try {
      if (!deliveryLocation) {
        setSaveError("Por favor selecciona una ubicación de entrega.");
        setProcessing(false);
        return;
      }

      // Preparar items para validar y reducir stock
      const itemsToProcess = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      try {
        await inventoryService.processOrder(itemsToProcess);
      } catch (stockError: any) {
        setSaveError(stockError.message || 'Algunos productos no tienen stock suficiente.');
        setProcessing(false);
        return;
      }

      if (!user?.uid) {
        // Pago invitado
        const purchaseData = {
          guestId: anonymousId || `guest_${Date.now()}`,
          paymentId: details.id,
          payer: details.payer,
          contact: { name: deliveryLocation?.name || "Invitado", phone: deliveryLocation?.phone || "", email: guestEmail },
          deliveryLocation,
          items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
          total: calculateTotal(),
          date: new Date().toISOString(),
          status: "paid"
        };

        // Guardar compra del invitado
        await guestPurchaseService.saveGuestPurchase(purchaseData);

          // --- Enviar correo al invitado ---
          try {
            const response = await fetch("https://us-central1-academiaonline-f38c4.cloudfunctions.net/sendOrderEmail", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: guestEmail,
                orderId: purchaseData.guestId,
                items: purchaseData.items,
                total: purchaseData.total,
                deliveryLocation: purchaseData.deliveryLocation
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Error desconocido al enviar correo');
            }

            console.log('Correo enviado al invitado correctamente');
          } catch (emailError: any) {
            console.error('Error enviando correo al invitado:', emailError.message);
          }
        // --- Fin envío correo ---

        await cartService.clearCart();
        setPaymentSuccess(true);
        window.dispatchEvent(new Event("cart-updated"));
        setProcessing(false);
        return;
      }

      // Pago usuario autenticado
      const userInfo = getUserDisplayInfo(user);
      const purchaseData = {
        userId: user.uid,
        date: new Date().toISOString(),
        items: cartItems.map(item => ({ id: item.id.toString(), name: item.name, price: item.price, quantity: item.quantity, image: item.image })),
        total: calculateTotal(),
        paypalDetails: {
          transactionId: details.id,
          status: details.status,
          payerEmail: details.payer?.email_address,
          payerName: details.payer?.name?.given_name + ' ' + details.payer?.name?.surname,
          amount: details.purchase_units?.[0]?.amount?.value,
          currency: details.purchase_units?.[0]?.amount?.currency_code
        },
        shipping: {
          status: 'processing',
          method: 'standard_shipping',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          trackingNumber: 'TRACK-' + Date.now(),
          city: deliveryLocation?.city || 'No especificada',
          zone: deliveryLocation?.zone || 'No especificada',
          address: deliveryLocation?.address || 'Dirección por especificar',
          phone: deliveryLocation?.phone || 'Teléfono no especificado'
        }
      };

      const purchaseId = await savePurchase(purchaseData, userInfo.userName, userInfo.userEmail);

      try {
        await createDeliveryOrder(purchaseData, userInfo.userName || 'Usuario', userInfo.userEmail || user.email || 'email@example.com', purchaseId);
        const { notificationService } = await import('../services/notificationService');
        await notificationService.createNotification({
          orderId: purchaseId,
          userName: userInfo.userName || 'Usuario',
          userEmail: userInfo.userEmail || user.email || 'email@example.com',
          total: purchaseData.total,
          items: purchaseData.items,
          deliveryLocation: purchaseData.shipping
        });
      } catch (deliveryError) {
        console.error('⚠️ Error en creación de delivery/notificación:', deliveryError);
      }

      await cartService.clearCart(user.uid);
      setPaymentSuccess(true);

    } catch (error) {
      console.error(error);
      setSaveError('Hubo un problema al guardar tu compra. Por favor, contacta al soporte.');
    } finally {
      setProcessing(false);
    }
  };


  const handlePayPalError = (error: any) => {
    if (error.userMessage) setSaveError(error.userMessage);
    else if (error?.message?.includes('INVALID_CLIENT_ID')) setSaveError('Error de configuración de PayPal.');
    else if (error?.message?.includes('sandbox')) setSaveError('Error: PayPal está en modo sandbox.');
    else setSaveError('Hubo un problema con el pago.');
    setProcessing(false);
  };

  if (paymentSuccess) {
    const isGuest = !user;
    return (
      <div className="d-flex flex-column min-vh-100">
        <Container className="py-5 flex-grow-1 text-center">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          <h2 className="mt-3">¡Pago realizado con éxito!</h2>
          <p className="text-muted">Gracias por tu compra. Pronto recibirás un correo con los detalles de tu pedido.</p>

          {saveError && <Alert variant="warning" className="mt-3">{saveError}</Alert>}

          {isGuest && (
            <Alert variant="info" className="mt-4">
              <strong>¿Quieres recibir beneficios exclusivos?</strong><br />
              Crea una cuenta para:
              <ul className="mt-2 text-start mx-auto" style={{ maxWidth: "400px" }}>
                <li>Ver tus compras anteriores</li>
                <li>Acceder a promociones</li>
                <li>Guardar tu historial de pedidos</li>
                <li>Recibir soporte más rápido</li>
              </ul>
            </Alert>
          )}

          <div className="d-flex justify-content-center gap-3 mt-4">
            <Button href="/products" className="btn-cosmetic-primary px-4 py-2">Seguir comprando</Button>
            {user && <Button href="/profile?tab=orders" variant="outline-dark" className="px-4 py-2"><i className="bi bi-clock-history me-2"></i>Ver mis compras</Button>}
            {isGuest && <Button href="/auth/register" variant="outline-dark" className="px-4 py-2"><i className="bi bi-person-plus me-2"></i>Crear cuenta / Iniciar sesión</Button>}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <PayPalProvider>
      <div className="d-flex flex-column min-vh-100">
        {user && <TopbarMobile />}
        <div className="d-flex flex-grow-1 w-100">
          {user && <Sidebar />}
          <main className="flex-grow-1">
            <Container className="py-5">
              <h1 className="fw-bold text-center mb-5 text-cosmetic-tertiary">Tu Carrito</h1>
              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-bag" style={{ fontSize: '4rem' }}></i>
                  <h2 className="fw-bold mb-3 text-cosmetic-tertiary">Tu carrito está vacío</h2>
                  <Button href="/products" className="btn-cosmetic-primary rounded-1 px-4 py-2 mt-3">Ver Productos</Button>
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
                              <h5 className="fw-bold mb-0 text-cosmetic-tertiary">{item.name}</h5>
                              <Button variant="link" className="btn-cosmetic-primary text-danger p-0" onClick={() => removeItem(item.id)}><i className="bi bi-x-lg"></i></Button>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                              <span className="me-2 ">Cantidad:</span>
                              <Button size="sm" className="btn-cosmetic-primary px-2 py-0" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                              <span className="mx-2">{item.quantity}</span>
                              <Button size="sm" className="btn-cosmetic-primary px-2 py-0" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                            </div>
                            <div className="fw-bold text-primary fs-5">${(item.price * item.quantity).toFixed(2)}</div>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Col>

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

                      {saveError && <Alert variant="danger" className="mb-3">{saveError}</Alert>}
                      {processing && <Alert variant="info" className="mb-3"><i className="bi bi-hourglass-split me-2"></i>Procesando compra...</Alert>}

                      <DeliveryLocationSelector onLocationChange={setDeliveryLocation} disabled={cartItems.length === 0 || processing} />

                      <WhatsAppButton cartItems={cartItems} total={calculateTotal()} deliveryLocation={deliveryLocation} disabled={cartItems.length === 0 || processing || !deliveryLocation} />

                      <div className="text-center my-3">
                        <div className="d-flex align-items-center">
                          <hr className="flex-grow-1" />
                          <span className="px-3 text-muted small">o paga con tarjeta</span>
                          <hr className="flex-grow-1" />
                        </div>
                      </div>

                      {!user?.uid && (
                        <Form.Group className="my-3" controlId="guestEmail">
                          <Form.Label>Tu correo electrónico</Form.Label>
                          <Form.Control type="email" placeholder="Para enviarte los detalles del pedido" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
                        </Form.Group>
                      )}

                      <PayPalButton
                        amount={calculateTotal()}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePayPalError}
                        disabled={cartItems.length === 0 || processing || !deliveryLocation || (!user?.uid && !guestEmail)}
                        guestEmail={!user?.uid ? guestEmail : undefined}
                      />

                      <div className="text-center mt-3">
                        <small className="text-muted"><i className="bi bi-shield-check me-1"></i>Pago seguro con PayPal</small>
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
    </PayPalProvider>
  );
};

export default CartPage;
