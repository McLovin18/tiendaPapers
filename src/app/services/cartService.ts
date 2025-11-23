'use client';

import { db } from '../utils/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';
import { inventoryService } from './inventoryService';

// Reactivo interno del CartService
type Listener = (items: CartItem[]) => void;

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  userId?: string;
  dateAdded?: string;
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
  private readonly CART_GUEST_KEY = 'cartItems_guest';

  // Estado reactivo interno
  private listeners: Listener[] = [];

  /* ================================================================
      🔹 LISTENER SYSTEM REACTIVO
  =================================================================*/
  subscribe(callback: Listener, userId?: string) {
    this.listeners.push(callback);

    // Estado inicial correcto según usuario
    if (userId) {
      this.getUserCart(userId).then(items => callback(items));
    } else {
      callback(this.getGuestCart());
    }

    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }


  


  // 🔄 Compatibilidad con versiones previas
  subscribeToCartChanges(callback: Listener) {
    return this.subscribe(callback);
  }

  getGuestTotalItems(): number {
    const cart = this.getGuestCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }


  private emit(items?: CartItem[]) {
    if (items) {
      this.listeners.forEach(cb => cb(items));
    } else {
      // Si no hay items → modo invitado
      const guest = this.getGuestCart();
      this.listeners.forEach(cb => cb(guest));
    }
  }

  /* ================================================================
      🔹 CARRITO INVITADO
  =================================================================*/
  private getGuestCart(): CartItem[] {
    return JSON.parse(localStorage.getItem(this.CART_GUEST_KEY) || '[]');
  }

  private saveGuestCart(items: CartItem[]) {
    localStorage.setItem(this.CART_GUEST_KEY, JSON.stringify(items));

    // Emitir cambios al sistema reactivo
    this.emit(items);

    // Evento global (para actualizar el ícono)
    window.dispatchEvent(new Event("cart-updated"));
  }

  /* ================================================================
      🔹 GET USER CART
  =================================================================*/
  async getUserCart(userId: string): Promise<CartItem[]> {
    if (!userId) {
      return this.getGuestCart();
    }

    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      if (cartDoc.exists()) return (cartDoc.data() as CartData).items || [];
      return [];

    } catch (error) {
      console.error("Error al obtener carrito:", error);
      return [];
    }
  }



  /* ================================================================
      🔹 ADD TO CART
  =================================================================*/

  async addToCart(
    userId: string,
    item: Omit<CartItem, 'userId' | 'dateAdded'>
  ): Promise<boolean> {

    /* ======================================
          🟣 MODO INVITADO (sin login)
    ====================================== */
    if (!userId) {
      const guestItems = this.getGuestCart();
      const index = guestItems.findIndex(i => i.id === item.id);

      if (index !== -1) {
        guestItems[index].quantity += item.quantity;
      } else {
        guestItems.push({
          ...item,
          dateAdded: new Date().toISOString()
        });
      }

      this.saveGuestCart(guestItems);


      return true;
    }


    

    /* ======================================
          🟢 MODO LOGUEADO (Firebase)
    ====================================== */
    try {
      // 🛑 Validar stock del inventario
      const isAvailable = await inventoryService.isProductAvailable(
        item.id,
        item.quantity
      );

      if (!isAvailable) {
        const stock = await inventoryService.getProductStock(item.id);
        throw new Error(`No hay suficiente stock. Stock disponible: ${stock}`);
      }

      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);

      let items: CartItem[] = [];
      if (cartDoc.exists()) {
        items = (cartDoc.data() as CartData).items || [];
      }

      const index = items.findIndex(i => i.id === item.id);

      if (index !== -1) {
        // sumar cantidad
        const newQuantity = items[index].quantity + item.quantity;

        const available = await inventoryService.isProductAvailable(item.id, newQuantity);
        if (!available) {
          const stock = await inventoryService.getProductStock(item.id);
          throw new Error(`Cantidad supera stock. Stock actual: ${stock}`);
        }

        items[index].quantity += item.quantity;

      } else {
        items.push({
          ...item,
          userId,
          dateAdded: new Date().toISOString()
        });
      }

      const totalItems = items.reduce((a, b) => a + b.quantity, 0);
      const totalPrice = items.reduce((a, b) => a + b.quantity * b.price, 0);

      const newCart: CartData = {
        userId,
        items,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      };

      await setDoc(cartRef, newCart);

      // 🔥 emitir actualización a los listeners del cartService
      this.emit(items);

      // 🔥 notificación global (carrito actualizado en otras páginas)
      window.dispatchEvent(new Event("cart-updated"));

      return true;

    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      throw error;
    }
  }


  /* ================================================================
    🔹 CLEAR CART
================================================================*/
  async clearCart(userId?: string): Promise<boolean> {
    // Invitado
    if (!userId) {
      localStorage.removeItem(this.CART_GUEST_KEY);
      this.emit([]);
      window.dispatchEvent(new Event("cart-updated"));
      return true;
    }

    // Logueado
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(cartRef, {
        userId,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        lastUpdated: new Date().toISOString()
      });
      this.emit([]);
      window.dispatchEvent(new Event("cart-updated"));
      return true;
    } catch (error) {
      console.error("Error al limpiar el carrito:", error);
      return false;
    }
  }



  

  /* ================================================================
      🔹 UPDATE QUANTITY
  =================================================================*/
  async updateCartItemQuantity(userId: string, itemId: number, qty: number): Promise<boolean> {

    /* Invitado */
    if (!userId) {
      const items = this.getGuestCart();
      const index = items.findIndex(i => i.id === itemId);

      if (index === -1) return false;

      if (qty <= 0) items.splice(index, 1);
      else items[index].quantity = qty;

      this.saveGuestCart(items);
      return true;
    }

    /* Logueado */
    try {
      const available = await inventoryService.isProductAvailable(itemId, qty);
      if (!available) {
        const stock = await inventoryService.getProductStock(itemId);
        throw new Error(`Stock insuficiente. Disponible: ${stock}`);
      }

      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      if (!cartDoc.exists()) return false;

      const cartData = cartDoc.data() as CartData;
      const items = cartData.items;

      const index = items.findIndex(i => i.id === itemId);
      if (index === -1) return false;

      if (qty <= 0) items.splice(index, 1);
      else items[index].quantity = qty;

      const totalItems = items.reduce((a, b) => a + b.quantity, 0);
      const totalPrice = items.reduce((a, b) => a + b.quantity * b.price, 0);

      await setDoc(cartRef, {
        ...cartData,
        items,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      });

      this.emit(items);
      return true;

    } catch (error) {
      console.error("Error actualizando cantidad:", error);
      throw error;
    }
  }


  /* ================================================================
      🔹 REMOVE ITEM
  =================================================================*/
  async removeFromCart(userId: string, itemId: number): Promise<boolean> {

    /* Invitado */
    if (!userId) {
      const items = this.getGuestCart().filter(i => i.id !== itemId);
      this.saveGuestCart(items);
      return true;
    }

    /* Logueado */
    try {
      const cartRef = doc(db, this.COLLECTION_NAME, userId);
      const cartDoc = await getDoc(cartRef);
      if (!cartDoc.exists()) return false;

      const cartData = cartDoc.data() as CartData;
      const items = cartData.items.filter(i => i.id !== itemId);

      const totalItems = items.reduce((a, b) => a + b.quantity, 0);
      const totalPrice = items.reduce((a, b) => a + b.quantity * b.price, 0);

      await setDoc(cartRef, {
        ...cartData,
        items,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      });

      this.emit(items);
      return true;

    } catch (error) {
      console.error("Error al remover item:", error);
      return false;
    }
  }

  /* ================================================================
      🔹 MIGRATE LOCAL → FIREBASE
  =================================================================*/
  async migrateFromLocalStorage(userId: string): Promise<boolean> {
    try {
      if (!userId) return false;

      const existing = await this.getUserCart(userId);
      if (existing.length > 0) return false;

      const guest = this.getGuestCart();
      if (guest.length === 0) return false;

      const merged = guest.map(i => ({
        ...i,
        userId,
        dateAdded: new Date().toISOString()
      }));

      const totalItems = merged.reduce((a, b) => a + b.quantity, 0);
      const totalPrice = merged.reduce((a, b) => a + b.quantity * b.price, 0);

      await setDoc(doc(db, this.COLLECTION_NAME, userId), {
        userId,
        items: merged,
        totalItems,
        totalPrice,
        lastUpdated: new Date().toISOString()
      });

      localStorage.removeItem(this.CART_GUEST_KEY);
      this.emit(merged);
      return true;

    } catch (error) {
      console.error("Error migrando carrito:", error);
      return false;
    }
  }
}

export const cartService = new CartService();
