// src/app/services/cartService.ts

import { db } from '../utils/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
  userId: string;
  dateAdded: string;
}

export interface CartData {
  userId: string;
  items: CartItem[];
  lastUpdated: string;
  totalItems: number;
  totalPrice: number;
}

class CartService {
  private readonly COLLECTION_NAME = 'carts';

  /**
   * Obtener el carrito del usuario desde Firestore
   */
  async getUserCart(userId: string): Promise<CartItem[]> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      
      if (cartDoc.exists()) {
        const cartData = cartDoc.data() as CartData;
        return cartData.items || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error al obtener carrito:', error);
      return [];
    }
  }

  /**
   * Agregar producto al carrito
   */
  async addToCart(userId: string, item: Omit<CartItem, 'userId' | 'dateAdded'>): Promise<boolean> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      
      let items: CartItem[] = [];
      
      if (cartDoc.exists()) {
        const cartData = cartDoc.data() as CartData;
        items = cartData.items || [];
      }

      // Buscar si el producto ya existe (mismo id, talla y color)
      const existingItemIndex = items.findIndex(cartItem => 
        cartItem.id === item.id && 
        cartItem.size === item.size && 
        cartItem.color === item.color
      );

      const newItem: CartItem = {
        ...item,
        userId,
        dateAdded: new Date().toISOString()
      };

      if (existingItemIndex !== -1) {
        // Si existe, actualizar cantidad
        items[existingItemIndex].quantity += item.quantity;
      } else {
        // Si no existe, agregar nuevo item
        items.push(newItem);
      }

      // Calcular totales
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const cartData: CartData = {
        userId,
        items,
        lastUpdated: new Date().toISOString(),
        totalItems,
        totalPrice
      };

      await setDoc(cartRef, cartData);
      
      // Disparar evento para actualizar UI
      this.dispatchCartUpdateEvent();
      
      return true;
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      return false;
    }
  }

  /**
   * Actualizar cantidad de un producto en el carrito
   */
  async updateCartItemQuantity(userId: string, itemId: number, size: string, color: string, newQuantity: number): Promise<boolean> {
    try {
      if (newQuantity <= 0) {
        return await this.removeFromCart(userId, itemId, size, color);
      }

      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      
      if (!cartDoc.exists()) {
        return false;
      }

      const cartData = cartDoc.data() as CartData;
      const items = cartData.items || [];

      const itemIndex = items.findIndex(item => 
        item.id === itemId && 
        item.size === size && 
        item.color === color
      );

      if (itemIndex === -1) {
        return false;
      }

      items[itemIndex].quantity = newQuantity;

      // Recalcular totales
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const updatedCartData: CartData = {
        ...cartData,
        items,
        lastUpdated: new Date().toISOString(),
        totalItems,
        totalPrice
      };

      await setDoc(cartRef, updatedCartData);
      
      this.dispatchCartUpdateEvent();
      
      return true;
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      return false;
    }
  }

  /**
   * Remover producto del carrito
   */
  async removeFromCart(userId: string, itemId: number, size: string, color: string): Promise<boolean> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      
      if (!cartDoc.exists()) {
        return false;
      }

      const cartData = cartDoc.data() as CartData;
      const items = cartData.items || [];

      const filteredItems = items.filter(item => 
        !(item.id === itemId && item.size === size && item.color === color)
      );

      // Recalcular totales
      const totalItems = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const updatedCartData: CartData = {
        ...cartData,
        items: filteredItems,
        lastUpdated: new Date().toISOString(),
        totalItems,
        totalPrice
      };

      await setDoc(cartRef, updatedCartData);
      
      this.dispatchCartUpdateEvent();
      
      return true;
    } catch (error) {
      console.error('Error al remover del carrito:', error);
      return false;
    }
  }

  /**
   * Limpiar todo el carrito
   */
  async clearCart(userId: string): Promise<boolean> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      
      const emptyCartData: CartData = {
        userId,
        items: [],
        lastUpdated: new Date().toISOString(),
        totalItems: 0,
        totalPrice: 0
      };

      await setDoc(cartRef, emptyCartData);
      
      this.dispatchCartUpdateEvent();
      
      return true;
    } catch (error) {
      console.error('Error al limpiar carrito:', error);
      return false;
    }
  }

  /**
   * Obtener totales del carrito
   */
  async getCartTotals(userId: string): Promise<{ totalItems: number; totalPrice: number }> {
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      
      if (cartDoc.exists()) {
        const cartData = cartDoc.data() as CartData;
        return {
          totalItems: cartData.totalItems || 0,
          totalPrice: cartData.totalPrice || 0
        };
      }
      
      return { totalItems: 0, totalPrice: 0 };
    } catch (error) {
      console.error('Error al obtener totales:', error);
      return { totalItems: 0, totalPrice: 0 };
    }
  }

  /**
   * Migrar carrito desde localStorage a Firebase (solo una vez)
   */
  async migrateFromLocalStorage(userId: string): Promise<boolean> {
    try {
      // Verificar si ya existe un carrito en Firebase
      const existingCart = await this.getUserCart(userId);
      if (existingCart.length > 0) {
        return false;
      }

      // Intentar obtener desde localStorage
      const localCartKey = `cartItems_${userId}`;
      const localCartData = localStorage.getItem(localCartKey);
      
      if (!localCartData) {
        return false;
      }

      const localItems = JSON.parse(localCartData);
      
      if (!Array.isArray(localItems) || localItems.length === 0) {
        return false;
      }

      // Convertir items de localStorage al formato de Firebase
      const firebaseItems: CartItem[] = localItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        size: item.size || 'M',
        color: item.color || 'Default',
        userId,
        dateAdded: new Date().toISOString()
      }));

      // Calcular totales
      const totalItems = firebaseItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = firebaseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const cartData: CartData = {
        userId,
        items: firebaseItems,
        lastUpdated: new Date().toISOString(),
        totalItems,
        totalPrice
      };

      // Guardar en Firebase
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(cartRef, cartData);

      // Limpiar localStorage después de migrar exitosamente
      localStorage.removeItem(localCartKey);
      
      this.dispatchCartUpdateEvent();
      
      return true;
    } catch (error) {
      console.error('Error durante la migración:', error);
      return false;
    }
  }

  /**
   * Escuchar cambios en tiempo real del carrito
   */
  subscribeToCartChanges(userId: string, callback: (items: CartItem[]) => void): () => void {
    const cartRef = doc(db, this.COLLECTION_NAME, userId);
    
    return onSnapshot(cartRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const cartData = docSnapshot.data() as CartData;
        const items = cartData.items || [];
        callback(items);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Error en la suscripción del carrito:', error);
      callback([]);
    });
  }

  /**
   * Disparar evento personalizado para notificar cambios en el carrito
   */
  private dispatchCartUpdateEvent(): void {
    window.dispatchEvent(new Event('cart-updated'));
  }
}

// Instancia singleton del servicio de carrito
export const cartService = new CartService();
