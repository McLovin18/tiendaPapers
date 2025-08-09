// 📊 MONITOR DE CAPACIDAD FIREBASE - ANÁLISIS EN TIEMPO REAL
// Ejecutar: node firebase-capacity-monitor.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';

// Configuración Firebase
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

console.log('🔍 FIREBASE CAPACITY MONITOR');
console.log('============================');
console.log('📊 Analizando estructura y uso de datos...\n');

// Función para estimar operaciones de lectura/escritura
const analyzeFirebaseUsage = async () => {
  try {
    let totalDocuments = 0;
    let totalReads = 0;
    const analysis = {};

    // 1. Analizar Users
    console.log('👤 USUARIOS:');
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const userCount = usersSnapshot.size;
      totalDocuments += userCount;
      totalReads += userCount;
      
      console.log(`   📊 Total usuarios: ${userCount}`);
      
      // Estimar subcollections
      let totalPurchases = 0;
      let totalFavourites = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        try {
          const purchasesSnapshot = await getDocs(collection(db, `users/${userDoc.id}/purchases`));
          const favouritesSnapshot = await getDocs(collection(db, `users/${userDoc.id}/favourites`));
          
          totalPurchases += purchasesSnapshot.size;
          totalFavourites += favouritesSnapshot.size;
          totalReads += purchasesSnapshot.size + favouritesSnapshot.size;
        } catch (error) {
          // Usuario sin subcollections o permisos
        }
      }
      
      console.log(`   🛒 Total compras: ${totalPurchases}`);
      console.log(`   ❤️ Total favoritos: ${totalFavourites}`);
      
      analysis.users = {
        count: userCount,
        purchases: totalPurchases,
        favourites: totalFavourites,
        estimatedReadsPerDay: userCount * 2 // Login + datos básicos
      };
    } catch (error) {
      console.log('   ❌ Error accediendo a usuarios (normal si no tienes permisos)');
      analysis.users = { count: 0, purchases: 0, favourites: 0, estimatedReadsPerDay: 0 };
    }

    // 2. Analizar Inventory
    console.log('\n📦 INVENTARIO:');
    try {
      const inventorySnapshot = await getDocs(collection(db, 'inventory'));
      const inventoryCount = inventorySnapshot.size;
      totalDocuments += inventoryCount;
      totalReads += inventoryCount;
      
      console.log(`   📊 Total productos en inventario: ${inventoryCount}`);
      
      // Analizar stock
      let inStock = 0;
      let outOfStock = 0;
      let totalStock = 0;
      
      inventorySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.stock > 0) {
          inStock++;
          totalStock += data.stock;
        } else {
          outOfStock++;
        }
      });
      
      console.log(`   ✅ Productos con stock: ${inStock}`);
      console.log(`   ❌ Productos sin stock: ${outOfStock}`);
      console.log(`   📈 Stock total: ${totalStock} unidades`);
      
      analysis.inventory = {
        count: inventoryCount,
        inStock,
        outOfStock,
        totalStock,
        estimatedReadsPerOrder: 3 // Promedio productos por pedido
      };
    } catch (error) {
      console.log('   ❌ Error accediendo a inventario:', error.message);
      analysis.inventory = { count: 0, inStock: 0, outOfStock: 0, totalStock: 0, estimatedReadsPerOrder: 3 };
    }

    // 3. Analizar Productos
    console.log('\n🛍️ CATÁLOGO:');
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsCount = productsSnapshot.size;
      totalDocuments += productsCount;
      totalReads += productsCount;
      
      console.log(`   📊 Total productos en catálogo: ${productsCount}`);
      
      analysis.products = {
        count: productsCount,
        estimatedReadsPerVisit: 10 // Productos mostrados por página
      };
    } catch (error) {
      console.log('   ❌ Error accediendo a productos:', error.message);
      analysis.products = { count: 0, estimatedReadsPerVisit: 10 };
    }

    // 4. Analizar Daily Orders
    console.log('\n📅 PEDIDOS DIARIOS:');
    try {
      const dailyOrdersSnapshot = await getDocs(collection(db, 'dailyOrders'));
      const dailyOrdersCount = dailyOrdersSnapshot.size;
      totalDocuments += dailyOrdersCount;
      totalReads += dailyOrdersCount;
      
      let totalOrdersCount = 0;
      let totalRevenue = 0;
      let lastWeekOrders = 0;
      
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      dailyOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        totalOrdersCount += data.totalOrdersCount || 0;
        totalRevenue += data.totalDayAmount || 0;
        
        // Verificar si es de la última semana
        const docDate = new Date(data.date);
        if (docDate >= oneWeekAgo) {
          lastWeekOrders += data.totalOrdersCount || 0;
        }
      });
      
      console.log(`   📊 Días con pedidos registrados: ${dailyOrdersCount}`);
      console.log(`   🛒 Total pedidos históricos: ${totalOrdersCount}`);
      console.log(`   💰 Ingresos totales: $${totalRevenue.toFixed(2)}`);
      console.log(`   📈 Pedidos última semana: ${lastWeekOrders}`);
      
      const avgOrdersPerDay = lastWeekOrders / 7;
      console.log(`   📊 Promedio pedidos/día (última semana): ${avgOrdersPerDay.toFixed(1)}`);
      
      analysis.dailyOrders = {
        count: dailyOrdersCount,
        totalOrders: totalOrdersCount,
        totalRevenue,
        lastWeekOrders,
        avgOrdersPerDay,
        estimatedReadsPerDay: 1, // Admin dashboard
        estimatedWritesPerOrder: 1
      };
    } catch (error) {
      console.log('   ❌ Error accediendo a pedidos diarios (normal si no eres admin)');
      analysis.dailyOrders = { count: 0, totalOrders: 0, totalRevenue: 0, lastWeekOrders: 0, avgOrdersPerDay: 0, estimatedReadsPerDay: 1, estimatedWritesPerOrder: 1 };
    }

    // 5. Analizar Delivery Orders
    console.log('\n🚚 ÓRDENES DE ENTREGA:');
    try {
      const deliveryOrdersSnapshot = await getDocs(collection(db, 'deliveryOrders'));
      const deliveryOrdersCount = deliveryOrdersSnapshot.size;
      totalDocuments += deliveryOrdersCount;
      totalReads += deliveryOrdersCount;
      
      let pendingOrders = 0;
      let completedOrders = 0;
      
      deliveryOrdersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'pending') pendingOrders++;
        if (data.status === 'delivered') completedOrders++;
      });
      
      console.log(`   📊 Total órdenes de entrega: ${deliveryOrdersCount}`);
      console.log(`   ⏳ Órdenes pendientes: ${pendingOrders}`);
      console.log(`   ✅ Órdenes completadas: ${completedOrders}`);
      
      analysis.deliveryOrders = {
        count: deliveryOrdersCount,
        pending: pendingOrders,
        completed: completedOrders,
        estimatedReadsPerOrder: 2, // Crear + seguimiento
        estimatedWritesPerOrder: 3 // Crear + actualizaciones
      };
    } catch (error) {
      console.log('   ❌ Error accediendo a órdenes de entrega (normal si no tienes permisos)');
      analysis.deliveryOrders = { count: 0, pending: 0, completed: 0, estimatedReadsPerOrder: 2, estimatedWritesPerOrder: 3 };
    }

    // 6. CÁLCULOS DE CAPACIDAD
    console.log('\n🔥 ANÁLISIS DE CAPACIDAD FIREBASE:');
    console.log('=====================================');
    
    const currentOrdersPerDay = analysis.dailyOrders.avgOrdersPerDay || 0;
    const projectedOrdersPerDay = 300; // Meta del usuario
    
    console.log(`📊 Pedidos actuales/día: ${currentOrdersPerDay.toFixed(1)}`);
    console.log(`🎯 Meta pedidos/día: ${projectedOrdersPerDay}`);
    
    // Calcular operaciones por pedido
    const readsPerOrder = 
      analysis.inventory.estimatedReadsPerOrder + // Stock check
      2 + // User data + auth
      1; // Daily orders check
    
    const writesPerOrder = 
      analysis.inventory.estimatedReadsPerOrder + // Stock reduction
      analysis.dailyOrders.estimatedWritesPerOrder + // Daily order update
      analysis.deliveryOrders.estimatedWritesPerOrder + // Delivery order
      1; // User purchase record
    
    console.log(`\n📖 Reads estimados por pedido: ${readsPerOrder}`);
    console.log(`✍️ Writes estimados por pedido: ${writesPerOrder}`);
    
    // Proyecciones para 300 pedidos/día
    const dailyReads = projectedOrdersPerDay * readsPerOrder + analysis.products.estimatedReadsPerVisit * 100; // +1000 visitas/día
    const dailyWrites = projectedOrdersPerDay * writesPerOrder;
    const monthlyReads = dailyReads * 30;
    const monthlyWrites = dailyWrites * 30;
    
    console.log(`\n📊 PROYECCIÓN PARA ${projectedOrdersPerDay} PEDIDOS/DÍA:`);
    console.log(`   📖 Reads/día: ${dailyReads.toLocaleString()}`);
    console.log(`   ✍️ Writes/día: ${dailyWrites.toLocaleString()}`);
    console.log(`   📖 Reads/mes: ${monthlyReads.toLocaleString()}`);
    console.log(`   ✍️ Writes/mes: ${monthlyWrites.toLocaleString()}`);
    
    // Límites del plan gratuito
    const freeTierReadsPerMonth = 1500000; // 50K/día * 30
    const freeTierWritesPerMonth = 600000; // 20K/día * 30
    
    console.log(`\n🆓 LÍMITES PLAN GRATUITO:`);
    console.log(`   📖 Reads/mes: ${freeTierReadsPerMonth.toLocaleString()}`);
    console.log(`   ✍️ Writes/mes: ${freeTierWritesPerMonth.toLocaleString()}`);
    
    const readsWithinLimit = monthlyReads <= freeTierReadsPerMonth;
    const writesWithinLimit = monthlyWrites <= freeTierWritesPerMonth;
    
    console.log(`\n✅ ANÁLISIS DE VIABILIDAD:`);
    console.log(`   📖 Reads dentro del límite: ${readsWithinLimit ? '✅ SÍ' : '❌ NO'}`);
    console.log(`   ✍️ Writes dentro del límite: ${writesWithinLimit ? '✅ SÍ' : '❌ NO'}`);
    
    if (!readsWithinLimit || !writesWithinLimit) {
      console.log(`\n💳 MIGRACIÓN A PLAN BLAZE REQUERIDA:`);
      
      // Calcular costos adicionales
      const extraReads = Math.max(0, monthlyReads - freeTierReadsPerMonth);
      const extraWrites = Math.max(0, monthlyWrites - freeTierWritesPerMonth);
      
      const readsCost = (extraReads / 100000) * 0.06; // $0.06 per 100K
      const writesCost = (extraWrites / 100000) * 0.18; // $0.18 per 100K
      const estimatedMonthlyCost = readsCost + writesCost;
      
      console.log(`   💰 Costo estimado adicional: $${estimatedMonthlyCost.toFixed(2)}/mes`);
      console.log(`   📊 Total con storage (~$2): $${(estimatedMonthlyCost + 2).toFixed(2)}/mes`);
    } else {
      console.log(`\n🎉 ¡EXCELENTE! El plan gratuito es suficiente para ${projectedOrdersPerDay} pedidos/día`);
    }
    
    // Resumen de documentos actuales
    console.log(`\n📋 RESUMEN ACTUAL:`);
    console.log(`   📊 Total documentos: ${totalDocuments.toLocaleString()}`);
    console.log(`   📖 Reads realizados en este análisis: ${totalReads.toLocaleString()}`);
    console.log(`   💾 Tamaño estimado DB: ${(totalDocuments * 2 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error en análisis:', error);
  }
};

// Ejecutar análisis
analyzeFirebaseUsage().then(() => {
  console.log('\n🏁 Análisis completado');
  console.log('📖 Revisa FIREBASE_CAPACITY_ANALYSIS.md para más detalles');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
