// 🔍 DIAGNÓSTICO DETALLADO DE ERROR 400 - FIRESTORE
// Ejecutar en la consola del navegador después del error

console.log('🚨 DIAGNÓSTICO DE ERROR 400 EN FIRESTORE\n');

// 1. Verificar estado del usuario actual
const user = auth.currentUser;
console.log('👤 USUARIO ACTUAL:');
if (user) {
  console.log('   ✅ Autenticado:', user.email);
  console.log('   - UID:', user.uid);
  console.log('   - Token válido:', user.accessToken ? 'Sí' : 'No');
} else {
  console.log('   ❌ NO AUTENTICADO');
}

// 2. Verificar permisos específicos
console.log('\n🔒 VERIFICANDO PERMISOS ESPECÍFICOS:');

// Test 1: Intentar leer deliveryNotifications
try {
  const notificationsRef = collection(db, 'deliveryNotifications');
  getDocs(query(notificationsRef, limit(1)))
    .then(snapshot => {
      console.log('   ✅ Lectura deliveryNotifications: OK (' + snapshot.size + ' docs)');
    })
    .catch(error => {
      console.log('   ❌ Lectura deliveryNotifications:', error.code, '-', error.message);
    });
} catch (e) {
  console.log('   ❌ Error configurando lectura:', e);
}

// Test 2: Intentar actualizar una notificación (operación que falla)
console.log('\n🔄 PROBANDO OPERACIÓN DE ACTUALIZACIÓN:');
try {
  // Crear una notificación de prueba primero
  const testNotification = {
    orderId: 'TEST_ACCEPT_' + Date.now(),
    deliveryPersonEmail: user?.email || 'test@test.com',
    status: 'pending',
    message: 'Test para diagnóstico de error 400',
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    targetZones: ['general']
  };

  console.log('   📝 Creando notificación de prueba...');
  addDoc(collection(db, 'deliveryNotifications'), testNotification)
    .then(docRef => {
      console.log('   ✅ Notificación creada:', docRef.id);
      
      // Ahora intentar la operación que falla: actualizar
      console.log('   🔄 Intentando actualizar (simular aceptar pedido)...');
      updateDoc(docRef, {
        status: 'accepted',
        acceptedBy: user?.email || 'test@test.com',
        acceptedAt: new Date()
      })
        .then(() => {
          console.log('   ✅ ¡ACTUALIZACIÓN EXITOSA! El problema no es de permisos');
          
          // Limpiar
          deleteDoc(docRef)
            .then(() => console.log('   🧹 Documento de prueba eliminado'))
            .catch(err => console.log('   ⚠️ No se pudo eliminar:', err.code));
        })
        .catch(updateError => {
          console.log('   ❌ ERROR EN ACTUALIZACIÓN (aquí está el problema):');
          console.log('      - Código:', updateError.code);
          console.log('      - Mensaje:', updateError.message);
          console.log('      - Detalles:', updateError);
          
          // Analizar el error específico
          if (updateError.code === 'permission-denied') {
            console.log('   🔒 PROBLEMA: Permisos insuficientes para actualizar');
          } else if (updateError.code === 'invalid-argument') {
            console.log('   📝 PROBLEMA: Argumentos inválidos en la actualización');
          } else if (updateError.code === 'failed-precondition') {
            console.log('   ⚙️ PROBLEMA: Precondiciones fallidas (posible problema con serverTimestamp)');
          }
        });
    })
    .catch(createError => {
      console.log('   ❌ ERROR AL CREAR NOTIFICACIÓN:', createError.code, '-', createError.message);
    });
} catch (e) {
  console.log('   ❌ Error configurando test:', e);
}

// 3. Verificar estado de la conexión a Firestore
console.log('\n🌐 VERIFICANDO CONEXIÓN A FIRESTORE:');
try {
  // Test de conectividad básica
  const testRef = doc(db, 'connectionTest', 'diagnostic-' + Date.now());
  setDoc(testRef, { 
    test: true, 
    timestamp: new Date(),
    user: user?.email || 'anonymous'
  })
    .then(() => {
      console.log('   ✅ Conexión a Firestore: FUNCIONAL');
      deleteDoc(testRef); // Limpiar
    })
    .catch(error => {
      console.log('   ❌ Conexión a Firestore:', error.code, '-', error.message);
    });
} catch (e) {
  console.log('   ❌ Error en test de conexión:', e);
}

// 4. Verificar formato de datos problemáticos
console.log('\n📋 VERIFICANDO FORMATO DE DATOS:');
console.log('   🔍 Revisando si serverTimestamp() está causando problemas...');

// Test con serverTimestamp vs Date normal
try {
  const testData1 = {
    test: 'timestamp-normal',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const testData2 = {
    test: 'timestamp-server',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  console.log('   📝 Probando con Date() normal...');
  const testRef1 = doc(db, 'connectionTest', 'timestamp-test-1');
  setDoc(testRef1, testData1)
    .then(() => {
      console.log('   ✅ Date() normal: OK');
      deleteDoc(testRef1);
    })
    .catch(err => {
      console.log('   ❌ Date() normal falló:', err.code);
    });
  
  console.log('   📝 Probando con serverTimestamp()...');
  const testRef2 = doc(db, 'connectionTest', 'timestamp-test-2');
  setDoc(testRef2, testData2)
    .then(() => {
      console.log('   ✅ serverTimestamp(): OK');
      deleteDoc(testRef2);
    })
    .catch(err => {
      console.log('   ❌ serverTimestamp() falló:', err.code);
      console.log('   🚨 POSIBLE CAUSA: Problema con serverTimestamp()');
    });
} catch (e) {
  console.log('   ❌ Error en test de timestamps:', e);
}

// 5. Información del entorno
console.log('\n🔧 INFORMACIÓN DEL ENTORNO:');
console.log('   - User Agent:', navigator.userAgent);
console.log('   - Conexión:', navigator.onLine ? 'Online' : 'Offline');
console.log('   - URL actual:', window.location.href);

console.log('\n📋 POSIBLES SOLUCIONES:');
console.log('1. 🔒 Si es problema de permisos: Aplicar reglas de Firebase actualizadas');
console.log('2. ⏰ Si es problema de serverTimestamp: Usar Date() en su lugar');
console.log('3. 📝 Si es problema de datos: Validar estructura de datos');
console.log('4. 🌐 Si es problema de conexión: Verificar estado de Firebase');
console.log('5. 🔄 Recargar la página y volver a intentar');

console.log('\n🎯 EJECUTA ESTE DIAGNÓSTICO DESPUÉS DE VER EL ERROR 400 PARA IDENTIFICAR LA CAUSA EXACTA');
