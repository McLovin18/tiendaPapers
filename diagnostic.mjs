import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';

// Firebase config (debe coincidir con tu config)
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

// Verificar dailyOrders
const checkDailyOrders = async () => {
  console.log("🔍 Verificando dailyOrders...");
  try {
    const q = query(collection(db, "dailyOrders"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Total documentos en dailyOrders: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📅 ${doc.id}:`, {
        fecha: data.date,
        fechaFormateada: data.dateFormatted,
        pedidos: data.totalOrdersCount,
        total: data.totalDayAmount,
        ordenes: data.orders?.length || 0
      });
    });
  } catch (error) {
    console.error("❌ Error verificando dailyOrders:", error);
  }
};

// Verificar purchases de usuarios
const checkUserPurchases = async () => {
  console.log("\n🔍 Verificando purchases de usuarios...");
  
  // Usuario admin conocido
  const userId = "byRByEqdFOYxXOmUu9clvujvIUg1";
  
  try {
    const userPurchasesCol = collection(db, `users/${userId}/purchases`);
    const q = query(userPurchasesCol, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    console.log(`👤 Usuario ${userId}: ${snapshot.size} compras`);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  📦 ${doc.id}:`, {
        fecha: data.date,
        total: data.total,
        purchaseId: data.purchaseId,
        items: data.items?.length || 0
      });
    });
  } catch (error) {
    console.error(`❌ Error verificando usuario ${userId}:`, error);
  }
};

const runDiagnostic = async () => {
  try {
    await checkDailyOrders();
    await checkUserPurchases();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    process.exit(1);
  }
};

runDiagnostic();
