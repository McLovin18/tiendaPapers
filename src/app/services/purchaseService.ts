'use client';

import { db } from '../utils/firebase';
import { collection, addDoc, getDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { auth } from '../utils/firebase';
import { SecureLogger } from '../utils/security';
import { inventoryService } from './inventoryService';

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
  purchaseId?: string;
  userId: string;
  date: string;
  items: PurchaseItem[];
  total: number;
}

export interface DailyOrder {
  id: string;
  userId: string;
  userName?: string; // Opcional para compatibilidad con pedidos existentes
  userEmail?: string; // Opcional: email del usuario
  date: string;
  guestCheckout?: boolean; // ✅ agregado
  items: PurchaseItem[];
  total: number;
  orderTime: string;
}

export interface DailyOrdersDocument {
  date: string; // YYYY-MM-DD
  dateFormatted: string;
  orders: DailyOrder[];
  totalOrdersCount: number;
  totalDayAmount: number;
  createdAt: string;
  lastUpdated: string;
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
 * Y también intenta guardarla en la colección diaria de pedidos para fácil visualización (opcional)
 */


export const savePurchase = async (
  purchase: Omit<Purchase, 'id'>,
  userName?: string,
  userEmail?: string
): Promise<string> => {
  try {
    validatePurchase(purchase);

    const currentDate = new Date();
    const dateString = purchase.date || currentDate.toISOString();
    const dayKey = currentDate.toISOString().split('T')[0];

    const currentUser = auth.currentUser;
    const isGuest = !currentUser;
    const finalUserId = isGuest ? 'guest' : purchase.userId;

    // Reducir inventario
    await inventoryService.processOrder(
      purchase.items.map(item => ({
        productId: parseInt(item.id),
        quantity: item.quantity
      }))
    );

    // Guardar compra principal
    const purchaseRef = isGuest
      ? collection(db, 'guestPurchases')
      : collection(db, `users/${purchase.userId}/purchases`);

    const tempDocRef = doc(purchaseRef);
    const purchaseId = tempDocRef.id;

    await setDoc(tempDocRef, {
      ...purchase,
      userId: finalUserId,
      guestCheckout: isGuest,
      date: dateString,
      purchaseId
    });

    // Guardar en dailyOrders solo si hay usuario autenticado
    if (!isGuest) {
      try {
        const dailyOrderRef = doc(db, `dailyOrders/${dayKey}`);

        const orderData: DailyOrder = {
          id: purchaseId,
          userId: finalUserId,
          guestCheckout: isGuest,
          userName: userName || (userEmail ? userEmail.split('@')[0] : undefined),
          userEmail: userEmail || undefined,
          date: dateString,
          items: purchase.items,
          total: purchase.total,
          orderTime: currentDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })
        };

        await setDoc(
          dailyOrderRef,
          {
            orders: arrayUnion(orderData),
            totalOrdersCount: increment(1),
            totalDayAmount: increment(purchase.total),
            lastUpdated: currentDate.toISOString()
          },
          { merge: true }
        );
      } catch (dailyError) {
        console.warn('No se pudo guardar en dailyOrders:', dailyError);
      }
    }

    return purchaseId;
  } catch (error: any) {
    console.error('Error en savePurchase:', error);
    // Lanzar un mensaje más específico para el front
    throw new Error(error.message || 'Error desconocido al guardar la compra');
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
        id: doc.id, // Usar el ID del documento como ID principal
        purchaseId: data.purchaseId || doc.id, // Mantener purchaseId si existe
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
  comment: { 
    name: string; 
    text: string; 
    date: string; 
    rating: number; 
    replies: any[],
    photoURL?: string
  }
) => {
  if (!productId || !comment?.text) throw new Error("productId y comentario requeridos");
  
  // ✅ VERIFICAR AUTENTICACIÓN Y AGREGAR userId
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Usuario no autenticado');
  }
  
  // ✅ Agregar userId al comentario
  const commentWithUserId = {
    ...comment,
    userId: currentUser.uid
  };
  
  const commentsCol = collection(db, `products/${productId}/comments`);
  await addDoc(commentsCol, commentWithUserId);
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
  try {
    const productRef = doc(db, "products", String(productId));
    
    // Intentar actualizar el documento
    await updateDoc(productRef, { averageRating });
  } catch (error: any) {
    // Si el documento no existe, crearlo con el rating
    if (error.code === 'not-found') {
      const productRef = doc(db, "products", String(productId));
      await setDoc(productRef, { 
        id: String(productId),
        averageRating 
      }, { merge: true });
    } else {
      console.error('❌ Error al actualizar rating del producto:', error);
    }
  }
};


export const addReplyToComment = async (
  productId: string | number,
  commentId: string,
  reply: { name: string; text: string; date: string }
): Promise<boolean> => {
  try {
    if (!productId || !commentId) {
      console.error("❌ Falta productId o commentId en addReplyToComment");
      return false;
    }

    console.log('📝 Intentando agregar respuesta:', {
      productId,
      commentId,
      replyText: reply.text.substring(0, 50) + '...'
    });

    // Verificar que Firebase esté inicializado
    if (!db) {
      return false;
    }

    const commentRef = doc(db, `products/${productId}/comments`, commentId);
    
    const snapshot = await getDoc(commentRef);
    if (!snapshot.exists()) {
      return false;
    }

    const data = snapshot.data();
    const updatedReplies = [...(data.replies || []), reply];
    await updateDoc(commentRef, { replies: updatedReplies });
    
    return true;
    
  } catch (error) {
    // Mostrar información específica del error
    if (error instanceof Error) {
      console.error("Mensaje del error:", error.message);
      console.error("Código del error:", (error as any).code);
    }
    
    return false;
  }
};

// --- FUNCIONES PARA GESTIÓN DIARIA DE PEDIDOS ---

/**
 * Obtiene todos los pedidos de un día específico
 */
export const getDailyOrders = async (date: string): Promise<DailyOrdersDocument | null> => {
  try {
    const dailyOrderRef = doc(db, `dailyOrders/${date}`);
    const snapshot = await getDoc(dailyOrderRef);
    
    if (snapshot.exists()) {
      return snapshot.data() as DailyOrdersDocument;
    }
    return null;
  } catch (error) {
    console.error('Error al obtener pedidos del día:', error);
    throw error;
  }
};

/**
 * Obtiene todos los días que tienen pedidos, ordenados por fecha descendente
 */
export const getAllOrderDays = async (): Promise<DailyOrdersDocument[]> => {
  try {
    const q = query(
      collection(db, 'dailyOrders'),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const days: DailyOrdersDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DailyOrdersDocument;
      days.push(data);
    });
    
    return days;
  } catch (error) {
    console.error('❌ Error al obtener días con pedidos:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de pedidos por rango de fechas
 */
export const getOrdersStatistics = async (startDate: string, endDate: string) => {
  try {
    const q = query(
      collection(db, 'dailyOrders'),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const filteredDays: DailyOrdersDocument[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DailyOrdersDocument;
      if (data.date >= startDate && data.date <= endDate) {
        filteredDays.push(data);
      }
    });
    
    const totalOrders = filteredDays.reduce((sum, day) => sum + day.totalOrdersCount, 0);
    const totalAmount = filteredDays.reduce((sum, day) => sum + day.totalDayAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;
    
    return {
      totalDays: filteredDays.length,
      totalOrders,
      totalAmount,
      averageOrderValue,
      averageOrdersPerDay: filteredDays.length > 0 ? totalOrders / filteredDays.length : 0,
      days: filteredDays
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Obtiene los pedidos de hoy
 */
export const getTodayOrders = async (): Promise<DailyOrdersDocument | null> => {
  const today = new Date().toISOString().split('T')[0];
  return getDailyOrders(today);
};



export const getUserDisplayInfo = (user: any) => {
  if (!user) return { userName: undefined, userEmail: undefined };
  
  // Prioridad: displayName > email (parte antes del @) > undefined
  let userName: string | undefined = undefined;
  if (user.displayName) {
    userName = user.displayName;
  } else if (user.email) {
    userName = user.email.split('@')[0];
  }
  
  return {
    userName,
    userEmail: user.email || undefined
  };
};

