#!/usr/bin/env node
// Diagnóstico de configuración para la migración a Hostinger

console.log('🔍 DIAGNÓSTICO DE CONFIGURACIÓN - MIGRACIÓN A HOSTINGER');
console.log('=' .repeat(60));

// Verificar variables de entorno
console.log('\n📋 VARIABLES DE ENTORNO:');
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_PAYPAL_CLIENT_ID'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Configurada (${value.substring(0, 10)}...)`);
  } else {
    console.log(`❌ ${varName}: FALTA`);
  }
});

// Verificar Firebase
console.log('\n🔥 FIREBASE:');
try {
  const { auth, db } = require('./src/app/utils/firebase.ts');
  if (auth) {
    console.log('✅ Firebase Auth: Inicializado correctamente');
  } else {
    console.log('❌ Firebase Auth: NO inicializado');
  }
  
  if (db) {
    console.log('✅ Firestore: Inicializado correctamente');
  } else {
    console.log('❌ Firestore: NO inicializado');
  }
} catch (error) {
  console.log('❌ Error al importar Firebase:', error.message);
}

// Verificar PayPal
console.log('\n💰 PAYPAL:');
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
if (paypalClientId && paypalClientId !== 'test') {
  if (paypalClientId.startsWith('AUY') || paypalClientId.includes('sandbox')) {
    console.log('⚠️  PayPal: Configurado para SANDBOX (desarrollo)');
  } else {
    console.log('✅ PayPal: Configurado para PRODUCCIÓN');
  }
} else {
  console.log('❌ PayPal: NO configurado correctamente');
}

// Verificar archivo .env.local
console.log('\n📄 ARCHIVO .env.local:');
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    console.log('✅ Archivo .env.local existe');
    const content = fs.readFileSync(envPath, 'utf8');
    
    // Verificar formato correcto (sin espacios)
    const hasSpaces = content.includes('= ') || content.includes(' =');
    if (hasSpaces) {
      console.log('⚠️  ADVERTENCIA: Detectados espacios en variables. Esto puede causar problemas.');
      console.log('   Formato correcto: VARIABLE=valor (sin espacios)');
    } else {
      console.log('✅ Formato de variables correcto');
    }
  } else {
    console.log('❌ Archivo .env.local NO encontrado');
  }
} catch (error) {
  console.log('❌ Error al leer .env.local:', error.message);
}

console.log('\n🌐 MIGRACIÓN A HOSTINGER:');
console.log('Para migrar exitosamente a Hostinger:');
console.log('1. Sube todos los archivos del proyecto');
console.log('2. Configura las variables de entorno en el panel de Hostinger');
console.log('3. Asegúrate de que el dominio de Firebase incluya tu nuevo dominio');
console.log('4. Verifica que PayPal esté configurado para producción');

console.log('\n' + '=' .repeat(60));
