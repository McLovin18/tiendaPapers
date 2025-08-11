'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Modal, Row, Col, ListGroup, ProgressBar, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/adminContext';
import { notificationService, type DeliveryNotification } from '../services/notificationService';
import { assignOrderToDelivery, updateOrderStatus, getDeliveryStatusInfo, type DeliveryOrder } from '../services/deliveryService';
import { 
  doc, 
  getDoc, 
  query as firestoreQuery, 
  collection as firestoreCollection, 
  where as firestoreWhere, 
  getDocs as firestoreGetDocs 
} from 'firebase/firestore';
import { db } from '../utils/firebase';

interface DeliveryNotificationPanelProps {
  deliveryZones?: string[];
}

/**
 * 🚚 PANEL DE NOTIFICACIONES PARA DELIVERY (DINÁMICO)
 * Panel moderno que obtiene zonas dinámicamente desde Firebase
 */
const DeliveryNotificationPanel: React.FC<DeliveryNotificationPanelProps> = ({ 
  deliveryZones = ['general'] 
}) => {
  const { user } = useAuth();
  const { role } = useRole();
  const isDelivery = role === 'delivery';

  // Estados principales
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<DeliveryNotification | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryOrder, setDeliveryOrder] = useState<DeliveryOrder | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [currentStatus, setCurrentStatus] = useState<string>('pending');

  // 🔐 INICIALIZAR PERMISOS DE NOTIFICACIÓN
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        const permission = await notificationService.requestNotificationPermission();
        setPermissionGranted(permission);
        
        // Cargar notificaciones iniciales si el usuario es delivery
        if (user?.email && isDelivery) {
          const initialNotifications = await notificationService.getActiveNotifications(user.email);
          setNotifications(initialNotifications);
        }
      } catch (error) {
        console.error('Error inicializando notificaciones:', error);
      }
    };

    initializeNotifications();
  }, [user, isDelivery]);

  // 👂 ESCUCHAR NOTIFICACIONES EN TIEMPO REAL (DINÁMICO)
  useEffect(() => {
    if (!user?.email || !isDelivery || !permissionGranted) return;

    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      try {
        unsubscribe = await notificationService.subscribeToDeliveryNotifications(
          user.email!,
          (notification) => {
            setNotifications(prev => {
              // Evitar duplicados
              const exists = prev.find(n => n.id === notification.id);
              if (exists) return prev;
              
              return [notification, ...prev].slice(0, 10); // Máximo 10 notificaciones
            });
          }
        );
      } catch (error) {
        console.error('Error configurando suscripción a notificaciones:', error);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isDelivery, permissionGranted]);

  // 🔔 MANEJAR ACEPTAR PEDIDO O IR A ENTREGAR
  const handleAcceptOrder = async (notification: DeliveryNotification) => {
    if (!user?.email || !notification.id) return;
    
    setLoading(true);
    try {
      if (notification.isUrgent) {
        // Si es notificación urgente, mostrar ventana de proceso de entrega
        await openDeliveryProcess(notification);
      } else {
        // Si es notificación normal, aceptar el pedido como antes
        await assignOrderToDelivery(notification.orderId, user.email);
        
        // Actualizar el estado de la notificación usando acceptDeliveryOrder
        await notificationService.acceptDeliveryOrder(notification.id, user.email);
        
        // Remover la notificación de la lista
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        
        // ✅ Notificación procesada exitosamente
      }
    } catch (error) {
      console.error('Error procesando notificación:', error);
      alert('Error al procesar la notificación. Inténtalo de nuevo.');
    }
    setLoading(false);
  };

  // 🚚 ABRIR PROCESO DE ENTREGA (NUEVA FUNCIONALIDAD)
  const openDeliveryProcess = async (notification: DeliveryNotification) => {
    try {
      // Marcar notificación como vista primero
      await notificationService.markNotificationAsRead(notification.id!);
      
      // Remover la notificación de la lista
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      
      // Buscar la orden de delivery completa usando nombres explícitos
      const ordersCollection = firestoreCollection(db, 'deliveryOrders');
      const ordersQuery = firestoreQuery(
        ordersCollection,
        firestoreWhere('orderId', '==', notification.orderId)
      );
      
      const querySnapshot = await firestoreGetDocs(ordersQuery);
      
      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        const orderData = { id: orderDoc.id, ...orderDoc.data() } as DeliveryOrder;
        
        // ✅ SI ENCUENTRA LA ORDEN EXISTENTE, SOLO ACTUALIZARLA (NO CREAR NUEVA)
        console.log(`✅ Orden existente encontrada: ${orderData.id}`);
        
        // Asignar al repartidor actual si no está asignada
        if (!orderData.assignedTo || orderData.status === 'pending') {
          console.log(`🔄 Asignando orden ${orderData.id} a ${user?.email}`);
          
          const { updateDoc, doc } = await import('firebase/firestore');
          await updateDoc(doc(db, 'deliveryOrders', orderDoc.id), {
            status: 'assigned',
            assignedTo: user?.email || '',
            assignedAt: new Date().toISOString(),
            priority: 'urgent'
          });
          
          // Actualizar el estado local
          orderData.status = 'assigned';
          orderData.assignedTo = user?.email || '';
          orderData.assignedAt = new Date().toISOString();
        }
        
        setDeliveryOrder(orderData);
        setCurrentStatus(orderData.status);
        setDeliveryNotes(orderData.deliveryNotes || '');
        setShowDeliveryModal(true);
      } else {
        // ❌ SI NO EXISTE LA ORDEN, MOSTRAR ERROR (NO CREAR NUEVA)
        console.error(`❌ ERROR: No se encontró orden de delivery para orderId: ${notification.orderId}`);
        alert(`Error: No se encontró la orden ${notification.orderId}. Contacta al administrador.`);
        return;
      }
    } catch (error) {
      console.error('❌ Error abriendo proceso de entrega:', error);
      alert('Error al abrir el proceso de entrega.');
    }
  };

  // 📋 ACTUALIZAR ESTADO DE ENTREGA
  const handleStatusUpdate = async (newStatus: string) => {
    if (!deliveryOrder || !deliveryOrder.orderId) return;
    
    setLoading(true);
    try {
      // Si la orden es temporal (empieza con "temp_"), primero crearla en Firebase
      if (deliveryOrder.id.startsWith('temp_')) {
        const { addDoc, collection } = await import('firebase/firestore');
        
        const realOrderData = {
          ...deliveryOrder,
          status: newStatus,
          deliveryNotes: deliveryNotes,
          updatedAt: new Date().toISOString()
        };
        delete (realOrderData as any).id; // Remover el ID temporal
        
        const docRef = await addDoc(collection(db, 'deliveryOrders'), realOrderData);
        
        // Actualizar el estado local con la nueva orden real
        const updatedOrder = {
          ...deliveryOrder,
          id: docRef.id,
          status: newStatus as any,
          deliveryNotes: deliveryNotes
        };
        
        setDeliveryOrder(updatedOrder);
        setCurrentStatus(newStatus);
      } else {
        // Si ya es una orden real, actualizar normalmente
        await updateOrderStatus(deliveryOrder.orderId, newStatus as any, deliveryNotes);
        setCurrentStatus(newStatus);
      }
      
      // Si se entrega, cerrar modal
      if (newStatus === 'delivered') {
        alert('¡Pedido marcado como entregado exitosamente!');
        setShowDeliveryModal(false);
        setDeliveryOrder(null);
      } else {
        alert(`Estado actualizado a: ${getDeliveryStatusInfo(newStatus).text}`);
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del pedido.');
    }
    setLoading(false);
  };

  // 🎨 OBTENER COLOR DEL BADGE SEGÚN URGENCIA
  const getUrgencyBadge = (notification: DeliveryNotification) => {
    if (notification.isUrgent) {
      return <Badge bg="danger" className="animate-pulse">🚨 URGENTE</Badge>;
    }
    return <Badge bg="primary">📦 Nuevo Pedido</Badge>;
  };

  // 📱 MOSTRAR DETALLES DEL PEDIDO
  const showOrderDetails = (notification: DeliveryNotification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
  };

  // 📋 RENDERIZAR CADA NOTIFICACIÓN
  const renderNotification = (notification: DeliveryNotification) => (
    <Card key={notification.id} className={`mb-3 ${notification.isUrgent ? 'border-danger' : ''}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            {getUrgencyBadge(notification)}
            <h6 className="mt-2 mb-1">Pedido #{notification.orderId}</h6>
            <p className="text-muted small mb-2">
              📍 Zona: <strong>{notification.orderData.deliveryLocation?.zone || notification.orderData.deliveryLocation?.city || 'No especificada'}</strong>
            </p>
            <p className="small mb-2">
              💰 Total: <strong>${notification.orderData.total}</strong>
            </p>
            <p className="text-muted small">
              ⏰ {notification.createdAt.toDate().toLocaleString()}
            </p>
          </div>
          <div>
            <Button
              variant="outline-info"
              size="sm"
              className="me-2"
              onClick={() => showOrderDetails(notification)}
            >
              👁️ Ver
            </Button>
            <Button
              variant={notification.isUrgent ? "danger" : "success"}
              size="sm"
              onClick={() => handleAcceptOrder(notification)}
              disabled={loading}
            >
              {loading ? "⏳" : (
                notification.isUrgent 
                  ? "🚚 Ir a Entregar" 
                  : "✅ Aceptar"
              )}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  // 🎨 COMPONENTE PRINCIPAL
  if (!isDelivery) {
    return (
      <Alert variant="warning">
        <Alert.Heading>🚫 Acceso Restringido</Alert.Heading>
        <p>Este panel es solo para personal de delivery.</p>
      </Alert>
    );
  }

  if (!permissionGranted) {
    return (
      <Alert variant="info">
        <Alert.Heading>🔔 Permisos de Notificación</Alert.Heading>
        <p>Necesitas habilitar las notificaciones para recibir alertas de pedidos.</p>
        <Button 
          variant="primary" 
          onClick={() => notificationService.requestNotificationPermission().then(setPermissionGranted)}
        >
          Habilitar Notificaciones
        </Button>
      </Alert>
    );
  }

  return (
    <div className="delivery-panel">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            🚚 Panel de Delivery - {user?.email}
          </h5>
          <small>
            📍 Notificaciones dinámicas desde Firebase
          </small>
        </Card.Header>
        <Card.Body>
          {notifications.length === 0 ? (
            <Alert variant="light" className="text-center">
              <h6>📬 No hay pedidos pendientes</h6>
              <p className="mb-0">Esperando nuevos pedidos...</p>
            </Alert>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>📦 Pedidos Disponibles ({notifications.length})</h6>
                <Badge bg="info">{notifications.filter(n => n.isUrgent).length} Urgentes</Badge>
              </div>
              {notifications.map(renderNotification)}
            </>
          )}
        </Card.Body>
      </Card>

      {/* 📋 MODAL DE DETALLES */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            📦 Detalles del Pedido #{selectedNotification?.orderId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <Row>
              <Col md={6}>
                <strong>💰 Total:</strong> ${selectedNotification.orderData.total}<br/>
                <strong>📍 Ubicación:</strong> {selectedNotification.orderData.deliveryLocation?.zone || 'No especificada'}, {selectedNotification.orderData.deliveryLocation?.city || 'No especificada'}<br/>
                <strong>⏰ Creado:</strong> {selectedNotification.createdAt.toDate().toLocaleString()}<br/>
                <strong>🚨 Urgente:</strong> {selectedNotification.isUrgent ? 'Sí' : 'No'}
              </Col>
              <Col md={6}>
                <strong>📋 Estado:</strong> {selectedNotification.status}<br/>
                <strong>🆔 ID Pedido:</strong> {selectedNotification.orderId}<br/>
                <strong>📧 Notificación:</strong> {selectedNotification.id}
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Cerrar
          </Button>
          {selectedNotification && (
            <Button 
              variant="success" 
              onClick={() => {
                handleAcceptOrder(selectedNotification);
                setShowDetailModal(false);
              }}
              disabled={loading}
            >
              ✅ Aceptar Pedido
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* 🚚 MODAL DE PROCESO DE ENTREGA */}
      <Modal show={showDeliveryModal} onHide={() => setShowDeliveryModal(false)} size="xl">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            🚚 Proceso de Entrega - Pedido #{deliveryOrder?.orderId?.substring(0, 8)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deliveryOrder && (
            <>
              {/* 📊 PROGRESO DE ENTREGA */}
              <Card className="mb-4">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">📊 Estado de Entrega</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-3">
                    <Col md={3}>
                      <div className={`text-center p-2 rounded ${currentStatus === 'assigned' ? 'bg-warning text-dark' : currentStatus === 'pending' ? 'bg-secondary text-white' : 'bg-success text-white'}`}>
                        <strong>📋 Asignado</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className={`text-center p-2 rounded ${currentStatus === 'picked_up' ? 'bg-warning text-dark' : ['delivered', 'in_transit'].includes(currentStatus) ? 'bg-success text-white' : 'bg-light'}`}>
                        <strong>📦 Recogido</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className={`text-center p-2 rounded ${currentStatus === 'in_transit' ? 'bg-warning text-dark' : currentStatus === 'delivered' ? 'bg-success text-white' : 'bg-light'}`}>
                        <strong>🚚 En Tránsito</strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className={`text-center p-2 rounded ${currentStatus === 'delivered' ? 'bg-success text-white' : 'bg-light'}`}>
                        <strong>✅ Entregado</strong>
                      </div>
                    </Col>
                  </Row>
                  
                  <ProgressBar className="mb-3">
                    <ProgressBar 
                      variant={currentStatus === 'assigned' ? 'warning' : 'success'}
                      now={currentStatus === 'pending' ? 0 : currentStatus === 'assigned' ? 25 : currentStatus === 'picked_up' ? 50 : currentStatus === 'in_transit' ? 75 : 100}
                      label={`${currentStatus === 'pending' ? 0 : currentStatus === 'assigned' ? 25 : currentStatus === 'picked_up' ? 50 : currentStatus === 'in_transit' ? 75 : 100}%`}
                    />
                  </ProgressBar>
                  
                  <Alert variant={currentStatus === 'delivered' ? 'success' : 'info'}>
                    <strong>Estado Actual:</strong> {getDeliveryStatusInfo(currentStatus).text}
                  </Alert>
                </Card.Body>
              </Card>

              {/* 📋 INFORMACIÓN DEL PEDIDO */}
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header className="bg-info text-white">
                      <h6 className="mb-0">👤 Información del Cliente</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>👤 Cliente:</strong> {deliveryOrder.userName}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>📧 Email:</strong> {deliveryOrder.userEmail}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>📍 Dirección:</strong> {deliveryOrder.deliveryLocation?.address || 'No especificada'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>🏙️ Ciudad:</strong> {deliveryOrder.deliveryLocation?.city || 'No especificada'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>📍 Zona:</strong> {deliveryOrder.deliveryLocation?.deliveryZone || 'No especificada'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>📞 Teléfono:</strong> {deliveryOrder.shipping?.phone || 'No disponible'}
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header className="bg-success text-white">
                      <h6 className="mb-0">💰 Información del Pedido</h6>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item>
                          <strong>💰 Total:</strong> <span className="text-success fs-4">${deliveryOrder.total}</span>
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>📅 Fecha:</strong> {new Date(deliveryOrder.date).toLocaleString()}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>📦 Productos:</strong> {deliveryOrder.items.length} artículos
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>🚚 Asignado a:</strong> {deliveryOrder.assignedTo || 'No asignado'}
                        </ListGroup.Item>
                        <ListGroup.Item>
                          <strong>⏰ Distancia estimada:</strong> {deliveryOrder.deliveryLocation?.estimatedDistance || 'N/A'} km
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* 📦 PRODUCTOS */}
              <Card className="mb-3">
                <Card.Header className="bg-warning text-dark">
                  <h6 className="mb-0">📦 Productos a Entregar</h6>
                </Card.Header>
                <Card.Body>
                  <ListGroup>
                    {deliveryOrder.items.map((item: any, index: number) => (
                      <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{item.name}</strong>
                          <br />
                          <small className="text-muted">Cantidad: {item.quantity}</small>
                        </div>
                        <div className="text-end">
                          <strong className="text-success">${item.price * item.quantity}</strong>
                          <br />
                          <small className="text-muted">${item.price} c/u</small>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>

              {/* 📝 NOTAS DE ENTREGA */}
              <Card className="mb-3">
                <Card.Header className="bg-secondary text-white">
                  <h6 className="mb-0">📝 Notas de Entrega</h6>
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Agregar notas sobre la entrega (opcional)..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* 🎛️ CONTROLES DE ESTADO */}
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">🎛️ Actualizar Estado de Entrega</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3}>
                      <Button
                        variant="info"
                        className="w-100 mb-2"
                        disabled={currentStatus === 'picked_up' || loading}
                        onClick={() => handleStatusUpdate('picked_up')}
                      >
                        📦 Marcar como Recogido
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button
                        variant="warning"
                        className="w-100 mb-2"
                        disabled={currentStatus === 'in_transit' || !['picked_up', 'assigned'].includes(currentStatus) || loading}
                        onClick={() => handleStatusUpdate('in_transit')}
                      >
                        🚚 En Tránsito
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button
                        variant="success"
                        className="w-100 mb-2"
                        disabled={currentStatus === 'delivered' || !['in_transit', 'picked_up'].includes(currentStatus) || loading}
                        onClick={() => handleStatusUpdate('delivered')}
                      >
                        ✅ Marcar como Entregado
                      </Button>
                    </Col>
                    <Col md={3}>
                      <Button
                        variant="danger"
                        className="w-100 mb-2"
                        disabled={currentStatus === 'cancelled' || currentStatus === 'delivered' || loading}
                        onClick={() => {
                          if (window.confirm('¿Estás seguro de que quieres cancelar esta entrega?')) {
                            handleStatusUpdate('cancelled');
                          }
                        }}
                      >
                        ❌ Cancelar Entrega
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeliveryModal(false)}>
            📱 Cerrar Panel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (deliveryOrder?.userEmail) {
                window.open(`mailto:${deliveryOrder.userEmail}?subject=Entrega de pedido #${deliveryOrder.orderId?.substring(0, 8)}&body=Hola ${deliveryOrder.userName}, me comunico contigo sobre la entrega de tu pedido.`);
              }
            }}
          >
            📞 Contactar Cliente
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DeliveryNotificationPanel;
