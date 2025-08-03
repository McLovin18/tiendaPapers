// Utilidad para refrescar el token de autenticación de Firebase
// Usar esto si hay problemas de permisos persistentes

import { auth } from '../utils/firebase';

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ No hay usuario autenticado para refrescar');
      return false;
    }

    console.log('🔄 Refrescando token de autenticación...');
    
    // Forzar el refresh del token
    await user.getIdToken(true);
    
    console.log('✅ Token de autenticación refrescado exitosamente');
    
    // Esperar un poco para que se propague
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('❌ Error al refrescar token:', error);
    return false;
  }
};

export const checkAuthStatus = (): void => {
  const user = auth.currentUser;
  console.log('👤 Estado actual de autenticación:', {
    authenticated: !!user,
    uid: user?.uid,
    email: user?.email,
    emailVerified: user?.emailVerified,
    tokenExpiration: user?.accessToken ? 'Token disponible' : 'Sin token'
  });
};
