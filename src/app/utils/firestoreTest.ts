// Diagnóstico de reglas de Firestore para dailyOrders
// Este archivo se puede importar en la aplicación para hacer pruebas

import { auth, db } from '../utils/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const testDailyOrdersPermissions = async () => {
  const results = {
    userAuthenticated: false,
    userInfo: null,
    tokenObtained: false,
    canRead: false,
    canCreate: false,
    canUpdate: false,
    errors: []
  };

  try {
    // 1. Verificar autenticación
    const user = auth.currentUser;
    results.userAuthenticated = !!user;
    results.userInfo = user ? {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    } : null;

    if (!user) {
      results.errors.push('Usuario no autenticado');
      return results;
    }

    // 2. Verificar token
    try {
      const token = await user.getIdToken(true); // Forzar refresh
      results.tokenObtained = !!token;
      console.log('🔐 Token obtenido correctamente');
    } catch (tokenError) {
      results.errors.push(`Error obteniendo token: ${tokenError.message}`);
    }

    const today = new Date().toISOString().split('T')[0];
    const testDocRef = doc(db, `dailyOrders/${today}`);

    // 3. Probar lectura
    try {
      const docSnap = await getDoc(testDocRef);
      results.canRead = true;
      console.log('✅ Lectura exitosa. Documento existe:', docSnap.exists());
    } catch (readError) {
      results.errors.push(`Error en lectura: ${readError.message}`);
      console.log('❌ Error en lectura:', readError.code);
    }

    // 4. Probar creación/escritura
    try {
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
      results.canCreate = true;
      console.log('✅ Creación exitosa');

      // 5. Probar actualización
      const updateData = {
        lastUpdated: new Date().toISOString(),
        totalOrdersCount: 2
      };

      await updateDoc(testDocRef, updateData);
      results.canUpdate = true;
      console.log('✅ Actualización exitosa');

    } catch (writeError) {
      results.errors.push(`Error en escritura: ${writeError.message} (Código: ${writeError.code})`);
      console.log('❌ Error en escritura:', writeError.code, writeError.message);
    }

  } catch (generalError) {
    results.errors.push(`Error general: ${generalError.message}`);
  }

  return results;
};

// Función para mostrar los resultados en la consola
export const runDailyOrdersTest = async () => {
  console.log('🧪 INICIANDO DIAGNÓSTICO DE REGLAS FIRESTORE');
  console.log('=============================================');
  
  const results = await testDailyOrdersPermissions();
  
  console.log('📊 RESULTADOS:');
  console.log('- Usuario autenticado:', results.userAuthenticated);
  console.log('- Info del usuario:', results.userInfo);
  console.log('- Token obtenido:', results.tokenObtained);
  console.log('- Puede leer:', results.canRead);
  console.log('- Puede crear:', results.canCreate);
  console.log('- Puede actualizar:', results.canUpdate);
  
  if (results.errors.length > 0) {
    console.log('❌ ERRORES:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error}`);
    });
  } else {
    console.log('✅ TODAS LAS OPERACIONES EXITOSAS');
  }
  
  return results;
};
