import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD_cNgqH5tPKWKhpXX6rXZgKLZlXCiIFvY",
  authDomain: "tiendaonline-ac6c5.firebaseapp.com",
  projectId: "tiendaonline-ac6c5",
  storageBucket: "tiendaonline-ac6c5.firebasestorage.app",
  messagingSenderId: "798731552206",
  appId: "1:798731552206:web:e7afd24af7e1030e0fe04f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugDeliveryZones() {
  console.log('🔍 Analizando usuarios delivery y sus zonas...\n');

  try {
    // Obtener todos los delivery users
    const deliverySnapshot = await getDocs(collection(db, 'deliveryUsers'));
    
    if (deliverySnapshot.empty) {
      console.log('❌ No hay usuarios delivery en la base de datos');
      return;
    }

    console.log(`📦 Encontrados ${deliverySnapshot.size} usuarios delivery:\n`);

    deliverySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`👤 Usuario: ${data.email || 'Sin email'}`);
      console.log(`   - Activo: ${data.active ? '✅' : '❌'}`);
      console.log(`   - Zonas asignadas: ${JSON.stringify(data.zones || [])}`);
      console.log(`   - Creado: ${data.createdAt?.toDate?.()?.toISOString() || 'Sin fecha'}\n`);
    });

    // Obtener notificaciones pendientes para ver qué zonas target tienen
    console.log('\n🔔 Verificando notificaciones pendientes...\n');
    const notificationsSnapshot = await getDocs(collection(db, 'deliveryNotifications'));
    
    if (notificationsSnapshot.empty) {
      console.log('ℹ️ No hay notificaciones en la base de datos');
      return;
    }

    console.log(`📬 Encontradas ${notificationsSnapshot.size} notificaciones:\n`);

    notificationsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`📋 Notificación ID: ${doc.id}`);
      console.log(`   - Estado: ${data.status}`);
      console.log(`   - Zonas target: ${JSON.stringify(data.targetZones || [])}`);
      console.log(`   - Zona del pedido: ${data.orderData?.deliveryLocation?.zone || 'Sin zona'}`);
      console.log(`   - Ciudad del pedido: ${data.orderData?.deliveryLocation?.city || 'Sin ciudad'}`);
      console.log(`   - Creado: ${data.createdAt?.toDate?.()?.toISOString() || 'Sin fecha'}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDeliveryZones();
