// 🔧 SCRIPT DE DIAGNÓSTICO DE DELIVERY ACCESS
// Verificar permisos y configuración para usuarios de delivery

import { auth, db } from './src/app/utils/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const DELIVERY_EMAILS = [
  'hwcobena@espol.edu.ec',
  'nexel2024@outlook.com'
];

const ADMIN_EMAIL = 'hectorcobea03@gmail.com';

console.log('🔧 Iniciando diagnóstico de acceso de delivery...');

// Función para probar acceso de delivery
const testDeliveryAccess = async (email, password) => {
  try {
    console.log(`\n📧 Probando acceso para: ${email}`);
    
    // Intentar login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log(`✅ Login exitoso para ${email}`);
    console.log(`🆔 UID: ${user.uid}`);
    console.log(`📧 Email verificado: ${user.emailVerified}`);
    
    // Probar lectura de deliveryOrders
    try {
      const ordersQuery = query(
        collection(db, 'deliveryOrders'),
        where('assignedTo', '==', email)
      );
      
      const snapshot = await getDocs(ordersQuery);
      console.log(`📦 Órdenes encontradas: ${snapshot.size}`);
      
      if (snapshot.size > 0) {
        console.log('✅ Acceso a deliveryOrders: PERMITIDO');
      } else {
        console.log('⚠️ No hay órdenes asignadas, pero el acceso funciona');
      }
    } catch (firestoreError) {
      console.error(`❌ Error accediendo a deliveryOrders:`, firestoreError.message);
    }
    
    // Probar crear un documento de prueba
    try {
      const testDoc = await addDoc(collection(db, 'connectionTest'), {
        userEmail: email,
        userId: user.uid,
        timestamp: new Date().toISOString(),
        testType: 'delivery_access_test'
      });
      
      console.log('✅ Creación de documento de prueba: EXITOSA');
      console.log(`📄 ID del documento: ${testDoc.id}`);
    } catch (createError) {
      console.error(`❌ Error creando documento de prueba:`, createError.message);
    }
    
    return { success: true, uid: user.uid };
    
  } catch (authError) {
    console.error(`❌ Error de autenticación para ${email}:`, authError.message);
    return { success: false, error: authError.message };
  }
};

// Función principal de diagnóstico
const runDiagnostic = async () => {
  console.log('🔍 Verificando configuración de Firebase...');
  
  // Para ejecutar este script, necesitarás proporcionar las contraseñas
  console.log(`
⚠️ INSTRUCCIONES PARA EJECUTAR EL DIAGNÓSTICO:

1. Este script requiere las contraseñas de los usuarios de delivery
2. Por seguridad, no están incluidas en el código
3. Para ejecutar manualmente desde la consola del navegador:

   // Probar primer delivery
   testDeliveryAccess('hwcobena@espol.edu.ec', 'TU_CONTRASEÑA_AQUI');
   
   // Probar segundo delivery  
   testDeliveryAccess('nexel2024@outlook.com', 'TU_CONTRASEÑA_AQUI');

4. También puedes usar la interfaz web para hacer login y verificar el acceso

📧 Emails de delivery configurados:
${DELIVERY_EMAILS.map(email => `   - ${email}`).join('\n')}

🛡️ Configuración de seguridad actualizada en:
   - src/app/utils/securityConfig.ts ✅
   - src/app/utils/security.ts ✅  
   - src/app/context/adminContext.tsx ✅
   - firestore-rules.txt ✅

🔧 Próximos pasos:
   1. Copia las reglas actualizadas de firestore-rules.txt a Firebase Console
   2. Haz login con el email nexel2024@outlook.com 
   3. Navega a /delivery/orders para verificar el acceso
  `);
};

// Exportar funciones para uso manual
if (typeof window !== 'undefined') {
  window.testDeliveryAccess = testDeliveryAccess;
  window.DELIVERY_EMAILS = DELIVERY_EMAILS;
}

runDiagnostic();
