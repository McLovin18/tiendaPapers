'use client';

import { db } from '../utils/firebase';
import { collection, addDoc, getDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc, updateDoc} from 'firebase/firestore';

// Definición de tipos
export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Purchase {
  id?: string;
  userId: string;
  date: string;
  items: PurchaseItem[];
  total: number;
}

// Colección de compras en Firestore (ahora como subcolección por usuario)
// const PURCHASES_COLLECTION = 'purchases';

/**
 * Valida los datos de una compra antes de guardarla
 */
function validatePurchase(purchase: Omit<Purchase, 'id'>) {
  if (!purchase.userId || typeof purchase.userId !== 'string') {
    throw new Error('El userId es requerido y debe ser un string.');
  }
  if (!Array.isArray(purchase.items) || purchase.items.length === 0) {
    throw new Error('La compra debe tener al menos un producto.');
  }
  purchase.items.forEach((item, idx) => {
    if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number' || !item.image) {
      throw new Error(`El producto en la posición ${idx} no es válido.`);
    }
  });
  if (typeof purchase.total !== 'number' || purchase.total < 0) {
    throw new Error('El total debe ser un número mayor o igual a 0.');
  }
}

/**
 * Guarda una nueva compra en Firestore en la subcolección del usuario
 */
export const savePurchase = async (purchase: Omit<Purchase, 'id'>): Promise<string> => {
  try {
    validatePurchase(purchase);
    // Referencia a la subcolección purchases del usuario
    const collectionRef = collection(db, `users/${purchase.userId}/purchases`);
    const date = purchase.date || new Date().toISOString();
    const docRef = await addDoc(collectionRef, {
      ...purchase,
      date,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error detallado al guardar compra:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
};

/**
 * Obtiene todas las compras de un usuario desde la subcolección
 */
export const getUserPurchases = async (userId: string): Promise<Purchase[]> => {
  try {
    const q = query(
      collection(db, `users/${userId}/purchases`),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const purchases: Purchase[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Purchase, 'id'>;
      purchases.push({
        id: doc.id,
        ...data,
      });
    });
    return purchases;
  } catch (error) {
    console.error('Error al obtener las compras del usuario:', error);
    throw error;
  }
};

/**
 * Elimina todas las compras de un usuario
 */
export const clearUserPurchases = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, `users/${userId}/purchases`)
    );
    
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map((doc) => {
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error al eliminar las compras del usuario:', error);
    throw error;
  }
};

/**
 * Función de compatibilidad para migrar compras de localStorage a Firestore
 */
// (Eliminada: ahora solo se usa Firestore para compras)

// --- FAVORITOS FIRESTORE ---

/**
 * Agrega un producto a favoritos del usuario en Firestore
 */
export const addFavourite = async (userId: string, product: {
  id: string | number;
  name: string;
  price: number;
  image: string;
  description?: string;
}) => {
  if (!userId) return;
  if (!product.image) {
    product.image = "/images/product1.svg"; // imagen fallback
  }
  const favRef = doc(db, `users/${userId}/favourites/${product.id}`);
  await setDoc(favRef, product);
};


export const removeFavourite = async (userId: string, productId: string | number) => {
  if (!userId || !productId) return;
  const favRef = doc(db, `users/${userId}/favourites/${productId}`);
  await deleteDoc(favRef);
};

export const getUserFavourites = async (userId: string) => {
  if (!userId) return [];
  const favsCol = collection(db, `users/${userId}/favourites`);
  const snapshot = await getDocs(favsCol); // 🔥 siempre lee del servidor
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// --- COMENTARIOS DE PRODUCTO EN FIRESTORE ---

/**
 * Agrega un comentario a un producto en Firestore
 */
export const addProductComment = async (
  productId: string | number,
  comment: { name: string; text: string; date: string; rating: number; replies: any[] }
) => {
  if (!productId || !comment?.text) throw new Error("productId y comentario requeridos");
  const commentsCol = collection(db, `products/${productId}/comments`);
  await addDoc(commentsCol, comment); // ✅ Ahora incluye rating y replies
};



/**
 * Obtiene todos los comentarios de un producto desde Firestore, ordenados por fecha descendente
 */
export const getProductComments = async (productId: string | number) => {
  if (!productId) return [];
  const commentsCol = collection(db, `products/${productId}/comments`);
  const q = query(commentsCol, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // ✅ AÑADIR doc.id
};

export const updateProductRating = async (productId: string | number, averageRating: number) => {
  const productRef = doc(db, "products", String(productId));
  await updateDoc(productRef, { averageRating });
};


export const addReplyToComment = async (
  productId: string | number,
  commentId: string,
  reply: { name: string; text: string; date: string }
) => {
  const commentRef = doc(db, `products/${productId}/comments`, commentId);
  const snapshot = await getDoc(commentRef);
  if (!snapshot.exists()) return;

  const data = snapshot.data();
  const updatedReplies = [...(data.replies || []), reply];

  await updateDoc(commentRef, { replies: updatedReplies });
};
