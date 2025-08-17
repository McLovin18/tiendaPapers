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
import WhatsAppButton from '../components/WhatsAppButton';
import DeliveryLocationSelector from '../components/DeliveryLocationSelector';
import PayPalProvider from '../components/paypalProvider';
import Footer from "../components/Footer";
import PayPalDiagnostic from '../components/PayPalDiagnostic';

import { savePurchase, getUserDisplayInfo } from '../services/purchaseService';
import { createDeliveryOrder } from '../services/deliveryService';
import { cartService, type CartItem } from '../services/cartService';
import StockValidation from '../components/StockValidation';

// PayPal Client ID - Get from environment variables
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

const CartPage = () => {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);


  const updateQuantity = async (id: number, newQuantity: number) => {
    if (!user?.uid) return;

    try {
      if (newQuantity < 1) {
        // Si llega a 0, eliminamos el producto
        await removeItem(id);
      } else {
        // Si es mayor a 0, actualizamos normalmente
        await cartService.updateCartItemQuantity(user.uid, id, newQuantity);
      }
    } catch (error: any) {
      console.error('Error al actualizar cantidad:', error);

      if (error.message && error.message.includes('stock')) {
        setSaveError(error.message);
      } else {
        setSaveError('Error al actualizar la cantidad del producto');
      }
      setTimeout(() => setSaveError(''), 5000);
    }
  };

  const removeItem = async (id: number) => {
    if (!user?.uid) return;

    const success = await cartService.removeFromCart(user.uid, id);
    if (!success) {
      console.error('Error al remover item');
    }
  };


  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load cart items from Firebase and subscribe to real-time updates
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
    
    // Migrate from localStorage if needed and subscribe to cart changes
    cartService.migrateFromLocalStorage(user.uid);
    
    // Subscribe to real-time cart updates
    const unsubscribe = cartService.subscribeToCartChanges(user.uid, (items) => {
      setCartItems(items);
    });
    
    // Reset payment success state when cart loads
    setPaymentSuccess(false);
    setSaveError('');
    
    // Return cleanup function
    return unsubscribe;
  }, [user?.uid, loading, isClient]);

  // Estado para mostrar confirmación de compra
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  // Estado para manejar errores de guardado
  const [saveError, setSaveError] = useState('');
  // Estado para el procesamiento del pago
  const [processing, setProcessing] = useState(false);
  // Estado para la ubicación de entrega
  const [deliveryLocation, setDeliveryLocation] = useState<{city: string; zone: string; address?: string; phone?: string} | null>(null);
  // Estado para validación de stock
  const [stockValid, setStockValid] = useState(true);
  const [stockErrors, setStockErrors] = useState<string[]>([]);

  // Función para manejar la validación de stock
  const handleStockValidation = (isValid: boolean, errors: string[]) => {
    setStockValid(isValid);
    setStockErrors(errors);
  };

  // Función para ajustar cantidad desde StockValidation
  const handleQuantityAdjustFromStock = async (itemId: string, newQuantity: number) => {
    if (!user?.uid) return;
    
    try {
      // Buscar el item en el carrito para obtener size y color
      const item = cartItems.find(cartItem => cartItem.id.toString() === itemId);
      if (!item) {
        console.error('Item no encontrado en el carrito');
        return;
      }
      
      await cartService.updateCartItemQuantity(
        user.uid, 
        item.id, 

        newQuantity
      );
    } catch (error: any) {
      console.error('Error al ajustar cantidad:', error);
      setSaveError(error.message || 'Error al ajustar la cantidad del producto');
      setTimeout(() => setSaveError(''), 5000);
    }
  };

  // Función para remover item desde StockValidation
  const handleItemRemoveFromStock = async (itemId: string) => {
    if (!user?.uid) return;
    
    try {
      // Buscar el item en el carrito para obtener size y color
      const item = cartItems.find(cartItem => cartItem.id.toString() === itemId);
      if (!item) {
        console.error('Item no encontrado en el carrito');
        return;
      }
      
      const success = await cartService.removeFromCart(
        user.uid, 
        item.id, 
      );
      
      if (!success) {
        throw new Error('Error al remover el producto del carrito');
      }
    } catch (error: any) {
      console.error('Error al remover item:', error);
      setSaveError(error.message || 'Error al remover el producto del carrito');
      setTimeout(() => setSaveError(''), 5000);
    }
  };

  // Función para manejar el éxito del pago de PayPal
  const handlePayPalSuccess = async (details: any) => {
    if (!user?.uid) {
      setSaveError('Error: Usuario no autenticado');
      return;
    }

    setProcessing(true);
    setSaveError('');

    try {
      // Obtener información del usuario
      const userInfo = getUserDisplayInfo(user);
      
      // Preparar datos de la compra con información adicional para PayPal
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
        total: calculateTotal(),
        // ✅ Información adicional para PayPal
        paypalDetails: {
          transactionId: details.id,
          status: details.status,
          payerEmail: details.payer?.email_address,
          payerName: details.payer?.name?.given_name + ' ' + details.payer?.name?.surname,
          amount: details.purchase_units?.[0]?.amount?.value,
          currency: details.purchase_units?.[0]?.amount?.currency_code
        },
        // ✅ Información de envío (ayuda a PayPal a liberar fondos)
        shipping: {
          status: 'processing', // processing -> shipped -> delivered
          method: 'standard_shipping',
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
          trackingNumber: 'TRACK-' + Date.now(), // Número de seguimiento simulado
          // ✅ Incluir información de ubicación seleccionada
          city: deliveryLocation?.city || 'No especificada',
          zone: deliveryLocation?.zone || 'No especificada',
          address: deliveryLocation?.address || 'Dirección por especificar',
          phone: deliveryLocation?.phone || 'Teléfono no especificado'
        }
      };

      // Guardar la compra en Firestore
      const purchaseId = await savePurchase(purchaseData, userInfo.userName, userInfo.userEmail);
      
      // ✅ Crear orden de delivery automáticamente con el purchaseId
      try {
        await createDeliveryOrder(purchaseData, userInfo.userName || 'Usuario', userInfo.userEmail || user.email || 'email@example.com', purchaseId);
        
        // 🚚 NUEVO: Crear notificación automática para delivery
        const { notificationService } = await import('../services/notificationService');
        await notificationService.createNotification({
          orderId: purchaseId,
          userName: userInfo.userName || 'Usuario',
          userEmail: userInfo.userEmail || user.email || 'email@example.com',
          total: purchaseData.total,
          items: purchaseData.items,
          deliveryLocation: purchaseData.shipping || {
            city: 'No especificada',
            zone: 'No especificada', 
            address: 'Dirección por especificar',
            phone: 'Teléfono no especificado'
          }
        });
        
        console.log('✅ Notificación de delivery creada automáticamente');
      } catch (deliveryError) {
        console.error('⚠️ Error en creación de delivery/notificación:', deliveryError);
        // Continuar aunque falle la orden de delivery
      }
      
      // Limpiar el carrito de Firebase
      await cartService.clearCart(user.uid);
      
      // Mostrar éxito
      setPaymentSuccess(true);
      
    } catch (error) {
      setSaveError('Hubo un problema al guardar tu compra. Por favor, contacta al soporte.');
    } finally {
      setProcessing(false);
    }
  };

  // Función para manejar errores del pago de PayPal
  const handlePayPalError = (error: any) => {
    // Mostrar mensaje específico si es error de configuración
    if (error.userMessage) {
      setSaveError(error.userMessage);
    } else if (error?.message?.includes('INVALID_CLIENT_ID')) {
      setSaveError('Error de configuración de PayPal. La aplicación necesita ser configurada para producción.');
    } else if (error?.message?.includes('sandbox')) {
      setSaveError('Error: PayPal está configurado para sandbox pero se está usando en producción.');
    } else {
      setSaveError('Hubo un problema con el pago. Por favor, inténtalo de nuevo o contacta al soporte.');
    }
    
    setProcessing(false);
  };

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
            <Button href="/products" className="btn-cosmetic-primary px-4 py-2">Seguir comprando</Button>
            <Button href="/profile?tab=orders" variant="outline-dark" className="px-4 py-2">
              <i className="bi bi-clock-history me-2"></i>Ver mis compras
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <PayPalProvider>
      <div className="d-flex flex-column min-vh-100">
        {/* Eliminar <NavbarComponent /> de aquí, ya que el layout global ya lo incluye */}

        {user && <TopbarMobile />}
        
        <div className="d-flex flex-grow-1 w-100">
          {user && <Sidebar />}

          <main className="flex-grow-1">
          <Container className="py-5 py-lg-5 py-md-2 py-sm-2">
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
                      
                      
                      {/* ✅ SELECTOR DE UBICACIÓN DE ENTREGA */}
                      <DeliveryLocationSelector 
                        onLocationChange={setDeliveryLocation}
                        disabled={cartItems.length === 0 || processing || !stockValid}
                      />
                      


                      
                      {/* ✅ Botón de WhatsApp - Primera opción */}
                      <WhatsAppButton
                        cartItems={cartItems}
                        total={calculateTotal()}
                        deliveryLocation={deliveryLocation}
                        disabled={cartItems.length === 0 || processing || !deliveryLocation || !stockValid}
                      />
                      
                      {/* ✅ Separador visual */}
                      <div className="text-center my-3">
                        <div className="d-flex align-items-center">
                          <hr className="flex-grow-1" />
                          <span className="px-3 text-muted small">o paga con tarjeta</span>
                          <hr className="flex-grow-1" />
                        </div>
                      </div>
                      
                      <PayPalButton
                        amount={calculateTotal()}
                        onSuccess={handlePayPalSuccess}
                        onError={handlePayPalError}
                        disabled={cartItems.length === 0 || processing || !deliveryLocation || !stockValid}
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
    </PayPalProvider>
  );
};

export default CartPage;