import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if we're in a build environment and provide fallback values
const isBuilding = process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (isBuilding ? 'fake-api-key-for-build' : ''),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isBuilding ? 'fake-domain.firebaseapp.com' : ''),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isBuilding ? 'fake-project-id' : ''),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isBuilding ? 'fake-bucket.appspot.com' : ''),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (isBuilding ? '123456789' : ''),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (isBuilding ? 'fake-app-id' : ''),
};

// Initialize Firebase only if we have valid config or we're not building
let app: any = null;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;

if (!isBuilding) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    // ✅ Log de error seguro - sin exponer configuración sensible
    console.error('❌ Error al inicializar Firebase');
    if (process.env.NODE_ENV === 'development') {
      console.error('Detalles del error:', error);
    }
  }
}

export { app, auth, db, googleProvider };