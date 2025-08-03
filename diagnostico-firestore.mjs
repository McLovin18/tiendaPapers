import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCCdWpgIwZ9YHJhj2KMDp_jBhQZRjkpWgw",
  authDomain: "tiendaonline-6f9e1.firebaseapp.com",
  projectId: "tiendaonline-6f9e1",
  storageBucket: "tiendaonline-6f9e1.firebasestorage.app",
  messagingSenderId: "1067529068516",
  appId: "1:1067529068516:web:2c458ae00d1f6e6c9ec6e0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('🔧 DIAGNÓSTICO DE REGLAS FIRESTORE - dailyOrders');
console.log('================================================');

// Función para probar las reglas de Firestore
async function testFirestoreRules() {
  try {
    // Esperar a que se establezca el estado de autenticación
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe(); // Desuscribirse inmediatamente
        
        console.log('👤 Estado de autenticación:', user ? 'Autenticado' : 'No autenticado');
        
        if (user) {
          console.log('✅ Usuario:', {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified
          });
          
          // Probar operaciones en dailyOrders
          await testDailyOrdersOperations(user);
        } else {
          console.log('❌ No hay usuario autenticado');
        }
        
        resolve(true);
      });
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

async function testDailyOrdersOperations(user) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const testDocRef = doc(db, `dailyOrders/${today}`);
  
  console.log('📅 Probando con documento:', `dailyOrders/${today}`);
  
  try {
    // 1. Probar lectura
    console.log('🔍 1. Probando LECTURA...');
    const readResult = await getDoc(testDocRef);
    console.log('✅ Lectura exitosa. Documento existe:', readResult.exists());
    
    // 2. Probar creación/escritura
    console.log('📝 2. Probando CREACIÓN/ESCRITURA...');
    const testData = {
      date: today,
      dateFormatted: new Date().toLocaleDateString('es-ES'),
      orders: [{
        id: 'test-' + Date.now(),
        userId: user.uid,
        userName: 'Test User',
        userEmail: user.email,
        date: today,
        items: [{
          id: 'test-item',
          name: 'Test Product',
          price: 10,
          quantity: 1,
          image: 'test.png'
        }],
        total: 10,
        orderTime: new Date().toLocaleTimeString()
      }],
      totalOrdersCount: 1,
      totalDayAmount: 10,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(testDocRef, testData);
    console.log('✅ Creación exitosa');
    
    // 3. Probar actualización
    console.log('🔄 3. Probando ACTUALIZACIÓN...');
    const updateData = {
      lastUpdated: new Date().toISOString(),
      totalOrdersCount: 2
    };
    
    await updateDoc(testDocRef, updateData);
    console.log('✅ Actualización exitosa');
    
    console.log('🎉 TODAS LAS OPERACIONES EXITOSAS');
    
  } catch (error) {
    console.error('❌ Error en operaciones dailyOrders:', error);
    console.error('❌ Error code:', error?.code);
    console.error('❌ Error message:', error?.message);
    
    if (error?.code === 'permission-denied') {
      console.error('🚫 PROBLEMA DE PERMISOS DETECTADO');
      console.error('📋 Verificar:');
      console.error('   1. Las reglas de Firestore están desplegadas');
      console.error('   2. El usuario está autenticado correctamente');
      console.error('   3. Las reglas permiten update para usuarios autenticados');
    }
  }
}

// Ejecutar el diagnóstico
testFirestoreRules().then(() => {
  console.log('🏁 Diagnóstico completado');
}).catch((error) => {
  console.error('❌ Error en diagnóstico:', error);
});
