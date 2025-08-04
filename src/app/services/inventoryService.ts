'use client';

import { db } from '../utils/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  increment
} from 'firebase/firestore';

export interface ProductInventory {
  productId: number;
  name: string;
  stock: number;
  price: number;
  images: string[]; // Array de URLs de imágenes
  category?: string;
  isActive: boolean; // Controlado automáticamente por stock
  lastUpdated: string;
  description?: string;
  sizes: string[]; // Tallas disponibles
  colors: string[]; // Colores disponibles
  details?: string[]; // Detalles del producto
}

class InventoryService {
  private collectionName = 'inventory';

  // ✅ Obtener stock de un producto específico
  async getProductStock(productId: number): Promise<number> {
    try {
      const docRef = doc(db, this.collectionName, productId.toString());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ProductInventory;
        return data.stock || 0;
      }
      
      return 0; // Si no existe, stock es 0
    } catch (error) {
      console.error('Error obteniendo stock:', error);
      return 0;
    }
  }

  // ✅ Verificar si un producto está disponible (automático basado en stock)
  async isProductAvailable(productId: number, requestedQuantity: number = 1): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, productId.toString());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return false;
      
      const data = docSnap.data() as ProductInventory;
      // Producto disponible si tiene stock suficiente (isActive se actualiza automáticamente)
      return data.stock >= requestedQuantity;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      return false;
    }
  }

  // ✅ Reducir stock cuando se hace una compra
  async reduceStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, productId.toString());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error(`❌ Producto ${productId} no encontrado en inventario`);
        throw new Error(`El producto ${productId} no está registrado en el inventario`);
      }
      
      const currentData = docSnap.data() as ProductInventory;
      
      if (currentData.stock < quantity) {
        console.error(`❌ Stock insuficiente para producto ${productId}: Disponible: ${currentData.stock}, Solicitado: ${quantity}`);
        throw new Error(`Stock insuficiente para "${currentData.name}". Stock disponible: ${currentData.stock}, cantidad solicitada: ${quantity}`);
      }
      
      await updateDoc(docRef, {
        stock: increment(-quantity),
        isActive: (currentData.stock - quantity) > 0, // Actualizar isActive automáticamente
        lastUpdated: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error reduciendo stock:', error);
      throw error; // Re-lanzar el error para que el sistema de compras lo maneje
    }
  }

  // ✅ Agregar stock (para admin) - actualiza isActive automáticamente
  async addStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, productId.toString());
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error(`❌ Producto ${productId} no encontrado en inventario`);
        return false;
      }

      const currentData = docSnap.data() as ProductInventory;
      const newStock = currentData.stock + quantity;
      
      await updateDoc(docRef, {
        stock: increment(quantity),
        isActive: newStock > 0, // Activar automáticamente si hay stock
        lastUpdated: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error agregando stock:', error);
      return false;
    }
  }

  // ✅ Crear o actualizar producto en inventario (para admin)
  async createOrUpdateProduct(productData: Omit<ProductInventory, 'lastUpdated' | 'isActive'>): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, productData.productId.toString());
      
      await setDoc(docRef, {
        ...productData,
        isActive: productData.stock > 0, // Activar automáticamente basado en stock
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error creando/actualizando producto:', error);
      return false;
    }
  }

  // ✅ Obtener productos disponibles por categoría
  async getProductsByCategory(category: string): Promise<ProductInventory[]> {
    try {
      // Consulta simplificada para evitar el error de índice compuesto
      // Solo filtramos por categoría y luego filtramos por stock en memoria
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category) // Solo filtrar por categoría
      );
      
      const querySnapshot = await getDocs(q);
      const products: ProductInventory[] = [];
      
      querySnapshot.forEach((doc) => {
        const productData = doc.data() as ProductInventory;
        // Filtrar por stock en memoria (solo productos con stock > 0)
        if (productData.stock > 0) {
          products.push({
            ...productData,
            productId: parseInt(doc.id)
          });
        }
      });
      
      console.log(`📦 Productos encontrados para categoría "${category}":`, products.length);
      return products.sort((a, b) => a.productId - b.productId);
    } catch (error) {
      console.error(`Error obteniendo productos de categoría "${category}":`, error);
      return [];
    }
  }

  // ✅ Obtener solo productos disponibles (para clientes) - basado en stock
  async getAvailableProducts(): Promise<ProductInventory[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('stock', '>', 0) // Solo productos con stock
      );
      
      const querySnapshot = await getDocs(q);
      const products: ProductInventory[] = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          ...doc.data() as ProductInventory,
          productId: parseInt(doc.id)
        });
      });
      
      return products.sort((a, b) => a.productId - b.productId);
    } catch (error) {
      console.error('Error obteniendo productos disponibles:', error);
      return [];
    }
  }

  // ✅ Eliminar producto completamente (para admin)
  async deleteProduct(productId: number): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, productId.toString());
      await deleteDoc(docRef);
      
      return true;
    } catch (error) {
      console.error('Error eliminando producto:', error);
      return false;
    }
  }

  // ✅ Obtener todos los productos del inventario (para admin)
  async getAllProducts(): Promise<ProductInventory[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      const products: ProductInventory[] = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          ...doc.data() as ProductInventory,
          productId: parseInt(doc.id)
        });
      });
      
      return products.sort((a, b) => a.productId - b.productId);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return [];
    }
  }

  // ✅ Procesar compra y reducir stock de múltiples productos
  async processOrder(items: { productId: number; quantity: number }[]): Promise<boolean> {
    const processedItems: { productId: number; quantity: number }[] = [];
    
    try {
      // Verificar stock de todos los productos primero
      for (const item of items) {
        const available = await this.isProductAvailable(item.productId, item.quantity);
        if (!available) {
          const productStock = await this.getProductStock(item.productId);
          throw new Error(`Stock insuficiente para producto ${item.productId}. Stock disponible: ${productStock}, cantidad solicitada: ${item.quantity}`);
        }
      }
      
      // Si todo está disponible, reducir stock uno por uno
      for (const item of items) {
        try {
          await this.reduceStock(item.productId, item.quantity);
          processedItems.push(item);
        } catch (error) {
          console.error(`❌ Error reduciendo stock para producto ${item.productId}:`, error);
          
          // Revertir cambios si algo falla a mitad del proceso
          for (const processedItem of processedItems) {
            try {
              await this.addStock(processedItem.productId, processedItem.quantity);
              console.log(`↩️ Stock revertido para producto ${processedItem.productId}: ${processedItem.quantity} unidades`);
            } catch (revertError) {
              console.error(`❌ Error revirtiendo stock para producto ${processedItem.productId}:`, revertError);
            }
          }
          
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error procesando orden:', error);
      throw error; // Re-lanzar para que purchaseService lo maneje
    }
  }
}

export const inventoryService = new InventoryService();
