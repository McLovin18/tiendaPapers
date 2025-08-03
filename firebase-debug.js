// 🔍 DIAGNÓSTICO DE FIREBASE STORAGE
// Ejecutar este script para diagnosticar la configuración de Firebase

const { app, auth, db, storage } = require('./src/app/utils/firebase.ts');

console.log('🔍 DIAGNÓSTICO DE FIREBASE STORAGE');
console.log('=================================');

console.log('\n📋 Variables de entorno:');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Definida' : '❌ No definida');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Definida' : '❌ No definida');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Definida' : '❌ No definida');
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Definida' : '❌ No definida');
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Definida' : '❌ No definida');
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Definida' : '❌ No definida');

console.log('\n🔧 Estado de inicialización:');
console.log('Firebase App:', app ? '✅ Inicializada' : '❌ No inicializada');
console.log('Firebase Auth:', auth ? '✅ Inicializada' : '❌ No inicializada');
console.log('Firebase Firestore:', db ? '✅ Inicializada' : '❌ No inicializada');
console.log('Firebase Storage:', storage ? '✅ Inicializada' : '❌ No inicializada');

if (storage) {
  console.log('\n📦 Detalles de Storage:');
  console.log('Storage bucket:', storage.app.options.storageBucket);
  console.log('Storage app name:', storage.app.name);
} else {
  console.log('\n❌ Firebase Storage no está disponible');
  console.log('Posibles causas:');
  console.log('1. Variables de entorno no están configuradas');
  console.log('2. Error en la inicialización de Firebase');
  console.log('3. Configuración de Storage incorrecta');
}

console.log('\n🔗 Para solucionar:');
console.log('1. Crea un archivo .env.local en la raíz del proyecto');
console.log('2. Agrega las variables de Firebase desde la consola de Firebase');
console.log('3. Reinicia el servidor de desarrollo');
