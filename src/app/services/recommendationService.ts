// src/app/services/recommendationService.ts

import allProducts from '../products/productsData';

export interface Product {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  categoryLink: string;
  description: string;
  inStock: boolean;
  sizes: string[];
  colors: string[];
  details: string[];
  featured?: boolean;
}

export interface RecommendationScore {
  productId: number;
  score: number;
  product: Product;
}

class RecommendationEngine {
  private products: Product[];

  constructor() {
    this.products = allProducts;
  }

  /**
   * Calcula la similitud entre dos productos basándose en múltiples factores
   */
  private calculateSimilarity(targetProduct: Product, candidateProduct: Product): number {
    let score = 0;
    
    // No recomendar el mismo producto
    if (targetProduct.id === candidateProduct.id) {
      return 0;
    }

    // Solo productos en stock
    if (!candidateProduct.inStock) {
      return 0;
    }

    // 1. Similitud de categoría (peso: 40%)
    const categoryScore = this.calculateCategoryScore(targetProduct, candidateProduct);
    score += categoryScore * 0.4;

    // 2. Similitud de precio (peso: 20%)
    const priceScore = this.calculatePriceScore(targetProduct, candidateProduct);
    score += priceScore * 0.2;

    // 3. Similitud de colores (peso: 15%)
    const colorScore = this.calculateColorScore(targetProduct, candidateProduct);
    score += colorScore * 0.15;

    // 4. Similitud de tallas (peso: 10%)
    const sizeScore = this.calculateSizeScore(targetProduct, candidateProduct);
    score += sizeScore * 0.1;

    // 5. Similitud de descripción/características (peso: 10%)
    const descriptionScore = this.calculateDescriptionScore(targetProduct, candidateProduct);
    score += descriptionScore * 0.1;

    // 6. Boost para productos destacados (peso: 5%)
    const featuredScore = candidateProduct.featured ? 1 : 0.5;
    score += featuredScore * 0.05;

    return Math.min(score, 1); // Normalizar a máximo 1
  }

  /**
   * Calcula similitud de categoría
   */
  private calculateCategoryScore(target: Product, candidate: Product): number {
    // Categoría exacta
    if (target.category.toLowerCase() === candidate.category.toLowerCase()) {
      return 1.0;
    }
    
    // Categorías relacionadas
    const relatedCategories = this.getRelatedCategories(target.category.toLowerCase());
    if (relatedCategories.includes(candidate.category.toLowerCase())) {
      return 0.7;
    }

    // Mismo link de categoría (misma sección)
    if (target.categoryLink === candidate.categoryLink) {
      return 0.5;
    }

    return 0.1;
  }

  /**
   * Define categorías relacionadas
   */
  private getRelatedCategories(category: string): string[] {
    const categoryMap: { [key: string]: string[] } = {
      'vestido': ['vestidos', 'faldas', 'blazers'],
      'vestidos': ['vestido', 'faldas', 'blazers'],
      'buzo': ['sudaderas', 'chaquetas', 'camisas'],
      'sudaderas': ['buzo', 'chaquetas', 'camisas'],
      'conjunto': ['vestidos', 'faldas', 'sudaderas'],
      'jeans': ['pantalones', 'shorts', 'leggings'],
      'pantalones': ['jeans', 'shorts', 'leggings'],
      'camisas': ['camisetas', 'sudaderas', 'blazers'],
      'shorts': ['pantalones', 'jeans', 'leggings'],
      'chaquetas': ['sudaderas', 'blazers', 'buzo'],
      'faldas': ['vestidos', 'vestido', 'leggings'],
      'blazers': ['chaquetas', 'camisas', 'vestidos'],
      'leggings': ['pantalones', 'shorts', 'faldas'],
      'bebe': ['ninos', 'pijamas'],
      'ninos': ['bebe', 'pijamas'],
      'pijamas': ['bebe', 'ninos']
    };

    return categoryMap[category] || [];
  }

  /**
   * Calcula similitud de precio
   */
  private calculatePriceScore(target: Product, candidate: Product): number {
    const priceDiff = Math.abs(target.price - candidate.price);
    const maxPrice = Math.max(target.price, candidate.price);
    
    // Si la diferencia es menos del 50% del precio mayor, alta similitud
    if (priceDiff <= maxPrice * 0.5) {
      return 1 - (priceDiff / (maxPrice * 0.5));
    }
    
    return 0;
  }

  /**
   * Calcula similitud de colores
   */
  private calculateColorScore(target: Product, candidate: Product): number {
    const targetColors = target.colors.map(c => c.toLowerCase());
    const candidateColors = candidate.colors.map(c => c.toLowerCase());
    
    const commonColors = targetColors.filter(color => 
      candidateColors.some(candidateColor => 
        this.areColorsRelated(color, candidateColor)
      )
    );

    if (commonColors.length === 0) return 0;
    
    return commonColors.length / Math.max(targetColors.length, candidateColors.length);
  }

  /**
   * Determina si dos colores están relacionados
   */
  private areColorsRelated(color1: string, color2: string): boolean {
    if (color1 === color2) return true;

    const colorRelations: { [key: string]: string[] } = {
      'negro': ['gris', 'azul marino', 'azul'],
      'blanco': ['beige', 'celeste', 'gris'],
      'azul': ['azul marino', 'celeste', 'negro'],
      'gris': ['negro', 'blanco', 'beige'],
      'rojo': ['rosa', 'verde'],
      'verde': ['verde oscuro', 'azul', 'rojo'],
      'rosa': ['rojo', 'blanco', 'celeste'],
      'beige': ['blanco', 'gris'],
      'celeste': ['azul', 'blanco', 'rosa']
    };

    return colorRelations[color1]?.includes(color2) || colorRelations[color2]?.includes(color1) || false;
  }

  /**
   * Calcula similitud de tallas
   */
  private calculateSizeScore(target: Product, candidate: Product): number {
    const commonSizes = target.sizes.filter(size => candidate.sizes.includes(size));
    
    if (commonSizes.length === 0) return 0;
    
    return commonSizes.length / Math.max(target.sizes.length, candidate.sizes.length);
  }

  /**
   * Calcula similitud de descripción usando palabras clave
   */
  private calculateDescriptionScore(target: Product, candidate: Product): number {
    const targetWords = this.extractKeywords(target.description + ' ' + target.details.join(' '));
    const candidateWords = this.extractKeywords(candidate.description + ' ' + candidate.details.join(' '));
    
    const commonWords = targetWords.filter(word => candidateWords.includes(word));
    
    if (commonWords.length === 0) return 0;
    
    return commonWords.length / Math.max(targetWords.length, candidateWords.length);
  }

  /**
   * Extrae palabras clave relevantes de un texto
   */
  private extractKeywords(text: string): string[] {
    const stopWords = ['de', 'la', 'el', 'en', 'y', 'a', 'para', 'con', 'por', 'un', 'una', 'del', 'las', 'los'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter((word, index, array) => array.indexOf(word) === index); // Remover duplicados
  }

  /**
   * Obtiene recomendaciones para un producto dado
   */
  public getRecommendations(productId: number, limit: number = 3): Product[] {
    const targetProduct = this.products.find(p => p.id === productId);
    
    if (!targetProduct) {
      // Si no encontramos el producto, devolver productos destacados
      return this.products
        .filter(p => p.featured && p.inStock)
        .slice(0, limit);
    }

    // Calcular puntuaciones para todos los productos
    const scoredProducts: RecommendationScore[] = this.products
      .map(product => ({
        productId: product.id,
        score: this.calculateSimilarity(targetProduct, product),
        product
      }))
      .filter(item => item.score > 0) // Solo productos con puntuación mayor a 0
      .sort((a, b) => b.score - a.score); // Ordenar por puntuación descendente

    console.log('Recomendaciones para:', targetProduct.name);
    console.log('Top scores:', scoredProducts.slice(0, 5).map(s => ({
      name: s.product.name,
      score: s.score.toFixed(3)
    })));

    return scoredProducts.slice(0, limit).map(item => item.product);
  }

  /**
   * Obtiene recomendaciones mejoradas con diversidad
   */
  public getSmartRecommendations(productId: number, limit: number = 3): Product[] {
    const recommendations = this.getRecommendations(productId, limit * 2);
    
    // Aplicar diversidad para evitar recomendar productos muy similares entre sí
    const diverseRecommendations: Product[] = [];
    
    for (const product of recommendations) {
      if (diverseRecommendations.length >= limit) break;
      
      // Verificar que no sea demasiado similar a productos ya seleccionados
      const isTooSimilar = diverseRecommendations.some(selected => 
        this.calculateSimilarity(product, selected) > 0.8
      );
      
      if (!isTooSimilar) {
        diverseRecommendations.push(product);
      }
    }

    // Si no tenemos suficientes, completar con los restantes
    while (diverseRecommendations.length < limit && recommendations.length > diverseRecommendations.length) {
      const remaining = recommendations.find(p => !diverseRecommendations.includes(p));
      if (remaining) {
        diverseRecommendations.push(remaining);
      } else {
        break;
      }
    }

    return diverseRecommendations;
  }
}

// Instancia singleton del motor de recomendaciones
const recommendationEngine = new RecommendationEngine();

export { recommendationEngine };
