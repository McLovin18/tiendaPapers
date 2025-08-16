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
    images: ['https://th.bing.com/th/id/OIP.PwvstlzdTfleVz8L2r9wqAHaHa?w=200&h=200&c=10&o=6&pid=genserp&rm=2'],
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
    images: ['https://th.bing.com/th/id/OIP.efnTgSdnxWv7OUBve50q1wHaJr?w=126&h=184&c=7&r=0&o=5&dpr=1.9&pid=1.7'],
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
    images: ['data:image/webp;base64,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'],
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
    images: ['data:image/webp;base64,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'],
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
    images: ['https://th.bing.com/th/id/OIP.uVoDmKUx83nzKhz0KKmImQHaIp?w=173&h=202&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
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
    images: ['https://th.bing.com/th/id/OIP.pleCE1GSr8U6OChB7UeMMwHaHa?w=201&h=202&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
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
