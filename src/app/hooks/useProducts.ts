import { useState, useEffect } from 'react';
import { inventoryService } from '../services/inventoryService';
import allProducts from '../products/productsData';

// Hook personalizado para cargar productos combinados (estáticos + inventario) - OPTIMIZADO
export const useProducts = (categoryFilter?: string) => {
  const [products, setProducts] = useState(allProducts);
  const [loading, setLoading] = useState(false); // Cambiado a false para mostrar productos estáticos inmediatamente
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
      sizes: inventoryProduct.sizes || ['ÚNICA'],
      colors: inventoryProduct.colors || ['Sin especificar'],
      details: inventoryProduct.details || [],
      featured: false // Los productos del inventario no son featured por defecto
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
    // Mostrar productos estáticos inmediatamente
    let initialProducts = allProducts;
    if (categoryFilter) {
      initialProducts = allProducts.filter(
        product => product.categoryLink === categoryFilter
      );
    }
    setProducts(initialProducts);

    // Cargar productos del inventario en background
    const loadInventoryProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtener productos del inventario
        const inventoryProducts = await inventoryService.getAllProducts();
        
        if (inventoryProducts.length > 0) {
          // Convertir productos del inventario al formato de la tienda
          const convertedInventoryProducts = inventoryProducts.map(convertInventoryToProduct);
          
          // Obtener IDs de productos estáticos para evitar duplicados
          const staticProductIds = new Set(allProducts.map(p => p.id));
          
          // Filtrar productos del inventario que no estén ya en productos estáticos
          const newInventoryProducts = convertedInventoryProducts.filter(
            p => !staticProductIds.has(p.id)
          );
          
          // Combinar productos estáticos con productos del inventario
          let combinedProducts = [...allProducts, ...newInventoryProducts];
          
          // Aplicar filtro de categoría si se especifica
          if (categoryFilter) {
            combinedProducts = combinedProducts.filter(product => {
              // Para productos del inventario, verificar tanto categoryLink como category
              if (product.categoryLink === categoryFilter) return true;
              if (product.category?.toLowerCase() === categoryFilter) return true;
              
              // Mapeo adicional para compatibilidad
              const categoryMap: { [key: string]: string[] } = {
                'mujer': ['mujer', 'dama'],
                'hombre': ['hombre', 'caballero'], 
                'ninos': ['ninos', 'niños', 'kids'],
                'bebe': ['bebe', 'bebé', 'baby'],
                'sport': ['sport', 'deportivo']
              };
              
              const validCategories = categoryMap[categoryFilter] || [];
              return validCategories.some(cat => 
                product.category?.toLowerCase().includes(cat)
              );
            });
          }
          
          setProducts(combinedProducts);
        }
      } catch (err) {
        console.error('Error cargando productos del inventario:', err);
        setError('Error al cargar productos del inventario');
        // Los productos estáticos ya están cargados, no hacer nada más
      } finally {
        setLoading(false);
      }
    };

    loadInventoryProducts();
  }, [categoryFilter]);

  return { products, loading, error };
};
