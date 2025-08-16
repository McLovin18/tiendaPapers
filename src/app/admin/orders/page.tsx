'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Table, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useRole } from '../../context/adminContext';
import jsPDF from 'jspdf';
// import { ProtectedRoute } from '../../utils/securityMiddleware';

// Componente temporal ProtectedRoute
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  return <>{children}</>;
};
import { 
  getAllOrderDays, 
  getDailyOrders, 
  getTodayOrders, 
  getOrdersStatistics,
  DailyOrdersDocument,
  DailyOrder 
} from '../../services/purchaseService';
import { 
  getPendingOrders, 
  getAllDeliveryOrders, // 🆕 Importar función para TODAS las órdenes
  assignOrderToDelivery, 
  getAvailableDeliveryUsers,
  DeliveryOrder 
} from '../../services/deliveryService';
import { db } from '../../utils/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { notificationService } from '../../services/notificationService';
import { EmailService } from '../../services/emailService';
import NavbarComponent from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import DeliverySettings from '../../components/DeliverySettings';
import TopbarMobile from '../../components/TopbarMobile';
import Footer from '../../components/Footer';
import StockAlert from '../../components/StockAlert';

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useRole();
  const [orderDays, setOrderDays] = useState<DailyOrdersDocument[]>([]);
  const [selectedDayOrders, setSelectedDayOrders] = useState<DailyOrdersDocument | null>(null);
  const [todayOrders, setTodayOrders] = useState<DailyOrdersDocument | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Estados para delivery management
  const [pendingDeliveries, setPendingDeliveries] = useState<DeliveryOrder[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<DeliveryOrder[]>([]); // 🆕 TODAS las órdenes
  const [availableDeliveryUsers, setAvailableDeliveryUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'deliveries' | 'delivery-settings'>('orders');
  
  // 🆕 Estados para monitoreo avanzado
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<DeliveryOrder | null>(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  
  // 🆕 Estados para filtro de fechas y exportación
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryOrder[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // 🔥 ESCUCHA EN TIEMPO REAL PARA ÓRDENES DE DELIVERY
  useEffect(() => {
    if (!user || !isAdmin) return;

    console.log('🎯 Admin: Configurando escucha en tiempo real para órdenes de delivery');
    
    let unsubscribe: (() => void) | null = null;

    const setupRealtimeListener = async () => {
      try {
        const { onSnapshot, collection, query, orderBy } = await import('firebase/firestore');
        
        // Escuchar cambios en deliveryOrders
        const deliveryOrdersQuery = query(
          collection(db, 'deliveryOrders'),
          orderBy('date', 'desc')
        );
        
        unsubscribe = onSnapshot(deliveryOrdersQuery, (snapshot) => {
          console.log(`🔄 Admin: Cambio detectado en deliveryOrders (${snapshot.docs.length} órdenes)`);
          
          const orders: DeliveryOrder[] = [];
          const pending: DeliveryOrder[] = [];
          
          snapshot.forEach((doc) => {
            const orderData = { id: doc.id, ...doc.data() } as DeliveryOrder;
            orders.push(orderData);
            
            if (orderData.status === 'pending') {
              pending.push(orderData);
            }
          });
          
          // Actualizar estados automáticamente
          setAllDeliveries(orders);
          setPendingDeliveries(pending);
          
          // Filtrar por fecha seleccionada
          const filtered = orders.filter(order => {
            if (!selectedDeliveryDate) return true;
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            return orderDate === selectedDeliveryDate;
          });
          setFilteredDeliveries(filtered);
          
          console.log(`📊 Admin: Actualizado - ${orders.length} total, ${pending.length} pendientes, ${filtered.length} filtradas`);
        }, (error) => {
          console.error('❌ Error en escucha en tiempo real:', error);
        });
        
      } catch (error) {
        console.error('❌ Error configurando escucha en tiempo real:', error);
      }
    };

    setupRealtimeListener();

    return () => {
      if (unsubscribe) {
        console.log('🔇 Admin: Desconectando escucha en tiempo real');
        unsubscribe();
      }
    };
  }, [user, isAdmin, selectedDeliveryDate]);

  useEffect(() => {
    if (user && isAdmin) {
      loadOrderData();
    }
  }, [user, isAdmin]);

  // 🆕 Filtrar entregas por fecha seleccionada
  useEffect(() => {
    if (allDeliveries.length > 0) {
      const filtered = allDeliveries.filter(delivery => {
        const deliveryDate = new Date(delivery.date).toISOString().split('T')[0];
        return deliveryDate === selectedDeliveryDate;
      });
      setFilteredDeliveries(filtered);
    }
  }, [allDeliveries, selectedDeliveryDate]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar días con pedidos
      const days = await getAllOrderDays();
      setOrderDays(days);

      // Cargar pedidos de hoy
      const today = await getTodayOrders();
      setTodayOrders(today);

      // Cargar estadísticas de los últimos 30 días
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const stats = await getOrdersStatistics(startDate, endDate);
      setStatistics(stats);

      // ✅ Cargar datos de delivery
      const pending = await getPendingOrders();
      setPendingDeliveries(pending);
      
      // 🆕 Cargar TODAS las órdenes de delivery para estadísticas correctas
      const allOrders = await getAllDeliveryOrders();
      setAllDeliveries(allOrders);
      
      const deliveryUsers = await getAvailableDeliveryUsers();
      setAvailableDeliveryUsers(deliveryUsers);

      // 🧹 LIMPIEZA AUTOMÁTICA DE NOTIFICACIONES AL CARGAR LA PÁGINA
      try {
        await notificationService.cleanupExpiredNotifications();
        console.log('🧹 Limpieza automática de notificaciones completada');
      } catch (cleanupError) {
        console.error('Error en limpieza automática:', cleanupError);
        // No fallar la carga principal por esto
      }

    } catch (error: any) {
      console.error('Error al cargar datos de pedidos:', error);
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permissions')) {
        setError(
          'Error de permisos: Las reglas de Firestore necesitan ser actualizadas para permitir acceso a la colección dailyOrders. ' +
          'Contacta al desarrollador para configurar los permisos correctos.'
        );
      } else {
        setError('Error al cargar los datos de pedidos: ' + (error?.message || 'Error desconocido'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: string) => {
    try {
      setSelectedDate(date);
      const dayOrders = await getDailyOrders(date);
      setSelectedDayOrders(dayOrders);
    } catch (error) {
      console.error('Error al cargar pedidos del día:', error);
      setError('Error al cargar pedidos del día seleccionado');
    }
  };

  // ✅ Función para asignar orden a repartidor
  const handleAssignDelivery = async (orderId: string, deliveryEmail: string) => {
    try {
      await assignOrderToDelivery(orderId, deliveryEmail);
      
      // Actualizar la lista local
      setPendingDeliveries(prev => prev.filter(order => order.id !== orderId));
      
      // 🆕 Recargar todas las órdenes para estadísticas actualizadas
      const allOrders = await getAllDeliveryOrders();
      setAllDeliveries(allOrders);
      
      // Mostrar éxito
      alert('✅ Orden asignada correctamente al repartidor');
      
    } catch (error) {
      console.error('Error asignando orden:', error);
      alert('❌ Error al asignar la orden');
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mostrar spinner mientras se verifica el rol de admin
  if (adminLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3 text-muted">Verificando permisos...</p>
      </Container>
    );
  }

  // Verificar si el usuario está autenticado
  if (!user) {
    return (
      <Container className="py-5 text-center">
        <Alert className="alert-cosmetic-warning">
          Debes iniciar sesión para acceder a esta página.
        </Alert>
      </Container>
    );
  }

  // Verificar si el usuario es administrador
  if (!isAdmin) {
    return (
      <Container className="py-5 text-center">
        <Alert className="alert-cosmetic-danger">
          <h4>🚫 Acceso Denegado</h4>
          <p>No tienes permisos para acceder al panel de administración.</p>
          <p className="small text-muted">
            Si crees que esto es un error, contacta al administrador del sistema.
          </p>
        </Alert>
      </Container>
    );
  }

  // ✅ Función para formatear fechas
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Función para obtener color del estado
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'picked_up': return 'primary';
      case 'in_transit': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // ✅ Función para obtener texto del estado
  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Pendiente';
      case 'assigned': return 'Asignado';
      case 'picked_up': return 'Recogido en Almacén';
      case 'in_transit': return 'En tránsito';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // ✅ Función para manejar órdenes urgentes
  const handleUrgentOrder = async (orderId: string) => {
    try {
      // Encontrar la orden completa
      const orderToMark = pendingDeliveries.find(order => order.id === orderId);
      if (!orderToMark) {
        alert('No se encontró la orden');
        return;
      }

      // Marcar como urgente en Firestore
      await updateDoc(doc(db, 'deliveryOrders', orderId), {
        isUrgent: true,
        urgentMarkedAt: new Date(),
        priority: 'high'
      });

      // 🚨 CREAR NOTIFICACIÓN URGENTE PARA TODOS LOS DELIVERY
      try {
        await notificationService.createUrgentNotificationForAll({
          id: orderToMark.id,
          orderId: orderToMark.id,
          userName: orderToMark.userName,
          userEmail: orderToMark.userEmail,
          total: orderToMark.total,
          items: orderToMark.items,
          deliveryLocation: orderToMark.deliveryLocation,
          shipping: orderToMark.shipping
        });
        
        console.log('🚨 Notificación urgente enviada a todos los repartidores');
      } catch (notificationError) {
        console.error('Error al enviar notificación urgente:', notificationError);
        // No detener el proceso si falla la notificación
      }

      alert('✅ Orden marcada como urgente y notificada a todos los repartidores');
      
      // Recargar datos
      const orders = await getPendingOrders();
      setPendingDeliveries(orders);
      
      // 🆕 También recargar todas las órdenes para estadísticas
      const allOrders = await getAllDeliveryOrders();
      setAllDeliveries(allOrders);
    } catch (error) {
      console.error('Error marking order as urgent:', error);
      alert('❌ Error al marcar como urgente');
    }
  };

  // 🆕 Función para exportar PDF del día seleccionado
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      const doc = new jsPDF();
      const selectedDateFormatted = new Date(selectedDeliveryDate).toLocaleDateString('es-ES');
      
      // Configurar fuente para mejor compatibilidad
      doc.setFont('helvetica');
      
      // Header con logo y título
      doc.setFontSize(24);
      doc.setTextColor(44, 62, 80); // Color azul oscuro
      doc.text('REPORTE DE ENTREGAS', 105, 25, { align: 'center' });
      
      // Línea decorativa
      doc.setDrawColor(52, 152, 219); // Color azul
      doc.setLineWidth(2);
      doc.line(20, 30, 190, 30);
      
      // Fecha
      doc.setFontSize(16);
      doc.setTextColor(52, 73, 94);
      doc.text(`Fecha: ${selectedDateFormatted}`, 20, 45);
      
      // Estadísticas del día en cajas
      const dayStats = {
        total: filteredDeliveries.length,
        entregadas: filteredDeliveries.filter(d => d.status === 'delivered').length,
        pendientes: filteredDeliveries.filter(d => 
          d.status === 'pending' || d.status === 'assigned' || d.status === 'picked_up' || d.status === 'in_transit'
        ).length,
        canceladas: filteredDeliveries.filter(d => d.status === 'cancelled').length
      };

      // Sección de resumen
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('RESUMEN DEL DIA', 20, 65);
      
      // Cajas de estadísticas
      let boxY = 75;
      const boxWidth = 40;
      const boxHeight = 25;
      const boxSpacing = 45;
      
      // Caja Total
      doc.setFillColor(52, 152, 219); // Azul
      doc.rect(20, boxY, boxWidth, boxHeight, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text(dayStats.total.toString(), 40, boxY + 12, { align: 'center' });
      doc.setFontSize(10);
      doc.text('TOTAL', 40, boxY + 20, { align: 'center' });
      
      // Caja Entregadas
      doc.setFillColor(46, 204, 113); // Verde
      doc.rect(20 + boxSpacing, boxY, boxWidth, boxHeight, 'F');
      doc.setFontSize(20);
      doc.text(dayStats.entregadas.toString(), 40 + boxSpacing, boxY + 12, { align: 'center' });
      doc.setFontSize(10);
      doc.text('ENTREGADAS', 40 + boxSpacing, boxY + 20, { align: 'center' });
      
      // Caja Pendientes
      doc.setFillColor(241, 196, 15); // Amarillo
      doc.rect(20 + boxSpacing * 2, boxY, boxWidth, boxHeight, 'F');
      doc.setFontSize(20);
      doc.text(dayStats.pendientes.toString(), 40 + boxSpacing * 2, boxY + 12, { align: 'center' });
      doc.setFontSize(10);
      doc.text('PENDIENTES', 40 + boxSpacing * 2, boxY + 20, { align: 'center' });
      
      // Caja Canceladas
      doc.setFillColor(231, 76, 60); // Rojo
      doc.rect(20 + boxSpacing * 3, boxY, boxWidth, boxHeight, 'F');
      doc.setFontSize(20);
      doc.text(dayStats.canceladas.toString(), 40 + boxSpacing * 3, boxY + 12, { align: 'center' });
      doc.setFontSize(10);
      doc.text('CANCELADAS', 40 + boxSpacing * 3, boxY + 20, { align: 'center' });

      // Tabla de órdenes
      let yPosition = 120;
      
      if (filteredDeliveries.length > 0) {
        // Título de la tabla
        doc.setTextColor(44, 62, 80);
        doc.setFontSize(14);
        doc.text('DETALLE DE ORDENES', 20, yPosition);
        yPosition += 15;

        // Header de la tabla con fondo
        doc.setFillColor(236, 240, 241); // Gris claro
        doc.rect(20, yPosition - 5, 170, 12, 'F');
        
        doc.setTextColor(44, 62, 80);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('HORA', 25, yPosition + 3);
        doc.text('CLIENTE', 55, yPosition + 3);
        doc.text('TOTAL', 105, yPosition + 3);
        doc.text('REPARTIDOR', 125, yPosition + 3);
        doc.text('ESTADO', 165, yPosition + 3);
        yPosition += 15;

        // Línea separadora
        doc.setDrawColor(189, 195, 199);
        doc.setLineWidth(0.5);
        doc.line(20, yPosition - 5, 190, yPosition - 5);

        // Datos de las órdenes
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        filteredDeliveries
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .forEach((order, index) => {
            if (yPosition > 260) {
              doc.addPage();
              yPosition = 30;
              
              // Repetir header en nueva página
              doc.setFillColor(236, 240, 241);
              doc.rect(20, yPosition - 5, 170, 12, 'F');
              doc.setTextColor(44, 62, 80);
              doc.setFontSize(10);
              doc.setFont('helvetica', 'bold');
              doc.text('HORA', 25, yPosition + 3);
              doc.text('CLIENTE', 55, yPosition + 3);
              doc.text('TOTAL', 105, yPosition + 3);
              doc.text('REPARTIDOR', 125, yPosition + 3);
              doc.text('ESTADO', 165, yPosition + 3);
              yPosition += 15;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
            }

            // Alternar color de fondo para filas
            if (index % 2 === 0) {
              doc.setFillColor(249, 249, 249);
              doc.rect(20, yPosition - 3, 170, 10, 'F');
            }

            const orderTime = new Date(order.date).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            });

            doc.setTextColor(52, 73, 94);
            doc.text(orderTime, 25, yPosition + 2);
            
            // Nombre del cliente (máximo 20 caracteres)
            const clientName = (order.userName || 'Sin nombre').substring(0, 20);
            doc.text(clientName, 55, yPosition + 2);
            
            // Total con formato de moneda
            doc.text(`$${order.total.toFixed(2)}`, 105, yPosition + 2);
            
            // Repartidor (solo nombre, sin @domain)
            const deliveryPerson = order.assignedTo 
              ? order.assignedTo.split('@')[0].substring(0, 15)
              : 'Sin asignar';
            doc.text(deliveryPerson, 125, yPosition + 2);
            
            // Estado con color
            const statusText = getStatusText(order.status);
            switch(order.status) {
              case 'delivered':
                doc.setTextColor(46, 204, 113); // Verde
                break;
              case 'pending':
                doc.setTextColor(241, 196, 15); // Amarillo
                break;
              case 'cancelled':
                doc.setTextColor(231, 76, 60); // Rojo
                break;
              default:
                doc.setTextColor(52, 152, 219); // Azul
            }
            doc.text(statusText.substring(0, 12), 165, yPosition + 2);
            
            yPosition += 12;
            
            // Línea sutil entre filas
            doc.setDrawColor(236, 240, 241);
            doc.setLineWidth(0.2);
            doc.line(20, yPosition - 6, 190, yPosition - 6);
          });
      } else {
        doc.setTextColor(149, 165, 166);
        doc.setFontSize(12);
        doc.text('No hay ordenes para mostrar en esta fecha.', 105, yPosition, { align: 'center' });
      }

      // Footer con información del sistema
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Línea decorativa en footer
        doc.setDrawColor(52, 152, 219);
        doc.setLineWidth(1);
        doc.line(20, 280, 190, 280);
        
        // Información del footer
        doc.setTextColor(127, 140, 141);
        doc.setFontSize(8);
        doc.text(`Generado el ${new Date().toLocaleString('es-ES')}`, 20, 290);
        doc.text('Sistema de Gestion de Entregas - Tienda Online', 105, 290, { align: 'center' });
        doc.text(`Pagina ${i} de ${pageCount}`, 190, 290, { align: 'right' });
      }

      // Descargar el PDF
      const fileName = `entregas-${selectedDateFormatted.replace(/\//g, '-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ Función para obtener nombre del cliente
  const getClientName = (order: DeliveryOrder) => {
    return order.userName || order.userEmail || 'Cliente desconocido';
  };

  // ✅ Función para obtener nombre del repartidor
  const getDeliveryPersonName = (deliveryPersonId?: string) => {
    if (!deliveryPersonId) return 'Sin asignar';
    const delivery = availableDeliveryUsers.find(d => d.uid === deliveryPersonId || d.email === deliveryPersonId);
    return delivery?.name || 'Repartidor desconocido';
  };

  // ✅ Función para marcar como urgente
  const markAsUrgent = async (orderId: string) => {
    try {
      // Encontrar la orden completa
      const orderToMark = pendingDeliveries.find(order => order.id === orderId);
      if (!orderToMark) {
        alert('No se encontró la orden');
        return;
      }

      // Marcar como urgente en Firestore
      await updateDoc(doc(db, 'deliveryOrders', orderId), {
        isUrgent: true,
        urgentMarkedAt: new Date(),
        priority: 'high'
      });

      // 🚨 CREAR NOTIFICACIÓN URGENTE PARA TODOS LOS DELIVERY
      try {
        await notificationService.createUrgentNotificationForAll({
          id: orderToMark.id,
          orderId: orderToMark.id,
          userName: orderToMark.userName,
          userEmail: orderToMark.userEmail,
          total: orderToMark.total,
          items: orderToMark.items,
          deliveryLocation: orderToMark.deliveryLocation,
          shipping: orderToMark.shipping
        });
        
        console.log('🚨 Notificación urgente enviada a todos los repartidores');
      } catch (notificationError) {
        console.error('Error al enviar notificación urgente:', notificationError);
        // No detener el proceso si falla la notificación
      }

      alert('✅ Pedido marcado como urgente y notificado a todos los repartidores');
      setShowOrderDetailsModal(false);
      
      // Recargar datos
      const orders = await getPendingOrders();
      setPendingDeliveries(orders);
      
      // 🆕 También recargar todas las órdenes para estadísticas
      const allOrders = await getAllDeliveryOrders();
      setAllDeliveries(allOrders);
    } catch (error) {
      console.error('Error marking order as urgent:', error);
      alert('❌ Error al marcar como urgente');
    }
  };

  // ✅ Función para contactar repartidor con notificación y email
  const contactDeliveryPerson = async (order: DeliveryOrder) => {
    if (!order.assignedTo) {
      alert('Esta orden no tiene repartidor asignado');
      return;
    }

    try {
      const repartidor = availableDeliveryUsers.find(d => d.email === order.assignedTo);
      const repartidorName = repartidor?.name || order.assignedTo?.split('@')[0] || 'Repartidor';

      const confirmed = confirm(
        `¿Contactar a ${repartidorName} sobre la entrega urgente?\n\n` +
        `Se enviará:\n` +
        `• Notificación push en la app\n` +
        `• Email al repartidor\n` +
        `• Marcará la orden como prioritaria`
      );

      if (!confirmed) return;

      // 1. Marcar orden como urgente en Firestore
      await updateDoc(doc(db, 'deliveryOrders', order.id || ''), {
        isUrgent: true,
        urgentMarkedAt: new Date(),
        priority: 'high',
        adminContactedAt: new Date(),
        adminContactReason: 'Seguimiento urgente solicitado por administrador'
      });

      // 2. Crear notificación específica para el repartidor asignado
      try {
        await addDoc(collection(db, 'deliveryNotifications'), {
          type: 'urgent_delivery', // Cambiar tipo para indicar que es para entrega urgente
          orderId: order.id,
          targetDeliveryEmail: order.assignedTo,
          targetDeliveryName: repartidorName,
          targetZones: [order.assignedTo], // Usar email como zona específica
          title: '🚨 ENTREGA URGENTE REQUERIDA',
          message: `El administrador solicita que entregues URGENTEMENTE el pedido #${order.id?.substring(0, 8)} asignado a ti. Cliente: ${order.userName}. Total: $${order.total}. Procede con la entrega inmediatamente.`,
          orderData: {
            userName: order.userName,
            userEmail: order.userEmail,
            total: order.total,
            items: order.items,
            deliveryLocation: order.deliveryLocation || {
              city: order.shipping?.city || 'No especificada',
              zone: order.shipping?.zone || 'No especificada', 
              address: order.shipping?.address || 'No especificada',
              phone: order.shipping?.phone || 'No especificado'
            },
            currentStatus: order.status // Incluir estado actual
          },
          adminMessage: `Este pedido YA ESTÁ ASIGNADO a ti. Solo necesitas acelerar la entrega. No requiere nueva aceptación.`,
          actionRequired: 'URGENT_DELIVERY', // Acción específica: entregar urgente
          currentOrderStatus: order.status,
          isAssignedOrder: true, // Marcar que ya está asignado
          status: 'pending',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 horas para entrega urgente
          priority: 'critical',
          isUrgent: true,
          assignedDeliveryPerson: order.assignedTo
        });

        console.log('📱 Notificación específica de entrega urgente enviada a:', order.assignedTo);
      } catch (notificationError) {
        console.error('Error enviando notificación específica:', notificationError);
      }

      // 3. NO enviar notificación general a todos si ya está asignado
      // Solo notificamos al repartidor específico para entrega urgente
      console.log('📱 Notificación específica enviada. No se envía a todos los repartidores porque ya está asignado.');

      // 3. Enviar email profesional usando el servicio de email
      EmailService.sendUrgentContactEmail({
        deliveryPersonEmail: order.assignedTo,
        deliveryPersonName: repartidorName,
        order: {
          id: order.id || '',
          userName: order.userName,
          userEmail: order.userEmail,
          total: order.total,
          shipping: order.shipping
        },
        adminMessage: 'Este pedido YA ESTÁ ASIGNADO a ti. Solo necesitas acelerar la entrega - no requiere nueva aceptación. Entregar lo antes posible.'
      });

      // 4. Mostrar confirmación al admin
      alert(`✅ Notificación de entrega urgente enviada a ${repartidorName}\n\n` +
            `• Notificación push enviada (entrega urgente)\n` +
            `• Email enviado al repartidor\n` +
            `• Orden marcada como urgente\n\n` +
            `El repartidor recibirá instrucciones para acelerar la entrega del pedido ya asignado.`);

      // 5. Recargar datos para mostrar el estado actualizado
      const orders = await getPendingOrders();
      setPendingDeliveries(orders);
      
      const allOrders = await getAllDeliveryOrders();
      setAllDeliveries(allOrders);

    } catch (error) {
      console.error('Error contactando repartidor:', error);
      alert('❌ Error al contactar repartidor. Inténtalo de nuevo.');
    }
  };

  // 📧 Función para enviar email simple de seguimiento (sin marcar como urgente)
  const sendFollowUpEmail = (order: DeliveryOrder) => {
    if (!order.assignedTo) {
      alert('Esta orden no tiene repartidor asignado');
      return;
    }

    const repartidor = availableDeliveryUsers.find(d => d.email === order.assignedTo);
    const repartidorName = repartidor?.name || order.assignedTo?.split('@')[0] || 'Repartidor';

    const template = EmailService.createFollowUpTemplate(order.assignedTo, {
      id: order.id,
      userName: order.userName,
      total: order.total
    });

    // Abrir email cliente con template simple
    const subject = encodeURIComponent(template.subject);
    const body = encodeURIComponent(template.text);
    window.open(`mailto:${order.assignedTo}?subject=${subject}&body=${body}`);
  };

  // 🧹 Función para limpiar notificaciones manualmente
  const handleCleanupNotifications = async () => {
    const confirmed = confirm(
      '¿Limpiar todas las notificaciones expiradas y completadas?\n\n' +
      'Esta acción:\n' +
      '• Marcará como expiradas las notificaciones vencidas\n' +
      '• Eliminará notificaciones muy antiguas (>24h)\n' +
      '• Limpiará notificaciones de pedidos ya entregados\n\n' +
      '¿Continuar?'
    );

    if (!confirmed) return;

    try {
      await notificationService.cleanupExpiredNotifications();
      
      // También limpiar notificaciones de todos los pedidos entregados
      const deliveredOrders = allDeliveries.filter(order => order.status === 'delivered');
      const cleanupPromises = deliveredOrders.map(order => 
        notificationService.cleanupNotificationsForOrder(order.id || order.orderId || '')
      );
      
      await Promise.all(cleanupPromises);
      
      alert(`✅ Limpieza completada exitosamente!\n\n` +
            `• Notificaciones expiradas procesadas\n` +
            `• ${deliveredOrders.length} pedidos entregados limpiados\n` +
            `• Notificaciones antiguas eliminadas`);
      
    } catch (error) {
      console.error('Error en limpieza:', error);
      alert('❌ Error durante la limpieza. Ver consola para detalles.');
    }
  };

  // ✅ Función para ver detalles del pedido
  const viewOrderDetails = (order: DeliveryOrder) => {
    setSelectedOrderDetails(order);
    setShowOrderDetailsModal(true);
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="d-flex flex-column min-vh-100">
        <TopbarMobile />
        
        <div className="d-flex flex-grow-1">
          <Sidebar />
          
          <main className="flex-grow-1 w-100" style={{ paddingTop: '1rem' }}>
          <Container fluid className="px-2 px-md-4">
            {/* Alertas de inventario */}
            <StockAlert className="mb-4" />
            
            {/* Header - Responsive */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mb-md-4">
              <div className="mb-2 mb-md-0">
                <h1 className="fw-bold text-cosmetic-tertiary mb-1 fs-3 fs-md-1">
                  <span className="d-none d-sm-inline">Panel de Administración</span>
                  <span className="d-sm-none">Admin Panel</span>
                </h1>
                <p className="text-muted mb-0 small">
                  <span className="d-none d-md-inline">Gestiona pedidos y asigna entregas</span>
                  <span className="d-md-none">Gestiona pedidos</span>
                </p>
              </div>
            </div>

            {/* Tabs de navegación - Responsive */}
            <div className="mb-3 mb-md-4">
              <div className="d-flex gap-2">
                <Button
                  className={activeTab === 'orders' ? 'btn-cosmetic-primary' : 'btn-outline-cosmetic-primary'}
                  size="sm"
                  className="flex-fill flex-md-grow-0"
                  onClick={() => setActiveTab('orders')}
                >
                  <i className="bi bi-clipboard-data me-1 me-md-2"></i>
                  <span className="d-none d-sm-inline">Pedidos</span>
                  <span className="d-sm-none">Orders</span>
                </Button>
                <Button
                  className={activeTab === 'deliveries' ? 'btn-cosmetic-primary' : 'btn-outline-cosmetic-primary'}
                  size="sm"
                  className="flex-fill flex-md-grow-0"
                  onClick={() => setActiveTab('deliveries')}
                >
                  <i className="bi bi-truck me-1 me-md-2"></i>
                  <span className="d-none d-sm-inline">Gestión Delivery</span>
                  <span className="d-sm-none">Delivery</span>
                  {pendingDeliveries.length > 0 && (
                    <Badge bg="danger" className="ms-1 ms-md-2">
                      {pendingDeliveries.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  className={activeTab === 'delivery-settings' ? 'btn-cosmetic-accent' : 'btn-outline-cosmetic-accent'}
                  size="sm"
                  className="flex-fill flex-md-grow-0"
                  onClick={() => setActiveTab('delivery-settings')}
                >
                  <i className="bi bi-person-gear me-1 me-md-2"></i>
                  <span className="d-none d-sm-inline">Delivery Settings</span>
                  <span className="d-sm-none">Settings</span>
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="alert-cosmetic-danger" dismissible onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* ✅ Contenido según tab activo */}
            {activeTab === 'orders' && (
              <>
                {/* Estadísticas generales */}
                {statistics && (
                  <Row className="mb-4">
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold" style={{ color: "var(--cosmetic-primary)" }}>{statistics.totalOrders}</h3>
                      <p className="text-muted mb-0 small">Pedidos (30 días)</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-success">{formatCurrency(statistics.totalAmount)}</h3>
                      <p className="text-muted mb-0 small">Ventas (30 días)</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-info">{formatCurrency(statistics.averageOrderValue)}</h3>
                      <p className="text-muted mb-0 small">Valor promedio</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={3}>
                  <Card className="text-center border-0 shadow-sm">
                    <Card.Body>
                      <h3 className="fw-bold text-warning">{statistics.averageOrdersPerDay.toFixed(1)}</h3>
                      <p className="text-muted mb-0 small">Pedidos/día promedio</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}

            {/* Pedidos de hoy */}
            {todayOrders && (
              <Card className="mb-4 border-0 shadow-sm">
                <Card.Header style={{ backgroundColor: "var(--cosmetic-primary)" }} className="text-white">
                  <h5 className="mb-0">📅 Pedidos de Hoy - {todayOrders.dateFormatted}</h5>
                  <small>Total: {todayOrders.totalOrdersCount} pedidos | {formatCurrency(todayOrders.totalDayAmount)}</small>
                </Card.Header>
                <Card.Body>
                  <Table responsive striped>
                    <thead>
                      <tr>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Productos</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayOrders.orders.map((order) => (
                        <tr key={order.id}>
                          <td>{order.orderTime}</td>
                          <td>
                            <div>
                              {/* Mostrar el nombre del usuario o email */}
                              <strong className="text-cosmetic-primary">
                                {order.userName || 
                                 (order.userEmail ? order.userEmail.split('@')[0] : 'Usuario')}
                              </strong>
                              {/* Siempre mostrar el email si está disponible */}
                              {order.userEmail ? (
                                <div className="small text-muted">{order.userEmail}</div>
                              ) : (
                                <div className="small text-muted">ID: {order.userId.substring(0, 12)}...</div>
                              )}
                              {/* TODO: Agregar campo de teléfono a DailyOrder si es necesario */}
                              {/* {order.shipping?.phone && (
                                <div className="small text-success fw-bold">
                                  <i className="bi bi-telephone me-1"></i>
                                  {order.shipping.phone}
                                </div>
                              )} */}
                            </div>
                          </td>
                          <td>
                            {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                          </td>
                          <td className="fw-bold text-success">{formatCurrency(order.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            )}

            <Row>
              {/* Lista de días con pedidos */}
              <Col lg={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">📋 Días con Pedidos</h5>
                  </Card.Header>
                  <Card.Body style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {loading ? (
                      <p className="text-center text-muted">Cargando...</p>
                    ) : orderDays.length === 0 ? (
                      <p className="text-center text-muted">No hay pedidos registrados</p>
                    ) : (
                      <div className="d-grid gap-2">
                        {orderDays.map((day) => (
                          <Button
                            key={day.date}
                            variant={selectedDate === day.date ? "primary" : "outline-primary"}
                            onClick={() => handleDateSelect(day.date)}
                            className="text-start"
                          >
                            <div>
                              <strong>{day.dateFormatted}</strong>
                              <br />
                              <small>
                                {day.totalOrdersCount} pedidos - {formatCurrency(day.totalDayAmount)}
                              </small>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Detalles del día seleccionado */}
              <Col lg={8}>
                {selectedDayOrders ? (
                  <Card className="border-0 shadow-sm">
                    <Card.Header>
                      <h5 className="mb-0">📝 Detalles - {selectedDayOrders.dateFormatted}</h5>
                      <small className="text-muted">
                        {selectedDayOrders.totalOrdersCount} pedidos | Total: {formatCurrency(selectedDayOrders.totalDayAmount)}
                      </small>
                    </Card.Header>
                    <Card.Body>
                      <Table responsive striped>
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Productos</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                            <th>Detalles</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedDayOrders.orders.map((order) => (
                            <tr key={order.id}>
                              <td>{order.orderTime}</td>
                              <td>
                                <div>
                                  {/* Mostrar el nombre del usuario o email */}
                                  <strong className="text-primary">
                                    {order.userName || 
                                     (order.userEmail ? order.userEmail.split('@')[0] : 'Usuario')}
                                  </strong>
                                  {/* Siempre mostrar el email si está disponible */}
                                  {order.userEmail ? (
                                    <div className="small text-muted">{order.userEmail}</div>
                                  ) : (
                                    <div className="small text-muted">ID: {order.userId.substring(0, 12)}...</div>
                                  )}
                                  {/* TODO: Agregar campo de teléfono a DailyOrder si es necesario */}
                                  {/* {order.shipping?.phone && (
                                    <div className="small text-success fw-bold">
                                      <i className="bi bi-telephone me-1"></i>
                                      {order.shipping.phone}
                                    </div>
                                  )} */}
                                </div>
                              </td>
                              <td>{order.items.length}</td>
                              <td>
                                {order.items.reduce((sum, item) => sum + item.quantity, 0)} unidades
                              </td>
                              <td className="fw-bold text-success">{formatCurrency(order.total)}</td>
                              <td>
                                <details>
                                  <summary className="btn btn-sm btn-outline-info">Ver items</summary>
                                  <div className="mt-2">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="small text-muted">
                                        • {item.name} - Qty: {item.quantity} - {formatCurrency(item.price * item.quantity)}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="text-center py-5">
                      <h5 className="text-muted">Selecciona un día para ver los pedidos</h5>
                      <p className="text-muted">Haz clic en cualquier día de la lista para ver sus detalles</p>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
            </>
            )}

            {/* ✅ Tab de Gestión de Delivery */}
            {activeTab === 'deliveries' && (
              <>
                <Row className="mb-4">
                  <Col>
                    <h3 className="fw-bold mb-3">
                      <i className="bi bi-truck me-2"></i>
                      Monitoreo de Entregas
                      <Badge bg="info" className="ms-2 fs-6">Sistema Automatizado</Badge>
                    </h3>
                    
                    {/* 📊 Resumen de Estados */}
                    <Row className="mb-4">
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-warning h-100">
                          <Card.Body className="text-center">
                            <i className="bi bi-clock-fill text-warning" style={{ fontSize: '2rem' }}></i>
                            <h4 className="mt-2 mb-1 text-warning">
                              {filteredDeliveries.filter(o => 
                                o.status === 'pending' || 
                                o.status === 'assigned' || 
                                o.status === 'picked_up' || 
                                o.status === 'in_transit'
                              ).length}
                            </h4>
                            <small className="text-muted">Pendientes</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-info h-100">
                          <Card.Body className="text-center">
                            <i className="bi bi-truck text-info" style={{ fontSize: '2rem' }}></i>
                            <h4 className="mt-2 mb-1 text-info">
                              {filteredDeliveries.filter(o => o.status === 'assigned').length}
                            </h4>
                            <small className="text-muted">Asignadas</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-primary h-100">
                          <Card.Body className="text-center">
                            <i className="bi bi-arrow-right-circle text-primary" style={{ fontSize: '2rem' }}></i>
                            <h4 className="mt-2 mb-1 text-primary">
                              {filteredDeliveries.filter(o => o.status === 'in_transit' || o.status === 'picked_up').length}
                            </h4>
                            <small className="text-muted">En tránsito</small>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={3} sm={6} className="mb-3">
                        <Card className="border-success h-100">
                          <Card.Body className="text-center">
                            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
                            <h4 className="mt-2 mb-1 text-success">
                              {filteredDeliveries.filter(o => o.status === 'delivered').length}
                            </h4>
                            <small className="text-muted">Entregadas</small>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    {/* 🚨 Alertas de Problemas */}
                    {filteredDeliveries.filter(o => {
                      const orderDate = new Date(o.date);
                      const hoursSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
                      return hoursSinceOrder > 24 && o.status !== 'delivered';
                    }).length > 0 && (
                      <Alert variant="danger" className="mb-4">
                        <Alert.Heading>
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          Órdenes con Retraso
                        </Alert.Heading>
                        <p className="mb-0">
                          Hay {filteredDeliveries.filter(o => {
                            const orderDate = new Date(o.date);
                            const hoursSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
                            return hoursSinceOrder > 24 && o.status !== 'delivered';
                          }).length} órdenes con más de 24 horas sin entregar. 
                          <strong> Revisar inmediatamente.</strong>
                        </p>
                      </Alert>
                    )}

                    {/* 📋 Tabla Completa de Monitoreo */}
                    <Card className="mb-4">
                      <Card.Header>
                        <Row className="align-items-center">
                          <Col md={6}>
                            <h5 className="mb-0">
                              📋 Monitoreo de Entregas
                            </h5>
                            <small className="text-muted">
                              Mostrando {filteredDeliveries.length} órdenes del {new Date(selectedDeliveryDate).toLocaleDateString('es-ES')}
                            </small>
                          </Col>
                          <Col md={6}>
                            <div className="d-flex gap-2 justify-content-end align-items-center">
                              <Form.Group className="mb-0">
                                <Form.Label className="small mb-1">Fecha:</Form.Label>
                                <Form.Control
                                  type="date"
                                  size="sm"
                                  value={selectedDeliveryDate}
                                  onChange={(e) => setSelectedDeliveryDate(e.target.value)}
                                  style={{ width: '150px' }}
                                />
                              </Form.Group>
                              <Button 
                                size="sm" 
                                variant="outline-primary"
                                onClick={() => window.location.reload()}
                                title="Actualizar datos"
                              >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Actualizar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-success"
                                onClick={handleExportPDF}
                                disabled={isExporting}
                                title="Exportar PDF del día seleccionado"
                              >
                                {isExporting ? (
                                  <Spinner size="sm" />
                                ) : (
                                  <i className="bi bi-download me-1"></i>
                                )}
                                Exportar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-warning"
                                onClick={handleCleanupNotifications}
                                title="Limpiar notificaciones expiradas y completadas"
                              >
                                <i className="bi bi-trash3 me-1"></i>
                                Limpiar
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Card.Header>
                      <Card.Body className="p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>Fecha/Hora</th>
                                <th>Cliente</th>
                                <th>Ubicación</th>
                                <th>Total</th>
                                <th>Repartidor</th>
                                <th>Estado</th>
                                <th>Tiempo</th>
                                <th>Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredDeliveries.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="text-center py-4 text-muted">
                                    <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
                                    <br />
                                    No hay entregas para mostrar en esta fecha
                                  </td>
                                </tr>
                              ) : (
                                filteredDeliveries
                                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .map((order) => {
                                    const orderDate = new Date(order.date);
                                    const hoursSinceOrder = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60);
                                    const isDelayed = hoursSinceOrder > 24 && order.status !== 'delivered';
                                    
                                    return (
                                      <tr key={order.id} className={isDelayed ? 'table-danger' : ''}>
                                        <td>
                                          <div>
                                            <small className="fw-bold">
                                              {orderDate.toLocaleDateString()}
                                            </small>
                                            <br />
                                            <small className="text-muted">
                                              {orderDate.toLocaleTimeString()}
                                            </small>
                                          </div>
                                        </td>
                                        <td>
                                          <div>
                                            <div className="fw-bold">{order.userName}</div>
                                            <small className="text-muted">{order.userEmail}</small>
                                            {order.shipping?.phone && (
                                              <div>
                                                <small className="text-success">
                                                  <i className="bi bi-telephone me-1"></i>
                                                  {order.shipping.phone}
                                                </small>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td>
                                          <div>
                                            <div className="fw-bold">{order.shipping?.zone || 'N/A'}</div>
                                            <small className="text-muted">{order.shipping?.city || 'N/A'}</small>
                                            {order.shipping?.address && (
                                              <div>
                                                <small className="text-muted">
                                                  {order.shipping.address.length > 30 
                                                    ? order.shipping.address.substring(0, 30) + '...'
                                                    : order.shipping.address
                                                  }
                                                </small>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td>
                                          <span className="fw-bold text-success">
                                            {formatCurrency(order.total)}
                                          </span>
                                          <br />
                                          <small className="text-muted">
                                            {order.items?.length || 0} items
                                          </small>
                                        </td>
                                        <td>
                                          {order.assignedTo ? (
                                            <div>
                                              <div className="fw-bold">
                                                {getDeliveryPersonName(order.assignedTo)}
                                              </div>
                                              <small className="text-muted">
                                                {order.assignedTo}
                                              </small>
                                              {order.assignedAt && (
                                                <div>
                                                  <small className="text-info">
                                                    Asignado: {new Date(order.assignedAt).toLocaleTimeString()}
                                                  </small>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="text-center">
                                              <Badge bg="warning" text="dark">
                                                <i className="bi bi-clock me-1"></i>
                                                Esperando...
                                              </Badge>
                                              <br />
                                              <small className="text-muted">Auto-asignación</small>
                                            </div>
                                          )}
                                        </td>
                                        <td>
                                          <Badge bg={getStatusColor(order.status)}>
                                            {getStatusText(order.status)}
                                          </Badge>
                                          {isDelayed && (
                                            <div className="mt-1">
                                              <Badge bg="danger" className="small">
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                Retrasado
                                              </Badge>
                                            </div>
                                          )}
                                        </td>
                                        <td>
                                          <div>
                                            <small className="text-muted">
                                              Hace {Math.floor(hoursSinceOrder)}h {Math.floor((hoursSinceOrder % 1) * 60)}m
                                            </small>
                                            {isDelayed && (
                                              <div>
                                                <small className="text-danger fw-bold">
                                                  ⚠️ +24h
                                                </small>
                                              </div>
                                            )}
                                          </div>
                                        </td>
                                        <td>
                                          <div className="d-flex flex-column gap-1">
                                            <Button
                                              size="sm"
                                              variant="outline-primary"
                                              onClick={() => {
                                                setSelectedOrderDetails(order);
                                                setShowOrderDetailsModal(true);
                                              }}
                                            >
                                              <i className="bi bi-eye"></i>
                                            </Button>
                                            {order.assignedTo && order.status !== 'delivered' && (
                                              <>
                                                <Button
                                                  size="sm"
                                                  variant="outline-info"
                                                  onClick={() => sendFollowUpEmail(order)}
                                                  title="Enviar email de seguimiento"
                                                >
                                                  <i className="bi bi-envelope"></i>
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline-warning"
                                                  onClick={() => contactDeliveryPerson(order)}
                                                  title="Contactar repartidor urgentemente"
                                                >
                                                  <i className="bi bi-exclamation-circle"></i>
                                                </Button>
                                              </>
                                            )}
                                            {isDelayed && (
                                              <Button
                                                size="sm"
                                                variant="outline-danger"
                                                onClick={() => {
                                                  // Función para marcar como urgente o reasignar
                                                  if (confirm('¿Marcar esta orden como urgente y notificar a todos los repartidores?')) {
                                                    handleUrgentOrder(order.id || '');
                                                  }
                                                }}
                                                title="Marcar como urgente"
                                              >
                                                <i className="bi bi-exclamation-triangle"></i>
                                              </Button>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </Card.Body>
                    </Card>

                    {/* 📊 Estadísticas Rápidas */}
                    <Row>
                      <Col md={6}>
                        <Card className="h-100">
                          <Card.Header>
                            <h6 className="mb-0">
                              <i className="bi bi-bar-chart me-2"></i>
                              Rendimiento del Día Seleccionado
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="row text-center">
                              <div className="col-4">
                                <h4 className="text-primary">{filteredDeliveries.length}</h4>
                                <small className="text-muted">Órdenes Total</small>
                              </div>
                              <div className="col-4">
                                <h4 className="text-success">{filteredDeliveries.filter(o => 
                                  o.status === 'delivered'
                                ).length}</h4>
                                <small className="text-muted">Entregadas</small>
                              </div>
                              <div className="col-4">
                                <h4 className="text-warning">{filteredDeliveries.filter(o => 
                                  (o.status === 'pending' || o.status === 'assigned' || o.status === 'picked_up' || o.status === 'in_transit')
                                ).length}</h4>
                                <small className="text-muted">Pendientes</small>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="h-100">
                          <Card.Header>
                            <h6 className="mb-0">
                              <i className="bi bi-people me-2"></i>
                              Repartidores Activos
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            {availableDeliveryUsers.length === 0 ? (
                              <div className="text-center text-muted">
                                <i className="bi bi-person-x" style={{ fontSize: '2rem' }}></i>
                                <p className="mt-2 mb-0">No hay repartidores disponibles</p>
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-2">
                                {availableDeliveryUsers.map((delivery, index) => (
                                  <div key={index} className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-bold">{delivery.name}</div>
                                      <small className="text-muted">{delivery.email}</small>
                                    </div>
                                    <Badge bg={delivery.active ? "success" : "secondary"} pill>
                                      {delivery.active ? "Activo" : "Inactivo"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    
                    {/* Información del sistema automatizado */}
                    <Alert variant="info" className="mt-4">
                      <Alert.Heading className="h6">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        Sistema Automatizado Activo
                      </Alert.Heading>
                      <p className="mb-0 small">
                        Las órdenes se asignan automáticamente a los repartidores disponibles mediante notificaciones en tiempo real. 
                        Como administrador, puedes monitorear todo el proceso y tomar acciones cuando sea necesario.
                      </p>
                    </Alert>

                    {/* Información de repartidores */}
                    <Card>
                      <Card.Header className="bg-info text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-people me-2"></i>
                          Repartidores Disponibles
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        {availableDeliveryUsers.length === 0 ? (
                          <Alert variant="warning">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            No hay repartidores configurados. Contacta al desarrollador para agregar repartidores.
                          </Alert>
                        ) : (
                          <Row>
                            {availableDeliveryUsers.map((delivery) => (
                              <Col xs={12} md={6} lg={4} key={delivery.email} className="mb-3">
                                <Card className="border-info h-100">
                                  <Card.Body className="text-center">
                                    <i className="bi bi-person-circle text-info" style={{ fontSize: '2rem' }}></i>
                                    <h6 className="mt-2 mb-1">{delivery.name}</h6>
                                    <small className="text-muted d-block mb-2">{delivery.email}</small>
                                    
                                    {/* ✅ Zonas preferidas */}
                                    {delivery.preferredZones && delivery.preferredZones.length > 0 && (
                                      <div className="mb-2">
                                        <small className="fw-bold text-primary">Zonas:</small><br />
                                        {delivery.preferredZones.map((zone: string, idx: number) => (
                                          <Badge key={idx} bg="info" className="me-1 mb-1">
                                            {zone}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {/* ✅ Distancia máxima */}
                                    {delivery.maxDistance && (
                                      <div>
                                        <small className="text-muted">
                                          📏 Máximo: {delivery.maxDistance}km
                                        </small>
                                      </div>
                                    )}
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* ✅ Tab de Delivery Settings */}
            {activeTab === 'delivery-settings' && (
              <DeliverySettings />
            )}
          </Container>
        </main>
      </div>
      
      {/* Modal de detalles del pedido */}
      <Modal show={showOrderDetailsModal} onHide={() => setShowOrderDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-eye me-2"></i>
            Detalles del Pedido {selectedOrderDetails?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderDetails && (
            <Row>
              <Col md={6}>
                <h6 className="text-primary">📋 Información del Cliente</h6>
                <p><strong>Cliente:</strong> {getClientName(selectedOrderDetails)}</p>
                <p><strong>Email:</strong> {selectedOrderDetails.userEmail}</p>
                <p><strong>Total:</strong> ${selectedOrderDetails.total}</p>
              </Col>
              <Col md={6}>
                <h6 className="text-success">🚚 Información de Entrega</h6>
                <p><strong>Estado:</strong> 
                  <Badge bg={getStatusColor(selectedOrderDetails.status)} className="ms-2">
                    {selectedOrderDetails.status}
                  </Badge>
                </p>
                <p><strong>Repartidor:</strong> {getDeliveryPersonName(selectedOrderDetails.assignedTo)}</p>
                <p><strong>Fecha Asignación:</strong> {formatDate(selectedOrderDetails.assignedAt)}</p>
                <p><strong>Fecha Creación:</strong> {formatDate(selectedOrderDetails.date)}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderDetailsModal(false)}>
            Cerrar
          </Button>
          {selectedOrderDetails?.status === 'pending' && (
            <Button variant="warning" onClick={() => markAsUrgent(selectedOrderDetails.id || '')}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Marcar como Urgente
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      <Footer />
    </div>
    </ProtectedRoute>
  );
}