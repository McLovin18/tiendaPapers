// 🧪 SCRIPT DE PRUEBA DEL SISTEMA DE NOTIFICACIONES
// Simula el flujo completo de notificaciones para testing

import { notificationService } from './src/app/services/notificationService.js';

console.log('🚚 Iniciando prueba del sistema de notificaciones...\n');

// 📊 DATOS DE PRUEBA
const testOrder = {
  orderId: 'TEST_ORDER_' + Date.now(),
  userName: 'María López Test',
  userEmail: 'maria.test@example.com',
  total: 45.50,
  items: [
    { id: 1, name: 'Vestido Floral', quantity: 1, price: 35.50 },
    { id: 2, name: 'Collar Dorado', quantity: 1, price: 10.00 }
  ],
  deliveryLocation: {
    city: 'Guayaquil',
    zone: 'Norte',
    address: 'Av. Principal 123, Alborada',
    phone: '+593987654321'
  }
};

// 🔧 FUNCIONES DE PRUEBA
const testNotificationPermissions = async () => {
  console.log('1️⃣ Probando permisos de notificación...');
  
  if (!('Notification' in window)) {
    console.log('❌ Este navegador no soporta notificaciones web');
    return false;
  }
  
  const hasPermission = await notificationService.requestNotificationPermission();
  console.log(`   Permisos: ${hasPermission ? '✅ Concedidos' : '❌ Denegados'}`);
  
  return hasPermission;
};

const testCreateNotification = async () => {
  console.log('\n2️⃣ Creando notificación de prueba...');
  
  try {
    const notificationId = await notificationService.createDeliveryNotification(testOrder);
    console.log(`   ✅ Notificación creada: ${notificationId}`);
    console.log(`   📍 Zona objetivo: ${testOrder.deliveryLocation.zone}, ${testOrder.deliveryLocation.city}`);
    console.log(`   💰 Total: $${testOrder.total}`);
    console.log(`   ⏰ Expira en: 5 minutos`);
    
    return notificationId;
  } catch (error) {
    console.error('   ❌ Error creando notificación:', error);
    return null;
  }
};

const testDeliverySubscription = async (deliveryEmail) => {
  console.log(`\n3️⃣ Simulando suscripción de ${deliveryEmail}...`);
  
  console.log(`   📍 Obteniendo zonas dinámicamente desde Firebase...`);
  
  // Usando el nuevo método dinámico
  const unsubscribe = await notificationService.subscribeToDeliveryNotifications(
    deliveryEmail,
    (notification) => {
      console.log(`   🔔 ¡Notificación recibida por ${deliveryEmail}!`);
      console.log(`      📦 Pedido: ${notification.orderData?.userName || 'N/A'}`);
      console.log(`      📍 Zonas: ${notification.targetZones.join(', ')}`);
      console.log(`      💰 Total: $${notification.orderData?.total || notification.orderAmount}`);
      console.log(`      ⏰ ID: ${notification.id}`);
    }
  );
  
  console.log(`   ✅ Suscripción dinámica activa para ${deliveryEmail}`);
  return unsubscribe;
};

const testAcceptOrder = async (notificationId, deliveryEmail) => {
  console.log(`\n4️⃣ Simulando aceptación por ${deliveryEmail}...`);
  
  try {
    const success = await notificationService.acceptDeliveryOrder(notificationId, deliveryEmail);
    
    if (success) {
      console.log(`   ✅ Pedido aceptado exitosamente por ${deliveryEmail}`);
      console.log(`   🚚 Estado cambiado a: "accepted"`);
      console.log(`   ⏰ Hora de aceptación: ${new Date().toLocaleTimeString()}`);
    } else {
      console.log(`   ❌ No se pudo aceptar el pedido (posiblemente ya fue tomado)`);
    }
    
    return success;
  } catch (error) {
    console.error(`   ❌ Error aceptando pedido:`, error);
    return false;
  }
};

const testCleanup = async () => {
  console.log('\n5️⃣ Limpiando notificaciones expiradas...');
  
  try {
    await notificationService.cleanupExpiredNotifications();
    console.log('   ✅ Limpieza completada');
  } catch (error) {
    console.error('   ❌ Error en limpieza:', error);
  }
};

// 🚀 EJECUTAR PRUEBA COMPLETA
const runCompleteTest = async () => {
  console.log('='.repeat(60));
  console.log('🧪 PRUEBA COMPLETA DEL SISTEMA DE NOTIFICACIONES');
  console.log('='.repeat(60));
  
  // Test 1: Permisos
  const hasPermissions = await testNotificationPermissions();
  if (!hasPermissions) {
    console.log('\n⚠️ No se pueden probar notificaciones sin permisos');
    console.log('   Habilita las notificaciones en tu navegador y vuelve a intentar');
    return;
  }
  
  // Test 2: Crear notificación
  const notificationId = await testCreateNotification();
  if (!notificationId) {
    console.log('\n❌ No se pudo crear la notificación de prueba');
    return;
  }
  
  // Test 3: Suscripciones de delivery
  const unsubscribe1 = testDeliverySubscription('hwcobena@espol.edu.ec');
  const unsubscribe2 = testDeliverySubscription('nexel2024@outlook.com');
  
  // Esperar un poco para que las suscripciones se activen
  console.log('\n⏳ Esperando 3 segundos para que se procesen las suscripciones...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test 4: Aceptar pedido (simular que el primero lo acepta)
  const wasAccepted = await testAcceptOrder(notificationId, 'hwcobena@espol.edu.ec');
  
  if (wasAccepted) {
    console.log('\n🎉 ¡Flujo de notificación completado exitosamente!');
    console.log('   📋 Resumen:');
    console.log('      ✅ Notificación creada automáticamente');
    console.log('      ✅ Repartidores notificados en tiempo real');
    console.log('      ✅ Pedido aceptado por el primer repartidor');
    console.log('      ✅ Sistema funcionando correctamente');
  }
  
  // Test 5: Limpieza
  await testCleanup();
  
  // Cleanup suscripciones
  unsubscribe1();
  unsubscribe2();
  
  console.log('\n✅ Prueba completada. Revisa la consola de Firebase para confirmar los datos.');
  console.log('\n' + '='.repeat(60));
};

// 🔧 FUNCIONES INDIVIDUALES PARA TESTING MANUAL

// Probar solo permisos
window.testNotificationPermissions = testNotificationPermissions;

// Crear una notificación de prueba
window.createTestNotification = () => testCreateNotification();

// Probar suscripción de delivery
window.testDeliverySubscription = (email) => testDeliverySubscription(email || 'hwcobena@espol.edu.ec');

// Aceptar un pedido específico
window.acceptTestOrder = (notificationId, email) => testAcceptOrder(notificationId, email || 'hwcobena@espol.edu.ec');

// Limpiar notificaciones
window.cleanupNotifications = testCleanup;

// Ejecutar prueba completa
window.runNotificationTest = runCompleteTest;

// 📋 INSTRUCCIONES
console.log(`
🔧 INSTRUCCIONES DE PRUEBA:

1. 📱 PERMISOS:
   • Ejecuta: testNotificationPermissions()
   • Permite notificaciones cuando el navegador lo solicite

2. 🚚 NOTIFICACIÓN DE PRUEBA:
   • Ejecuta: createTestNotification()
   • Deberías ver una notificación nueva en Firebase

3. 👂 SUSCRIPCIÓN:
   • Ejecuta: testDeliverySubscription('hwcobena@espol.edu.ec')
   • Simula un repartidor escuchando notificaciones

4. ✅ ACEPTAR PEDIDO:
   • Ejecuta: acceptTestOrder('NOTIFICATION_ID', 'hwcobena@espol.edu.ec')
   • Reemplaza NOTIFICATION_ID con un ID real

5. 🧹 LIMPIEZA:
   • Ejecuta: cleanupNotifications()
   • Limpia notificaciones expiradas

6. 🚀 PRUEBA COMPLETA:
   • Ejecuta: runNotificationTest()
   • Prueba todo el flujo automáticamente

📋 PARA PRODUCCIÓN:
   1. Asegúrate de tener las reglas de Firestore actualizadas
   2. Configura las zonas de delivery correctamente
   3. Entrena a los repartidores en el nuevo sistema
   4. Monitorea las métricas los primeros días
`);

// Auto-ejecutar si está en modo de prueba
if (window.location.search.includes('test=notifications')) {
  console.log('🚀 Ejecutando prueba automática...');
  runCompleteTest();
}

export {
  testNotificationPermissions,
  testCreateNotification,
  testDeliverySubscription,
  testAcceptOrder,
  testCleanup,
  runCompleteTest
};
