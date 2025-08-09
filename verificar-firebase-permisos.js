// 🔍 SCRIPT PARA VERIFICAR PERMISOS DE FIREBASE - VERSIÓN 2.0
// Ejecutar en la consola del navegador en tu aplicación

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE FIREBASE - NOTIFICACIONES URGENTES...\n');

// 1. Verificar usuario actual
const user = auth.currentUser;
if (user) {
  console.log('✅ Usuario autenticado:');
  console.log('   - UID:', user.uid);
  console.log('   - Email:', user.email);
  console.log('   - Es admin?:', user.uid === "byRByEqdFOYxXOmUu9clvujvIUg1");
  console.log('   - Es delivery?:', ["hwcobena@espol.edu.ec", "nexel2024@outlook.com"].includes(user.email));
} else {
  console.log('❌ Usuario NO autenticado');
  console.log('⚠️ Por favor inicia sesión y vuelve a ejecutar este script');
}

// 2. Test de creación de notificación urgente (PRINCIPAL)
console.log('\n� PROBANDO CREACIÓN DE NOTIFICACIÓN URGENTE...');
try {
  const urgentNotification = {
    orderId: 'URGENT_TEST_' + Date.now(),
    orderData: {
      userName: 'Usuario de Prueba',
      userEmail: 'test@test.com',
      total: 50.00,
      items: [{ name: 'Producto de prueba', quantity: 1, price: 50.00 }],
      deliveryLocation: {
        city: 'Guayaquil',
        zone: 'Centro',
        address: 'Dirección de prueba',
        phone: '0999999999'
      }
    },
    targetZones: ['general', 'guayaquil-centro'],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
    status: 'pending',
    urgent: true,
    priority: 'high'
  };

  const notificationsRef = collection(db, 'deliveryNotifications');
  addDoc(notificationsRef, urgentNotification)
    .then(docRef => {
      console.log('✅ ¡ÉXITO! Creación de notificación urgente: PERMITIDA');
      console.log('   - ID del documento:', docRef.id);
      console.log('   - Las reglas están funcionando correctamente');
      
      // Intentar actualizar la notificación
      updateDoc(docRef, { status: 'sent' })
        .then(() => {
          console.log('✅ Actualización de notificación: PERMITIDA');
          
          // Limpiar el documento de prueba
          deleteDoc(docRef)
            .then(() => console.log('✅ Documento de prueba eliminado correctamente'))
            .catch(err => console.log('⚠️ Advertencia: No se pudo eliminar documento de prueba:', err.code));
        })
        .catch(updateError => {
          console.log('⚠️ Actualización falló:', updateError.code);
        });
    })
    .catch(error => {
      console.log('❌ ERROR CRÍTICO en creación de notificación urgente:');
      console.log('   - Código:', error.code);
      console.log('   - Mensaje:', error.message);
      console.log('   - 🚨 LAS REGLAS NO ESTÁN APLICADAS O SON INCORRECTAS');
    });
} catch (error) {
  console.log('❌ Error al preparar notificación de prueba:', error);
}

// 3. Test de actualización de pedido urgente
console.log('\n� PROBANDO ACTUALIZACIÓN DE PEDIDO URGENTE...');
try {
  // Primero crear un pedido de prueba
  const testOrder = {
    userId: user?.uid || 'test-user',
    userName: 'Usuario de Prueba',
    userEmail: user?.email || 'test@test.com',
    items: [{ name: 'Producto', quantity: 1, price: 25.00 }],
    total: 25.00,
    status: 'pending',
    createdAt: new Date()
  };

  const ordersRef = collection(db, 'deliveryOrders');
  addDoc(ordersRef, testOrder)
    .then(orderRef => {
      console.log('✅ Pedido de prueba creado:', orderRef.id);
      
      // Intentar marcar como urgente
      updateDoc(orderRef, { 
        urgent: true, 
        priority: 'high',
        urgentMarkedAt: new Date()
      })
        .then(() => {
          console.log('✅ ¡ÉXITO! Marcado de pedido como urgente: PERMITIDO');
          console.log('   - El sistema de notificaciones urgentes puede funcionar');
          
          // Limpiar
          deleteDoc(orderRef)
            .then(() => console.log('✅ Pedido de prueba eliminado'))
            .catch(err => console.log('⚠️ No se pudo eliminar pedido de prueba'));
        })
        .catch(urgentError => {
          console.log('❌ Error al marcar como urgente:', urgentError.code);
          console.log('   - Mensaje:', urgentError.message);
        });
    })
    .catch(orderError => {
      console.log('❌ Error al crear pedido de prueba:', orderError.code);
    });
} catch (error) {
  console.log('❌ Error en test de pedido urgente:', error);
}

// 4. Test de lectura general
console.log('\n🔍 PROBANDO ACCESO DE LECTURA...');
try {
  // Probar lectura de deliveryOrders
  const ordersRef = collection(db, 'deliveryOrders');
  getDocs(query(ordersRef, limit(1)))
    .then(snapshot => {
      console.log('✅ Lectura de deliveryOrders: PERMITIDA');
      console.log('   - Documentos accesibles:', snapshot.size);
    })
    .catch(error => {
      console.log('❌ Error en lectura de deliveryOrders:', error.code);
    });

  // Probar lectura de deliveryNotifications
  const notificationsRef = collection(db, 'deliveryNotifications');
  getDocs(query(notificationsRef, limit(1)))
    .then(snapshot => {
      console.log('✅ Lectura de deliveryNotifications: PERMITIDA');
      console.log('   - Documentos accesibles:', snapshot.size);
    })
    .catch(error => {
      console.log('❌ Error en lectura de deliveryNotifications:', error.code);
    });
} catch (error) {
  console.log('❌ Error en tests de lectura:', error);
}

console.log('\n📋 INSTRUCCIONES SI HAY ERRORES:');
console.log('1. 🔥 Ve a Firebase Console → Firestore → Rules');
console.log('2. 📋 Copia TODAS las reglas de firestore-rules-complete-delivery.txt');
console.log('3. 🔄 Reemplaza las reglas actuales COMPLETAMENTE');
console.log('4. ✅ Haz clic en "Publish"');
console.log('5. ⏰ Espera 1-2 minutos para propagación');
console.log('6. 🔄 Recarga la aplicación y vuelve a probar');

console.log('\n🎯 ESTADO ESPERADO DESPUÉS DE APLICAR REGLAS:');
console.log('✅ Creación de notificación urgente: PERMITIDA');
console.log('✅ Actualización de pedido urgente: PERMITIDA');
console.log('✅ Lectura de colecciones: PERMITIDA');
console.log('🚀 Sistema de notificaciones urgentes: FUNCIONAL');
