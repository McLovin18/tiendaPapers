'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Modal, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/adminContext';
import { notificationService, type DeliveryNotification } from '../services/notificationService';
import { assignOrderToDelivery } from '../services/deliveryService';

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

  // 🔔 MANEJAR ACEPTAR PEDIDO
  const handleAcceptOrder = async (notification: DeliveryNotification) => {
    if (!user?.email || !notification.id) return;
    
    setLoading(true);
    try {
      // Asignar el pedido al delivery
      await assignOrderToDelivery(notification.orderId, user.email);
      
      // Actualizar el estado de la notificación usando acceptDeliveryOrder
      await notificationService.acceptDeliveryOrder(notification.id, user.email);
      
      // Remover la notificación de la lista
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      
      console.log(`✅ Pedido ${notification.orderId} aceptado por ${user.email}`);
    } catch (error) {
      console.error('Error aceptando pedido:', error);
      alert('Error al aceptar el pedido. Inténtalo de nuevo.');
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
              {loading ? "⏳" : "✅"} Aceptar
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
    </div>
  );
};

export default DeliveryNotificationPanel;
