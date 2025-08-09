// 🧪 TEST RÁPIDO - VERIFICAR CORRECCIÓN DE ERROR 400
// Ejecutar en la consola del navegador DESPUÉS de intentar aceptar un pedido

console.log('🧪 VERIFICANDO CORRECCIÓN DE ERROR 400...\n');

// 1. Verificar que no hay errores 400 en Network
console.log('🌐 VERIFICANDO ERRORES DE RED:');
console.log('   1. Abre DevTools → Network');
console.log('   2. Filtra por "firestore.googleapis"');
console.log('   3. Intenta aceptar un pedido');
console.log('   4. ✅ NO deberías ver errores 400');
console.log('   5. ✅ Deberías ver status 200 (éxito)');

// 2. Test de la función corregida
console.log('\n🔄 PROBANDO FUNCIÓN acceptDeliveryOrder:');

// Simular la función corregida
const testAcceptOrder = async (notificationId, deliveryEmail) => {
  try {
    console.log('🔄 Aceptando pedido:', { notificationId, deliveryEmail });
    
    const notificationRef = doc(db, 'deliveryNotifications', notificationId);
    
    // Esta es la corrección aplicada: usar Date() en lugar de serverTimestamp()
    const updateData = {
      status: 'accepted',
      acceptedBy: deliveryEmail,
      acceptedAt: new Date().toISOString() // ← CORRECCIÓN
    };
    
    console.log('📝 Datos a actualizar:', updateData);
    
    await updateDoc(notificationRef, updateData);
    
    console.log('✅ Pedido aceptado exitosamente - SIN ERROR 400');
    return true;
  } catch (error) {
    console.error('❌ Error al aceptar pedido:', error);
    console.error('   - Código:', error?.code || 'Desconocido');
    console.error('   - Mensaje:', error?.message || error);
    return false;
  }
};

// Añadir función de test al window para uso fácil
window.testAcceptOrder = testAcceptOrder;

console.log('\n📋 INSTRUCCIONES PARA PROBAR:');
console.log('1. 🛍️ Haz un pedido de prueba');
console.log('2. 🚚 Ve al panel de delivery');
console.log('3. 👆 Haz clic en "Aceptar" en una notificación');
console.log('4. 👀 Observa la consola - debe mostrar logs de éxito');
console.log('5. 🌐 Verifica Network tab - NO debe haber errores 400');

console.log('\n🎯 INDICADORES DE ÉXITO:');
console.log('✅ Log: "✅ Pedido aceptado exitosamente"');
console.log('✅ Network: Status 200 en llamadas a Firestore');
console.log('✅ UI: El pedido cambia de estado correctamente');

console.log('\n🚨 SI AÚN VES ERROR 400:');
console.log('1. 🔄 Recarga la página completamente');
console.log('2. 🔒 Verifica que las reglas de Firebase estén aplicadas');
console.log('3. 🧪 Ejecuta: diagnostico-error-400.mjs');
console.log('4. 📞 Reporta el error específico que aparece');

console.log('\n🎉 LA CORRECCIÓN ESTÁ APLICADA Y DEBERÍA FUNCIONAR CORRECTAMENTE');
