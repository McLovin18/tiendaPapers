import { Product } from '../services/recommendationService';

const allProducts: Product[] = [
  {
    id: 1,
    name: 'Base de Maquillaje Full Coverage',
    price: 32.99,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80'],
    category: 'Base de Maquillaje',
    categoryLink: '/maquillaje',
    description: 'Base de maquillaje de cobertura completa con acabado natural.',
    inStock: true,
    featured: true,
    details: [
      'Cobertura completa de larga duración',
      'SPF 15 para protección diaria',
      'Disponible en 20 tonos',
      'Fórmula libre de aceites',
      'Acabado natural mate'
    ]
  },
  {
    id: 2,
    name: 'Paleta de Sombras Nude',
    price: 45.99,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80'],
    category: 'Sombras de Ojos',
    categoryLink: '/maquillaje',
    description: 'Paleta de 12 sombras en tonos nude perfectos para cualquier ocasión.',
    inStock: true,
    featured: true,
    details: [
      '12 tonos versátiles nude',
      'Fórmula altamente pigmentada',
      'Acabados mate y shimmer',
      'Larga duración sin transfer',
      'Incluye espejo y aplicadores'
    ]
  },
  {
    id: 3,
    name: 'Labial Matte Liquid',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop&q=80'],
    category: 'Labiales',
    categoryLink: '/maquillaje',
    description: 'Labial líquido mate de larga duración con color intenso.',
    inStock: true,
    details: [
      'Acabado mate sedoso',
      'Duración hasta 8 horas',
      'No se transfiere',
      'Aplicador de precisión',
      'Disponible en 15 colores'
    ]
  },
  {
    id: 4,
    name: 'Serum Facial Ácido Hialurónico',
    price: 28.99,
    images: ['https://images.unsplash.com/photo-1556228653-e32817cd38c0?w=400&h=400&fit=crop&q=80'],
    category: 'Serums',
    categoryLink: '/cuidado-piel',
    description: 'Serum hidratante con ácido hialurónico puro para todo tipo de piel.',
    inStock: true,
    featured: true,
    details: [
      'Ácido hialurónico de múltiples pesos moleculares',
      'Hidratación profunda inmediata',
      'Reduce líneas finas',
      'Textura ligera de rápida absorción',
      'Frasco con gotero de 30ml'
    ]
  },
  {
    id: 5,
    name: 'Crema Hidratante Día',
    price: 35.99,
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&q=80'],
    category: 'Cremas Hidratantes',
    categoryLink: '/cuidado-piel',
    description: 'Crema hidratante de día con SPF 30 y antioxidantes.',
    inStock: true,
    details: [
      'SPF 30 protección UV',
      'Vitamina C y E antioxidantes',
      'Textura ligera no grasa',
      'Hidratación 24 horas',
      'Base perfecta para maquillaje'
    ]
  },
  {
    id: 6,
    name: 'Perfume Floral Elegance',
    price: 65.99,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop&q=80'],
    category: 'Fragancias',
    categoryLink: '/fragancias',
    description: 'Perfume femenino con notas florales de jazmín, rosa y peonía.',
    inStock: true,
    featured: true,
    details: [
      'Notas de salida: Bergamota y limón',
      'Notas de corazón: Jazmín, rosa y peonía',
      'Notas de fondo: Almizcle y madera de cedro',
      'Duración: 8-10 horas',
      'Frasco de 50ml'
    ]
  },
  {
    id: 7,
    name: 'Máscara de Pestañas Volumen Extremo',
    price: 22.99,
    images: ['https://images.unsplash.com/photo-1631214540242-34e43735f089?w=400&h=400&fit=crop&q=80'],
    category: 'Máscaras de Pestañas',
    categoryLink: '/maquillaje',
    description: 'Máscara de pestañas que proporciona volumen extremo y alargamiento.',
    inStock: true,
    details: [
      'Fórmula resistente al agua',
      'Cepillo de fibras especiales',
      'No se corre ni se desmorona',
      'Volumen y longitud instantáneos',
      'Fácil de remover'
    ]
  },
  {
    id: 8,
    name: 'Exfoliante Facial Enzimático',
    price: 28.99,
    images: ['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop&q=80'],
    category: 'Limpieza Facial',
    categoryLink: '/cuidado-piel',
    description: 'Exfoliante facial suave con enzimas naturales para renovar la piel.',
    inStock: true,
    details: [
      'Enzimas de papaya y piña',
      'Microesferas biodegradables',
      'Renovación celular suave',
      'Elimina células muertas',
      'Apto para piel sensible'
    ]
  },
  {
    id: 9,
    name: 'Paleta de Contorno y Rubor',
    price: 35.99,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80'],
    category: 'Contorno',
    categoryLink: '/maquillaje',
    description: 'Paleta completa con tonos de contorno, iluminador y rubor.',
    inStock: true,
    details: [
      '6 tonos de contorno',
      '3 tonos de iluminador',
      '3 tonos de rubor',
      'Fórmula cremosa y difuminable',
      'Incluye brochas profesionales'
    ]
  },
  {
    id: 10,
    name: 'Aceite Corporal Nutritivo',
    price: 31.99,
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop&q=80'],
    category: 'Cuidado Corporal',
    categoryLink: '/cuidado-piel',
    description: 'Aceite corporal con mezcla de aceites naturales para nutrición profunda.',
    inStock: true,
    details: [
      'Aceite de argán y jojoba',
      'Vitamina E y omega 3',
      'Absorción rápida sin grasa',
      'Aroma relajante de lavanda',
      'Botella de 100ml'
    ]
  },
  {
    id: 11,
    name: 'Brochas de Maquillaje Premium',
    price: 45.99,
    images: ['https://images.unsplash.com/photo-1583241800698-9cb5be6c7cfc?w=400&h=400&fit=crop&q=80'],
    category: 'Brochas',
    categoryLink: '/accesorios',
    description: 'Set de brochas profesionales para maquillaje con fibras sintéticas suaves.',
    inStock: true,
    featured: true,
    details: [
      '12 brochas profesionales',
      'Fibras sintéticas de alta calidad',
      'Mango ergonómico de madera',
      'Incluye estuche de viaje',
      'Libres de crueldad animal'
    ]
  },
  {
    id: 12,
    name: 'Crema Hidratante Nocturna',
    price: 39.99,
    images: ['https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&h=400&fit=crop&q=80'],
    category: 'Cremas Hidratantes',
    categoryLink: '/cuidado-piel',
    description: 'Crema nutritiva nocturna con retinol y ácido hialurónico.',
    inStock: true,
    details: [
      'Retinol encapsulado',
      'Ácido hialurónico de bajo peso',
      'Regeneración nocturna',
      'Reduce líneas de expresión',
      'Textura rica y sedosa'
    ]
  },
  {
    id: 13,
    name: 'Lápiz Delineador Waterproof',
    price: 16.99,
    images: ['https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=400&h=400&fit=crop&q=80'],
    category: 'Delineadores',
    categoryLink: '/maquillaje',
    description: 'Lápiz delineador de ojos resistente al agua con aplicación suave.',
    inStock: true,
    details: [
      'Fórmula waterproof',
      'Trazo intenso y preciso',
      'Duración de 12 horas',
      'No se corre ni mancha',
      'Fácil aplicación'
    ]
  },
  {
    id: 14,
    name: 'Perfume Masculino Woody',
    price: 72.99,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&h=400&fit=crop&q=80'],
    category: 'Fragancias',
    categoryLink: '/fragancias',
    description: 'Perfume masculino con notas amaderadas y especiadas.',
    inStock: true,
    details: [
      'Notas de salida: Pimienta negra y bergamota',
      'Notas de corazón: Sándalo y vetiver',
      'Notas de fondo: Ámbar y vainilla',
      'Duración: 10-12 horas',
      'Frasco de 100ml'
    ]
  },
  {
    id: 15,
    name: 'Tónico Facial Purificante',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&q=80'],
    category: 'Tónicos',
    categoryLink: '/cuidado-piel',
    description: 'Tónico facial con ácido salicílico para pieles mixtas y grasas.',
    inStock: true,
    details: [
      'Ácido salicílico 2%',
      'Extracto de hamamelis',
      'Minimiza poros',
      'Controla el exceso de grasa',
      'Botella de 200ml'
    ]
  },
  {
    id: 16,
    name: 'Protector Solar Facial SPF 50',
    price: 25.99,
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&h=400&fit=crop&q=80'],
    category: 'Protección Solar',
    categoryLink: '/cuidado-piel',
    description: 'Protector solar facial de amplio espectro con textura ligera.',
    inStock: true,
    details: [
      'SPF 50+ protección UVA/UVB',
      'Textura ligera no grasa',
      'Base perfecta para maquillaje',
      'Resistente al agua',
      'Antioxidantes naturales'
    ]
  },
  {
    id: 17,
    name: 'Esmalte de Uñas Gel',
    price: 14.99,
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop&q=80'],
    category: 'Cuidado de Uñas',
    categoryLink: '/accesorios',
    description: 'Esmalte de uñas con efecto gel de larga duración.',
    inStock: true,
    details: [
      'Efecto gel sin lámpara UV',
      'Duración hasta 10 días',
      'Brillo intenso',
      'Secado rápido',
      'Disponible en 20 colores'
    ]
  },
  {
    id: 18,
    name: 'Mascarilla Facial Hidratante',
    price: 23.99,
    images: ['https://images.unsplash.com/photo-1570554886111-e80fcac6c37b?w=400&h=400&fit=crop&q=80'],
    category: 'Mascarillas Faciales',
    categoryLink: '/cuidado-piel',
    description: 'Mascarilla hidratante con ácido hialurónico y aloe vera.',
    inStock: true,
    details: [
      'Ácido hialurónico concentrado',
      'Aloe vera calmante',
      'Hidratación profunda',
      'Para todo tipo de piel',
      'Uso 2-3 veces por semana'
    ]
  },
  {
    id: 19,
    name: 'Agua Micelar Desmaquillante',
    price: 18.99,
    images: ['https://images.unsplash.com/photo-1556228994-f6d5ac421b72?w=400&h=400&fit=crop&q=80'],
    category: 'Limpieza Facial',
    categoryLink: '/cuidado-piel',
    description: 'Agua micelar suave que remueve el maquillaje sin frotar.',
    inStock: true,
    details: [
      'Tecnología micelar avanzada',
      'Remueve maquillaje waterproof',
      'No requiere enjuague',
      'Para ojos y rostro',
      'Botella de 400ml'
    ]
  },
  {
    id: 20,
    name: 'Perfume Femenino Frutal',
    price: 58.99,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop&q=80'],
    category: 'Fragancias',
    categoryLink: '/fragancias',
    description: 'Perfume femenino con notas frutales frescas y juveniles.',
    inStock: true,
    details: [
      'Notas de salida: Manzana verde y cítricos',
      'Notas de corazón: Pera y flor de cerezo',
      'Notas de fondo: Almizcle blanco',
      'Duración: 6-8 horas',
      'Frasco de 75ml'
    ]
  },
  {
    id: 21,
    name: 'Brillo Labial Hidratante',
    price: 19.99,
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop&q=80'],
    category: 'Labiales',
    categoryLink: '/maquillaje',
    description: 'Brillo labial con ácido hialurónico y vitamina E.',
    inStock: true,
    details: [
      'Ácido hialurónico hidratante',
      'Vitamina E nutritiva',
      'Acabado brilloso natural',
      'No pegajoso',
      'Disponible en 8 tonos'
    ]
  },
  {
    id: 22,
    name: 'Corrector de Ojeras',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80'],
    category: 'Correctores',
    categoryLink: '/maquillaje',
    description: 'Corrector de alta cobertura para ojeras y imperfecciones.',
    inStock: true,
    details: [
      'Cobertura completa',
      'Fórmula cremosa',
      'Larga duración 12 horas',
      'Con cafeína anti-ojeras',
      'Disponible en 10 tonos'
    ]
  },
  {
    id: 23,
    name: 'Serum Facial Vitamina C',
    price: 34.99,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&q=80'],
    category: 'Serums',
    categoryLink: '/cuidado-piel',
    description: 'Serum facial con vitamina C pura al 20% y ácido hialurónico.',
    inStock: true,
    featured: true,
    details: [
      'Vitamina C pura al 20%',
      'Ácido hialurónico',
      'Antioxidante potente',
      'Ilumina y unifica el tono',
      'Frasco con gotero de 30ml'
    ]
  },
  {
    id: 24,
    name: 'Esponja Maquillaje Premium',
    price: 12.99,
    images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&q=80'],
    category: 'Esponjas',
    categoryLink: '/accesorios',
    description: 'Esponja de maquillaje profesional para aplicación perfecta.',
    inStock: true,
    details: [
      'Material hipoalergénico',
      'Forma ergonómica',
      'Aplicación uniforme',
      'Fácil de limpiar',
      'Pack de 2 unidades'
    ]
  },
  {
    id: 25,
    name: 'Polvo Compacto Matificante',
    price: 24.99,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop&q=80'],
    category: 'Polvos',
    categoryLink: '/maquillaje',
    description: 'Polvo compacto matificante para sellar el maquillaje.',
    inStock: true,
    details: [
      'Control de brillo 8 horas',
      'Cobertura natural',
      'Incluye espejo y esponja',
      'Fórmula libre de talco',
      'Disponible en 6 tonos'
    ]
  },
  {
    id: 26,
    name: 'Set de Pestañas Postizas',
    price: 15.99,
    images: ['https://images.unsplash.com/photo-1631214540242-34e43735f089?w=400&h=400&fit=crop&q=80'],
    category: 'Pestañas',
    categoryLink: '/accesorios',
    description: 'Set de pestañas postizas reutilizables con pegamento incluido.',
    inStock: true,
    details: [
      '5 pares de pestañas diferentes',
      'Fibras sintéticas suaves',
      'Pegamento hipoalergénico',
      'Reutilizables hasta 10 veces',
      'Fácil aplicación'
    ]
  },
  {
    id: 27,
    name: 'Tónico Facial Equilibrante',
    price: 26.99,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop&q=80'],
    category: 'Tónicos',
    categoryLink: '/cuidado-piel',
    description: 'Tónico facial con niacinamida para equilibrar el pH de la piel.',
    inStock: true,
    details: [
      'Niacinamida al 5%',
      'Equilibra el pH natural',
      'Minimiza poros',
      'Sin alcohol ni parabenos',
      'Apto para piel sensible'
    ]
  },
  {
    id: 28,
    name: 'Crema de Manos Reparadora',
    price: 13.99,
    images: ['https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop&q=80'],
    category: 'Cuidado de Manos',
    categoryLink: '/cuidado-piel',
    description: 'Crema de manos intensiva con keratina y urea.',
    inStock: true,
    details: [
      'Keratina reparadora',
      'Urea hidratante 10%',
      'Absorción rápida',
      'Protección 24 horas',
      'Tubo de 75ml'
    ]
  },
  {
    id: 29,
    name: 'Gel Limpiador Facial Suave',
    price: 22.99,
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop&q=80'],
    category: 'Limpieza Facial',
    categoryLink: '/cuidado-piel',
    description: 'Gel limpiador facial suave para uso diario.',
    inStock: true,
    details: [
      'pH balanceado',
      'Sin sulfatos agresivos',
      'Extracto de aloe vera',
      'Para todo tipo de piel',
      'Botella de 200ml'
    ]
  },
  {
    id: 30,
    name: 'Perfume Unisex Citrus',
    price: 48.99,
    images: ['https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&h=400&fit=crop&q=80'],
    category: 'Fragancias',
    categoryLink: '/fragancias',
    description: 'Fragancia unisex con notas cítricas frescas.',
    inStock: true,
    details: [
      'Notas de bergamota y pomelo',
      'Corazón de jengibre',
      'Base de cedro blanco',
      'Duración: 6-8 horas',
      'Frasco de 75ml'
    ]
  }
];

export default allProducts;
