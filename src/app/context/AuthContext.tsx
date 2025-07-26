'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<UserCredential>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Evita el error si auth es null (por variables de entorno mal configuradas)
    if (!auth) {
      console.error("⚠️ Firebase Auth no está inicializado. Revisa tus variables de entorno.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    await signOut(auth);
    localStorage.removeItem("favourites_temp");
  };

  const loginWithGoogle = () => {
    if (!auth) throw new Error("Firebase Auth no inicializado");
    return signInWithPopup(auth, googleProvider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
