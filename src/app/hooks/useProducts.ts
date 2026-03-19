import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import allProducts from '../products/productsData';

// 🚀 CACHE GLOBAL para evitar múltiples consultas a Firebase
let inventoryCache: any[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Hook personalizado para cargar productos combinados (estáticos + inventario) - ULTRA OPTIMIZADO
export const useProducts = (categoryFilter?: string) => {
  const [products, setProducts] = useState<any[]>([]);
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
      subcategory: inventoryProduct.subcategory || '',
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
    const fetchProductsFromInventory = async () => {
      setLoading(true);
      setError(null);
      try {
        let allInventoryProducts;
        const now = Date.now();
        if (inventoryCache && (now - cacheTimestamp) < CACHE_DURATION) {
          allInventoryProducts = inventoryCache;
        } else {
          allInventoryProducts = await inventoryService.getAllProducts();
          inventoryCache = allInventoryProducts;
          cacheTimestamp = now;
        }
        let filteredProducts = allInventoryProducts.filter((p: any) => p.stock > 0 && p.isActive !== false);
        if (categoryFilter) {
          const filterLc = categoryFilter.toLowerCase();
          filteredProducts = filteredProducts.filter((product: any) => {
            if ((product.subcategory || '').toLowerCase() === filterLc) return true;
            if (getCategoryLink(product.category) === categoryFilter) return true;
            if ((product.category || '').toLowerCase() === filterLc) return true;
            const categoryMap: { [key: string]: string[] } = {
              '/mujer': ['mujer', 'dama'],
              '/hombre': ['hombre', 'caballero'],
              '/ninos': ['ninos', 'niños', 'kids'],
              '/bebe': ['bebe', 'bebé', 'baby'],
              '/sport': ['sport', 'deportivo']
            };
            const validCategories = categoryMap[categoryFilter] || [];
            return validCategories.some(cat => (product.category || '').toLowerCase().includes(cat));
          });
        }
        setProducts(filteredProducts.map(convertInventoryToProduct));
      } catch (err) {
        console.error('❌ Error cargando productos desde inventario:', err);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    fetchProductsFromInventory();
  }, [categoryFilter]);

  return { products, loading, error };
};
