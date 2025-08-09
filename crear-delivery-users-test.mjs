import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function createDeliveryUser() {
  console.log('🚀 Creando usuario delivery de prueba...\n');

  try {
    // Crear usuario delivery con zona 'guayaquil-sur'
    await setDoc(doc(db, 'deliveryUsers', 'deliverysur@test.com'), {
      email: 'deliverysur@test.com',
      name: 'Delivery Sur Test',
      phone: '+593987654321',
      zones: ['guayaquil-sur'], // ← Zona específica para el delivery sur
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Usuario delivery SUR creado exitosamente');
    console.log('   - Email: deliverysur@test.com');
    console.log('   - Zonas: ["guayaquil-sur"]');

    // Crear otro usuario delivery con zona 'guayaquil-centro'
    await setDoc(doc(db, 'deliveryUsers', 'deliverycentro@test.com'), {
      email: 'deliverycentro@test.com',
      name: 'Delivery Centro Test',
      phone: '+593987654322',
      zones: ['guayaquil-centro'], // ← Zona específica para el delivery centro
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Usuario delivery CENTRO creado exitosamente');
    console.log('   - Email: deliverycentro@test.com');
    console.log('   - Zonas: ["guayaquil-centro"]');

    console.log('\n🎯 Ahora puedes probar:');
    console.log('1. Seleccionar zona "Sur" en el selector de ubicación');
    console.log('2. El delivery "deliverysur@test.com" debería recibir la notificación');
    console.log('3. El delivery "deliverycentro@test.com" NO debería recibir la notificación');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createDeliveryUser();
