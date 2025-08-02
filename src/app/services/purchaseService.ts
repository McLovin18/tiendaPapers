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

export interface DailyOrder {
  id: string;
  userId: string;
  userName?: string; // Opcional para compatibilidad con pedidos existentes
  userEmail?: string; // Opcional: email del usuario
  date: string;
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
export const savePurchase = async (purchase: Omit<Purchase, 'id'>, userName?: string, userEmail?: string): Promise<string> => {
  try {
    validatePurchase(purchase);
    
    const currentDate = new Date();
    const dateString = purchase.date || currentDate.toISOString();
    const dayKey = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    console.log('🔍 Guardando compra:', {
      userId: purchase.userId,
      dayKey,
      total: purchase.total,
      itemsCount: purchase.items.length
    });
    
    // 1. OPERACIÓN PRINCIPAL: Guardar en la subcolección del usuario
    const userCollectionRef = collection(db, `users/${purchase.userId}/purchases`);
    const userDocRef = await addDoc(userCollectionRef, {
      ...purchase,
      date: dateString,
    });
    
    console.log('✅ Guardado en subcolección del usuario:', userDocRef.id);
    
    // 2. OPERACIÓN OPCIONAL: Intentar guardar en la colección diaria (sin fallar si no puede)
    try {
      const dailyOrderRef = doc(db, `dailyOrders/${dayKey}`);
      console.log('🔍 Intentando acceder a documento diario:', `dailyOrders/${dayKey}`);
      
      const dailyOrderSnapshot = await getDoc(dailyOrderRef);
      
      const orderData = {
        id: userDocRef.id,
        userId: purchase.userId,
        userName: userName || (userEmail ? userEmail.split('@')[0] : undefined), // Fallback al email si no hay userName
        userEmail: userEmail || undefined, // Asegurar que se guarde el email
        date: dateString,
        items: purchase.items,
        total: purchase.total,
        orderTime: currentDate.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
      
      if (dailyOrderSnapshot.exists()) {
        console.log('📄 Documento diario existe, agregando pedido...');
        const existingData = dailyOrderSnapshot.data();
        const orders: DailyOrder[] = existingData.orders || [];
        orders.push(orderData);
        
        await updateDoc(dailyOrderRef, {
          orders: orders,
          totalOrdersCount: orders.length,
          totalDayAmount: orders.reduce((sum: number, order: DailyOrder) => sum + order.total, 0),
          lastUpdated: currentDate.toISOString()
        });
        
        console.log('✅ Documento diario actualizado con', orders.length, 'pedidos');
      } else {
        console.log('📝 Creando nuevo documento diario...');
        await setDoc(dailyOrderRef, {
          date: dayKey,
          dateFormatted: currentDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          orders: [orderData],
          totalOrdersCount: 1,
          totalDayAmount: purchase.total,
          createdAt: currentDate.toISOString(),
          lastUpdated: currentDate.toISOString()
        });
        
        console.log('✅ Nuevo documento diario creado');
      }
      
      console.log('🎉 Compra guardada exitosamente en ambas ubicaciones');
    } catch (dailyOrderError) {
      // No fallar si no puede guardar en dailyOrders - solo logear el error
      console.warn('⚠️ No se pudo guardar en dailyOrders (puede ser por permisos):', dailyOrderError);
      console.log('✅ Compra guardada correctamente en subcolección del usuario (funcionalidad principal)');
    }
    
    // SIEMPRE retornar el ID exitosamente, ya que la operación principal funcionó
    return userDocRef.id;
  } catch (error) {
    console.error('❌ Error detallado al guardar compra:', error);
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
  const commentsCol = collection(db, `products/${productId}/comments`);
  await addDoc(commentsCol, comment); // Guarda foto también
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
      console.error("❌ Firebase no está inicializado");
      return false;
    }

    const commentRef = doc(db, `products/${productId}/comments`, commentId);
    console.log('🔍 Referencia del comentario:', commentRef.path);
    
    const snapshot = await getDoc(commentRef);
    if (!snapshot.exists()) {
      console.error("❌ El comentario no existe:", commentId);
      return false;
    }

    const data = snapshot.data();
    const updatedReplies = [...(data.replies || []), reply];

    console.log('📤 Actualizando comentario con nuevas respuestas...');
    await updateDoc(commentRef, { replies: updatedReplies });
    
    console.log('✅ Respuesta agregada exitosamente');
    return true;
    
  } catch (error) {
    console.error("❌ Error en addReplyToComment:", error);
    
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

/**
 * REGLAS DE FIRESTORE ACTUALIZADAS (con UID específico del admin):
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 * 
 *     // ✅ Usuarios: Solo el dueño puede leer o modificar su perfil
 *     match /users/{userId} {
 *       allow read, update, delete: if request.auth != null && request.auth.uid == userId;
 *       allow create: if request.auth != null;
 *       
 *       // ✅ Subcolecciones del usuario (compras, favoritos)
 *       match /{collection}/{document} {
 *         allow read, write: if request.auth != null && request.auth.uid == userId;
 *       }
 *     }
 * 
 *     // ✅ Productos: lectura pública, escritura solo para admins
 *     match /products/{productId} {
 *       allow read: if true;
 *       allow create, update, delete: if request.auth != null && request.auth.token.admin == true;
 *       
 *       // ✅ Comentarios de productos
 *       match /comments/{commentId} {
 *         allow read: if request.auth != null;
 *         allow create: if request.auth != null;
 *         allow update: if request.auth != null;
 *         allow delete: if false;
 *       }
 *     }
 *    
 *     // ✅ ACTUALIZADO: Pedidos diarios para administración
 *     match /dailyOrders/{date} {
 *       // CUALQUIER usuario autenticado puede escribir (para guardar pedidos)
 *       allow write: if request.auth != null;
 *       // SOLO el admin puede leer (usando UID específico)
 *       allow read: if request.auth != null && 
 *         request.auth.uid == "byRByEqdFOYxXOmUu9clvujvIUg1";
 *     }
 *   }
 * }
 */
/**
 * Función auxiliar para obtener información del usuario desde Firebase Auth
 */
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

