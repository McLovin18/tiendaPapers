// 🔧 SCRIPT PARA ASIGNAR ROL DE DELIVERY
// Ejecutar esto en la consola del navegador cuando estés logueado

const asignarRolDelivery = async () => {
  try {
    console.log('🔧 Asignando rol de delivery...');
    
    // Obtener el email del usuario actual
    const userEmail = 'hwcobena@espol.edu.ec'; // Tu email de delivery
    
    // Importar Firebase
    const { db } = await import('/src/app/utils/firebase.js');
    const { doc, setDoc, getDoc } = await import('firebase/firestore');
    
    // Referencia al documento del usuario
    const userDocRef = doc(db, 'users', userEmail);
    
    // Verificar si existe
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('👤 Usuario encontrado:', userDoc.data());
      
      // Actualizar con rol delivery
      await setDoc(userDocRef, {
        ...userDoc.data(),
        role: 'delivery',
        isDelivery: true,
        deliveryZones: ['guayaquil-general', 'guayaquil-centro', 'guayaquil-norte', 'guayaquil-urdesa'],
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      console.log('✅ Rol de delivery asignado correctamente');
      
      // Actualizar localStorage también
      const userData = {
        email: userEmail,
        role: 'delivery',
        isDelivery: true,
        deliveryZones: ['guayaquil-general', 'guayaquil-centro', 'guayaquil-norte', 'guayaquil-urdesa']
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ localStorage actualizado');
      
      // Recargar página
      setTimeout(() => {
        console.log('🔄 Recargando página...');
        window.location.reload();
      }, 2000);
      
    } else {
      console.log('❌ Usuario no encontrado en Firestore');
      
      // Crear usuario con rol delivery
      await setDoc(userDocRef, {
        email: userEmail,
        role: 'delivery',
        isDelivery: true,
        deliveryZones: ['guayaquil-general', 'guayaquil-centro', 'guayaquil-norte', 'guayaquil-urdesa'],
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ Usuario creado con rol delivery');
      
      // Actualizar localStorage
      const userData = {
        email: userEmail,
        role: 'delivery',
        isDelivery: true,
        deliveryZones: ['guayaquil-general', 'guayaquil-centro', 'guayaquil-norte', 'guayaquil-urdesa']
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ localStorage actualizado');
      
      // Recargar página
      setTimeout(() => {
        console.log('🔄 Recargando página...');
        window.location.reload();
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Error asignando rol:', error);
  }
};

// Ejecutar
asignarRolDelivery();
