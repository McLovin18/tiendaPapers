'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '../utils/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResult('🔍 Probando conexión a Firebase...\n');

    try {
      // Test 1: Verificar inicialización
      if (!db) {
        setTestResult(prev => prev + '❌ Error: Firestore no está inicializado\n');
        return;
      }
      setTestResult(prev => prev + '✅ Firestore inicializado correctamente\n');

      // Test 2: Verificar autenticación
      if (!user) {
        setTestResult(prev => prev + '❌ Usuario no autenticado\n');
        return;
      }
      setTestResult(prev => prev + `✅ Usuario autenticado: ${user.email}\n`);

      // Test 3: Intentar leer una colección
      setTestResult(prev => prev + '🔍 Probando lectura de datos...\n');
      try {
        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);
        setTestResult(prev => prev + `✅ Lectura exitosa: ${snapshot.size} productos encontrados\n`);
      } catch (readError: any) {
        setTestResult(prev => prev + `❌ Error de lectura: ${readError.message}\n`);
        setTestResult(prev => prev + `Código de error: ${readError.code}\n`);
      }

      // Test 4: Intentar escribir datos de prueba
      setTestResult(prev => prev + '🔍 Probando escritura de datos...\n');
      try {
        const testData = {
          test: true,
          timestamp: new Date().toISOString(),
          userId: user.uid,
          message: 'Prueba de conectividad desde Hostinger'
        };

        const testRef = collection(db, 'connectionTest');
        const docRef = await addDoc(testRef, testData);
        setTestResult(prev => prev + `✅ Escritura exitosa: ${docRef.id}\n`);
      } catch (writeError: any) {
        setTestResult(prev => prev + `❌ Error de escritura: ${writeError.message}\n`);
        setTestResult(prev => prev + `Código de error: ${writeError.code}\n`);
        
        if (writeError.code === 'permission-denied') {
          setTestResult(prev => prev + `\n🔧 SOLUCIÓN: Las reglas de seguridad de Firestore necesitan ser actualizadas.\n`);
          setTestResult(prev => prev + `Ve a Firebase Console > Firestore Database > Rules\n`);
          setTestResult(prev => prev + `Asegúrate de que las reglas permitan escritura para usuarios autenticados.\n`);
        }
      }

    } catch (error: any) {
      setTestResult(prev => prev + `❌ Error general: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      testFirebaseConnection();
    }
  }, [user]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '2px solid #007bff',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
        🔍 Diagnóstico Firebase
      </h4>
      
      <button 
        onClick={testFirebaseConnection}
        disabled={loading || !user}
        style={{
          marginBottom: '10px',
          padding: '5px 10px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !user ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Probando...' : 'Probar Conexión'}
      </button>

      <pre style={{ 
        whiteSpace: 'pre-wrap', 
        margin: 0,
        background: '#f8f9fa',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        {testResult || 'Haz clic en "Probar Conexión" para diagnosticar Firebase'}
      </pre>
    </div>
  );
};

export default FirebaseTest;
