'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  UserCredential,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from "uuid";

interface UserData {
  email: string;
  role?: 'admin' | 'delivery' | 'client';
  isDelivery?: boolean;
  deliveryZones?: string[];
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string, name?: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  isDelivery: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [justRegistered, setJustRegistered] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  


  // Helper para cargar datos del usuario desde Firestore
  const loadUserData = async (firebaseUser: User) => {
    try {
      // Solo intentar Firestore si el usuario está autenticado
      if (!firebaseUser.email) {
        throw new Error('Usuario sin email');
      }
      
      const userDocRef = doc(db, 'users', firebaseUser.email);
      const userDoc = await getDoc(userDocRef);
      
      let data: UserData = {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || undefined
      };
      
      if (userDoc.exists()) {
        data = { ...data, ...userDoc.data() } as UserData;
      }
      
      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUserData(data);
      
      console.log('👤 Usuario cargado desde Firestore:', data);
      
    } catch (error) {
      console.log('⚠️ Error cargando desde Firestore, usando datos básicos:', (error as Error).message || error);
      
      // Fallback: usar solo datos de Firebase Auth
      const basicData: UserData = {
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName || undefined
      };
      
      // 🔧 VERIFICAR SI YA HAY DATOS EN LOCALSTORAGE CON ROL
      const existingData = localStorage.getItem('user');
      if (existingData) {
        try {
          const parsedData = JSON.parse(existingData);
          if (parsedData.role) {
            // Mantener rol existente si ya está definido
            basicData.role = parsedData.role;
            basicData.isDelivery = parsedData.isDelivery;
            basicData.deliveryZones = parsedData.deliveryZones;
            console.log('👤 Manteniendo rol desde localStorage:', basicData);
          }
        } catch (parseError) {
          console.log('Error parseando localStorage existente');
        }
      }
      
      localStorage.setItem('user', JSON.stringify(basicData));
      setUserData(basicData);
    }
  };

  useEffect(() => {
    // ✅ Evita el error si auth es null (por variables de entorno mal configuradas)
    if (!auth) {
      console.error("⚠️ Firebase Auth no está inicializado. Revisa tus variables de entorno.");
      console.error("Variables de entorno disponibles:", {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Configurada' : 'Falta',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Configurada' : 'Falta',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Configurada' : 'Falta',
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
        setUserData(null);
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      let anon = localStorage.getItem('anonymousId');
      if (!anon) {
        anon = uuidv4();
        localStorage.setItem('anonymousId', anon);
      }
      setAnonymousId(anon);
    }
  }, [user]);




  const register = async (email: string, password: string, name?: string) => {
    if (!auth) throw new Error("Firebase Auth no inicializado");

    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (result.user) {
      await sendEmailVerification(result.user);

      if (name) {
        await updateProfile(result.user, { displayName: name });
        setUser({ ...result.user, displayName: name });
      }

      setJustRegistered(true); // ⚡ usuario recién registrado
    }

    return result;
  };



  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth no inicializado");

    const result = await signInWithEmailAndPassword(auth, email, password);

    if (!result.user.emailVerified) {
      await signOut(auth);
      const error: any = new Error("Debes verificar tu correo antes de iniciar sesión.");
      error.code = "auth/email-not-verified";
      throw error;
    }

    return result;
  };





  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    await signOut(auth);
    localStorage.removeItem("favourites_temp");
    localStorage.removeItem("user");
    setUserData(null);
  };

  const loginWithGoogle = () => {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    return signInWithPopup(auth, googleProvider);
  };

  const updateUserProfile = async (displayName?: string, photoURL?: string) => {
    if (!auth?.currentUser) throw new Error("Usuario no autenticado");
    
    const updateData: { displayName?: string; photoURL?: string } = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    
    await updateProfile(auth.currentUser, updateData);
    // Forzar actualización del estado del usuario
    setUser({ ...auth.currentUser });
    
    // Actualizar userData también
    if (userData) {
      const updatedUserData = { ...userData, displayName };
      setUserData(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }
  };

  // Computed property para saber si es delivery
  const isDelivery = userData?.role === 'delivery' || userData?.isDelivery === true;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      login, 
      register, 
      logout, 
      loginWithGoogle, 
      updateUserProfile,
      isDelivery 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
