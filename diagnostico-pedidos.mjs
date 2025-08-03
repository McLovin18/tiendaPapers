// ✅ SCRIPT DE DIAGNÓSTICO TEMPORAL - Para verificar pedidos
// Este archivo debe ser eliminado después del diagnóstico

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

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

const diagnosticoPedidos = async () => {
  console.log('🔍 DIAGNÓSTICO DE PEDIDOS');
  console.log('========================');

  try {
    // 1. Verificar dailyOrders
    console.log('\n📅 DAILY ORDERS:');
    const dailyOrdersQuery = query(collection(db, 'dailyOrders'), orderBy('date', 'desc'));
    const dailyOrdersSnapshot = await getDocs(dailyOrdersQuery);
    console.log(`Total documentos en dailyOrders: ${dailyOrdersSnapshot.size}`);
    
    let totalOrdersInDaily = 0;
    dailyOrdersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  📄 ${doc.id}: ${data.totalOrdersCount} pedidos, $${data.totalDayAmount}`);
      totalOrdersInDaily += data.totalOrdersCount;
    });
    console.log(`🔢 Total de pedidos en dailyOrders: ${totalOrdersInDaily}`);

    // 2. Verificar compras del usuario admin
    console.log('\n👤 COMPRAS DEL USUARIO ADMIN:');
    const userId = 'byRByEqdFOYxXOmUu9clvujvIUg1';
    const userPurchasesQuery = query(
      collection(db, `users/${userId}/purchases`),
      orderBy('date', 'desc')
    );
    const userPurchasesSnapshot = await getDocs(userPurchasesQuery);
    console.log(`Total compras del usuario admin: ${userPurchasesSnapshot.size}`);
    
    userPurchasesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  🛒 ${doc.id}: $${data.total} - ${data.date} - Items: ${data.items?.length || 0}`);
    });

    console.log('\n🔍 RESUMEN:');
    console.log(`- dailyOrders: ${dailyOrdersSnapshot.size} días con ${totalOrdersInDaily} pedidos`);
    console.log(`- Compras usuario admin: ${userPurchasesSnapshot.size} pedidos`);
    
    if (userPurchasesSnapshot.size !== totalOrdersInDaily) {
      console.log('⚠️ DISCREPANCIA DETECTADA: Las compras del usuario no coinciden con dailyOrders');
    } else {
      console.log('✅ Los números coinciden correctamente');
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  }
};

diagnosticoPedidos();
