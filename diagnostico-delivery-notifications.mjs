// 🔍 DIAGNÓSTICO DE NOTIFICACIONES DE DELIVERY
// Script para verificar por qué los pedidos no aparecen en el panel de delivery

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB85qfCgbUJYNPcpHYqAmZELhlVJfxMvNQ",
  authDomain: "tienda-online-d6b42.firebaseapp.com",
  projectId: "tienda-online-d6b42",
  storageBucket: "tienda-online-d6b42.firebasestorage.app",
  messagingSenderId: "369552999041",
  appId: "1:369552999041:web:0db3e1c7c4a35c91fe1b5a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const diagnosticoDeliveryNotifications = async () => {
  console.log('🔍 DIAGNÓSTICO DE NOTIFICACIONES DE DELIVERY');
  console.log('===========================================\n');

  try {
    // 1. Verificar deliveryNotifications
    console.log('📱 DELIVERY NOTIFICATIONS:');
    const notificationsQuery = query(collection(db, 'deliveryNotifications'), orderBy('createdAt', 'desc'));
    const notificationsSnapshot = await getDocs(notificationsQuery);
    console.log(`Total notificaciones: ${notificationsSnapshot.size}\n`);
    
    if (notificationsSnapshot.size === 0) {
      console.log('❌ NO HAY NOTIFICACIONES DE DELIVERY - Este es el problema principal\n');
    } else {
      notificationsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📋 Notificación ID: ${doc.id}`);
        console.log(`   📦 Order ID: ${data.orderId}`);
        console.log(`   👤 Usuario: ${data.orderData?.userName}`);
        console.log(`   💰 Total: $${data.orderData?.total}`);
        console.log(`   📍 Zonas objetivo: ${JSON.stringify(data.targetZones)}`);
        console.log(`   ⏰ Estado: ${data.status}`);
        console.log(`   🚨 Urgente: ${data.isUrgent || false}`);
        console.log(`   📅 Creado: ${data.createdAt?.toDate()}`);
        console.log(`   📍 Ubicación: ${JSON.stringify(data.orderData?.deliveryLocation)}\n`);
      });
    }

    // 2. Verificar deliveryOrders
    console.log('📦 DELIVERY ORDERS:');
    const ordersQuery = query(collection(db, 'deliveryOrders'), orderBy('date', 'desc'));
    const ordersSnapshot = await getDocs(ordersQuery);
    console.log(`Total órdenes de delivery: ${ordersSnapshot.size}\n`);
    
    if (ordersSnapshot.size === 0) {
      console.log('❌ NO HAY ÓRDENES DE DELIVERY - También es un problema\n');
    } else {
      ordersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📋 Orden ID: ${doc.id}`);
        console.log(`   📦 Order ID: ${data.orderId}`);
        console.log(`   👤 Usuario: ${data.userName}`);
        console.log(`   💰 Total: $${data.total}`);
        console.log(`   🚚 Estado: ${data.status}`);
        console.log(`   👨‍💼 Asignado a: ${data.assignedTo || 'No asignado'}`);
        console.log(`   📍 Ubicación: ${JSON.stringify(data.deliveryLocation)}`);
        console.log(`   📍 Shipping: ${JSON.stringify(data.shipping)}\n`);
      });
    }

    // 3. Verificar purchases recientes en la colección global Y en subcolecc iones de usuarios
    console.log('🛒 PURCHASES RECIENTES:');
    
    // Primero intentar la colección global
    let purchasesQuery = query(collection(db, 'purchases'), orderBy('date', 'desc'));
    let purchasesSnapshot = await getDocs(purchasesQuery);
    console.log(`Total compras en colección global: ${purchasesSnapshot.size}`);
    
    let recentPurchases = 0;
    let allPurchases = [];
    
    // Si hay compras en la colección global
    if (purchasesSnapshot.size > 0) {
      purchasesSnapshot.forEach((doc) => {
        const data = doc.data();
        allPurchases.push({ id: doc.id, ...data, source: 'global' });
      });
    }
    
    // También buscar en subcolecc iones de usuarios (más probable)
    const usersSnapshot = await getDocs(collection(db, 'users'));
    console.log(`Verificando ${usersSnapshot.size} usuarios para subcolecc iones...\n`);
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userPurchasesQuery = query(
          collection(db, `users/${userDoc.id}/purchases`),
          orderBy('date', 'desc')
        );
        const userPurchasesSnapshot = await getDocs(userPurchasesQuery);
        
        if (userPurchasesSnapshot.size > 0) {
          console.log(`👤 Usuario ${userDoc.id}: ${userPurchasesSnapshot.size} compras`);
          userPurchasesSnapshot.forEach((doc) => {
            const data = doc.data();
            allPurchases.push({ 
              id: doc.id, 
              ...data, 
              source: `user/${userDoc.id}`,
              userId: userDoc.id 
            });
          });
        }
      } catch (error) {
        // Ignorar errores de subcolecc iones que no existen
      }
    }
    
    console.log(`\nTotal compras encontradas: ${allPurchases.length}\n`);
    
    // 3.5. NUEVO: Verificar dailyOrders para confirmar que las compras se registran
    console.log('📅 DAILY ORDERS (donde se registran las compras):');
    const dailyOrdersQuery = query(collection(db, 'dailyOrders'), orderBy('date', 'desc'));
    const dailyOrdersSnapshot = await getDocs(dailyOrdersQuery);
    console.log(`Total días en dailyOrders: ${dailyOrdersSnapshot.size}\n`);
    
    let totalOrdersInDaily = 0;
    if (dailyOrdersSnapshot.size > 0) {
      dailyOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📅 Día: ${doc.id}`);
        console.log(`   📦 Total pedidos: ${data.totalOrdersCount}`);
        console.log(`   💰 Total dinero: $${data.totalDayAmount}`);
        console.log(`   📋 Pedidos: ${JSON.stringify(data.orders?.slice(0, 2) || 'No hay detalles')}\n`);
        totalOrdersInDaily += data.totalOrdersCount || 0;
      });
    } else {
      console.log('❌ NO HAY DAILY ORDERS - Las compras no se están registrando en absoluto\n');
    }
    
    // Mostrar todas las compras encontradas
    allPurchases.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    allPurchases.forEach((purchase) => {
      const purchaseDate = new Date(purchase.date);
      const hoursSinceCreated = (new Date() - purchaseDate) / (1000 * 60 * 60);
      
      if (hoursSinceCreated < 24) { // Últimas 24 horas
        recentPurchases++;
      }
      
      console.log(`📋 Compra ID: ${purchase.id}`);
      console.log(`   👤 Usuario: ${purchase.userName}`);
      console.log(`   💰 Total: $${purchase.total}`);
      console.log(`   📅 Fecha: ${purchase.date}`);
      console.log(`   ⏰ Hace: ${hoursSinceCreated.toFixed(1)} horas`);
      console.log(`   📍 Origen: ${purchase.source}`);
      console.log(`   📍 Shipping: ${JSON.stringify(purchase.shipping)}\n`);
    });

    // 4. Resumen y diagnóstico
    console.log('🔍 RESUMEN DEL DIAGNÓSTICO:');
    console.log('===========================');
    console.log(`📊 Compras totales: ${allPurchases.length}`);
    console.log(`📊 Compras recientes (24h): ${recentPurchases}`);
    console.log(`📊 Pedidos en dailyOrders: ${totalOrdersInDaily}`);
    console.log(`📊 Órdenes de delivery: ${ordersSnapshot.size}`);
    console.log(`📊 Notificaciones de delivery: ${notificationsSnapshot.size}\n`);

    // 5. Identificar problemas
    console.log('🔧 ANÁLISIS DE PROBLEMAS:');
    console.log('=========================');
    
    // 5. Identificar problemas
    console.log('🔧 ANÁLISIS DE PROBLEMAS:');
    console.log('=========================');
    
    if (totalOrdersInDaily > 0 && ordersSnapshot.size === 0) {
      console.log('❌ PROBLEMA PRINCIPAL: Hay compras en dailyOrders pero NO se están creando órdenes de delivery');
      console.log('   💡 Causa probable: Error en createDeliveryOrder() en cart/page.tsx');
      console.log('   🔧 Solución: Revisar errores de JavaScript en la consola del navegador');
    }
    
    if (ordersSnapshot.size > 0 && notificationsSnapshot.size === 0) {
      console.log('❌ PROBLEMA: Hay órdenes de delivery pero NO se están creando notificaciones');
      console.log('   💡 Causa probable: Error en notificationService.createNotification() en cart/page.tsx');
    }
    
    if (totalOrdersInDaily === 0) {
      console.log('❌ PROBLEMA CRÍTICO: No hay pedidos en dailyOrders');
      console.log('   💡 Las compras no se están procesando en absoluto');
      console.log('   🔧 Revisar savePurchase() en cart/page.tsx');
    }
    
    if (recentPurchases === 0 && totalOrdersInDaily > 0) {
      console.log('⚠️ INFO: Hay pedidos en dailyOrders pero no en purchases/users');
      console.log('   💡 Las compras se guardan en dailyOrders pero no en subcolecc iones');
    }
    
    if (notificationsSnapshot.size > 0) {
      console.log('✅ Las notificaciones se están creando correctamente');
      console.log('   💡 Verifica que el delivery esté logueado y en la página correcta');
    }
    
    // Diagnóstico específico del flujo
    console.log('\n🔄 FLUJO ESPERADO:');
    console.log('==================');
    console.log('1. Cliente hace compra → Se guarda en dailyOrders ✅');
    console.log(`2. Se crea deliveryOrder → ${ordersSnapshot.size > 0 ? '✅ OK' : '❌ FALLA AQUÍ'}`);
    console.log(`3. Se crea notificación → ${notificationsSnapshot.size > 0 ? '✅ OK' : '❌ FALLA AQUÍ'}`);
    console.log('4. Delivery ve notificación → Pendiente de prueba');
    
    if (totalOrdersInDaily > 0 && ordersSnapshot.size === 0) {
      console.log('\n💡 ACCIÓN RECOMENDADA:');
      console.log('======================');
      console.log('1. Abre la consola del navegador (F12)');
      console.log('2. Haz una compra de prueba');
      console.log('3. Revisa si hay errores de JavaScript');
      console.log('4. Busca mensajes de "Error en creación de delivery/notificación"');
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
};

diagnosticoDeliveryNotifications();
