import { useEffect, useState } from 'react';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';

export const FirestoreRulesChecker = () => {
  const { user } = useAuth();
  const [rulesStatus, setRulesStatus] = useState({
    deliveryNotifications: 'Verificando...',
    deliveryOrders: 'Verificando...',
    deliveryUsers: 'Verificando...',
    overall: 'Verificando...'
  });

  useEffect(() => {
    if (!user) return;

    const checkRules = async () => {
      let allTestsPassed = true;

      // Test 1: ¿Puedo leer deliveryNotifications?
      try {
        const notificationsQuery = query(collection(db, 'deliveryNotifications'));
        await getDocs(notificationsQuery);
        setRulesStatus(prev => ({ ...prev, deliveryNotifications: '✅ Lectura OK' }));
      } catch (error: any) {
        allTestsPassed = false;
        setRulesStatus(prev => ({ 
          ...prev, 
          deliveryNotifications: `❌ Error: ${error.message.substring(0, 50)}...` 
        }));
      }

      // Test 2: ¿Puedo leer deliveryOrders?
      try {
        const ordersQuery = query(collection(db, 'deliveryOrders'));
        await getDocs(ordersQuery);
        setRulesStatus(prev => ({ ...prev, deliveryOrders: '✅ Lectura OK' }));
      } catch (error: any) {
        allTestsPassed = false;
        setRulesStatus(prev => ({ 
          ...prev, 
          deliveryOrders: `❌ Error: ${error.message.substring(0, 50)}...` 
        }));
      }

      // Test 3: ¿Puedo leer deliveryUsers?
      try {
        const usersQuery = query(collection(db, 'deliveryUsers'));
        await getDocs(usersQuery);
        setRulesStatus(prev => ({ ...prev, deliveryUsers: '✅ Lectura OK' }));
      } catch (error: any) {
        allTestsPassed = false;
        setRulesStatus(prev => ({ 
          ...prev, 
          deliveryUsers: `❌ Error: ${error.message.substring(0, 50)}...` 
        }));
      }

      // Estado general
      setRulesStatus(prev => ({ 
        ...prev, 
        overall: allTestsPassed ? '✅ TODAS LAS REGLAS FUNCIONAN' : '❌ HAY PROBLEMAS DE PERMISOS' 
      }));
    };

    checkRules();
  }, [user]);

  if (!user) return null;

  const hasErrors = Object.values(rulesStatus).some(status => status.includes('❌'));

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: hasErrors ? '#ffebee' : '#e8f5e8',
      border: `2px solid ${hasErrors ? '#f44336' : '#4caf50'}`,
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '350px',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    }}>
      <h6 style={{ margin: '0 0 8px 0', color: hasErrors ? '#d32f2f' : '#2e7d32' }}>
        🔧 Estado de Reglas Firestore
      </h6>
      <div><strong>🔔 Notificaciones:</strong> {rulesStatus.deliveryNotifications}</div>
      <div><strong>📦 Órdenes:</strong> {rulesStatus.deliveryOrders}</div>
      <div><strong>👥 Usuarios Delivery:</strong> {rulesStatus.deliveryUsers}</div>
      <hr style={{ margin: '8px 0' }} />
      <div style={{ 
        fontWeight: 'bold', 
        color: hasErrors ? '#d32f2f' : '#2e7d32' 
      }}>
        {rulesStatus.overall}
      </div>
      {hasErrors && (
        <div style={{ color: '#d32f2f', marginTop: '8px', fontSize: '11px' }}>
          <strong>⚠️ Si ves errores, verifica que copiaste TODAS las reglas correctamente</strong>
        </div>
      )}
    </div>
  );
};

export default FirestoreRulesChecker;
