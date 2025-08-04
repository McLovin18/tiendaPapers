import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import allProducts from '../products/productsData';

// 🚀 CACHE GLOBAL para evitar múltiples consultas a Firebase
let inventoryCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Hook personalizado para cargar productos combinados (estáticos + inventario) - ULTRA OPTIMIZADO
export const useProducts = (categoryFilter?: string) => {
  const [products, setProducts] = useState(allProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para convertir productos del inventario al formato de la tienda
  const convertInventoryToProduct = (inventoryProduct: any) => {
    return {
      id: inventoryProduct.productId,
      name: inventoryProduct.name,
      price: inventoryProduct.price,
      images: inventoryProduct.images || ['/images/product1.svg'],
      category: inventoryProduct.category || 'general',
      categoryLink: getCategoryLink(inventoryProduct.category),
      description: inventoryProduct.description || '',
      inStock: inventoryProduct.stock > 0 && inventoryProduct.isActive !== false,
      stockQuantity: inventoryProduct.stock || 0, // Incluir cantidad de stock
      sizes: inventoryProduct.sizes || ['ÚNICA'],
      colors: inventoryProduct.colors || ['Sin especificar'],
      details: inventoryProduct.details || [],
      featured: false, // Los productos del inventario no son featured por defecto
      isFromFirebase: true // Marcar que viene de Firebase
    };
  };

  // Función para determinar categoryLink basado en la categoría
  const getCategoryLink = (category?: string): string => {
    if (!category) return '/general';
    
    const categoryLower = category.toLowerCase().trim();
    
    // Mapeo exacto de categorías
    const categoryMap: { [key: string]: string } = {
      'mujer': '/mujer',
      'hombre': '/hombre',
      'ninos': '/ninos',
      'niños': '/ninos',
      'bebe': '/bebe',
      'bebé': '/bebe',
      'sport': '/sport'
    };
    
    return categoryMap[categoryLower] || '/general';
  };

  useEffect(() => {
    // 🚀 MOSTRAR PRODUCTOS ESTÁTICOS INMEDIATAMENTE
    let initialProducts = allProducts;
    if (categoryFilter) {
      initialProducts = allProducts.filter(
        product => product.categoryLink === categoryFilter
      );
    }
    
    // Mostrar productos estáticos con su propio campo inStock primero
    const staticProductsFiltered = initialProducts.filter(product => product.inStock);
    setProducts(staticProductsFiltered);
    
    // 📦 CARGAR STOCK DE FIREBASE EN SEGUNDO PLANO (con cache)
    const optimizeWithFirebaseStock = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let allInventoryProducts;
        const now = Date.now();
        
        // � VERIFICAR CACHE antes de consultar Firebase
        if (inventoryCache && (now - cacheTimestamp) < CACHE_DURATION) {
          allInventoryProducts = inventoryCache;
        } else {
          allInventoryProducts = await inventoryService.getAllProducts();
          // Actualizar cache
          inventoryCache = allInventoryProducts;
          cacheTimestamp = now;
        }
        
        // 🔍 PASO 2: Crear un mapa de stock para búsqueda rápida
        const stockMap = new Map();
        allInventoryProducts.forEach(product => {
          stockMap.set(product.productId, product);
        });
        
        // 🔍 PASO 3: Procesar productos estáticos con el mapa de stock (RÁPIDO)
        const optimizedStaticProducts = [];
        for (const staticProduct of allProducts) {
          const firebaseData = stockMap.get(staticProduct.id);
          
          if (firebaseData) {
            // Producto existe en Firebase: usar stock de Firebase
            if (firebaseData.stock > 0) {
              optimizedStaticProducts.push({
                ...staticProduct,
                inStock: true,
                stockQuantity: firebaseData.stock,
                isFromFirebase: false // Es producto estático con datos de Firebase
              });
            }
          } else {
            // Producto NO existe en Firebase: usar inStock original
            if (staticProduct.inStock) {
              optimizedStaticProducts.push({
                ...staticProduct,
                inStock: true,
                stockQuantity: 999, // Valor por defecto para productos estáticos sin inventario Firebase
                isFromFirebase: false
              });
            }
          }
        }
        
        // 🔍 PASO 4: Convertir productos únicamente de Firebase (no estáticos)
        const convertedInventoryProducts = allInventoryProducts
          .filter((inventoryProduct: any) => inventoryProduct.stock > 0) // Solo productos con stock
          .map(convertInventoryToProduct);
        
        // 🔍 PASO 5: Obtener IDs de productos estáticos para evitar duplicados
        const staticProductIds = new Set(allProducts.map(p => p.id));
        
        // 🔍 PASO 6: Filtrar productos del inventario que no estén ya en productos estáticos
        const newInventoryProducts = convertedInventoryProducts.filter(
          (p: any) => !staticProductIds.has(p.id)
        );
        
        // 🔍 PASO 7: Combinar productos estáticos optimizados + productos únicos de Firebase
        let combinedProducts = [...optimizedStaticProducts, ...newInventoryProducts];
        
        // 🔍 PASO 8: Aplicar filtro de categoría si se especifica
        if (categoryFilter) {
          combinedProducts = combinedProducts.filter(product => {
            // Para productos del inventario, verificar tanto categoryLink como category
            if (product.categoryLink === categoryFilter) return true;
            if (product.category?.toLowerCase() === categoryFilter) return true;
            
            // Mapeo adicional para compatibilidad
            const categoryMap: { [key: string]: string[] } = {
              '/mujer': ['mujer', 'dama'],
              '/hombre': ['hombre', 'caballero'], 
              '/ninos': ['ninos', 'niños', 'kids'],
              '/bebe': ['bebe', 'bebé', 'baby'],
              '/sport': ['sport', 'deportivo']
            };
            
            const validCategories = categoryMap[categoryFilter] || [];
            return validCategories.some(cat => 
              product.category?.toLowerCase().includes(cat)
            );
          });
        }
        
        setProducts(combinedProducts);
      } catch (err) {
        console.error('❌ Error optimizando productos:', err);
        setError('Error al cargar productos');
        
        // Como fallback, usar productos estáticos ya mostrados (no hacer nada más)
      } finally {
        setLoading(false);
      }
    };

    // 🚀 Ejecutar optimización en segundo plano
    optimizeWithFirebaseStock();
  }, [categoryFilter]);

  return { products, loading, error };
};
