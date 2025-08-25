import { Product } from '../services/recommendationService';

const allProducts: Product[] = [
  {
    id: 1,
    name: 'Cuaderno de Notas A5',
    price: 4.99,
    images: ['https://thafd.bing.com/th/id/OIP.aZl9Pbxu5d7p9mZXJVJpFAHaHa?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Papelería',
    categoryLink: 'papeleria',
    description: 'Cuaderno de notas tamaño A5 con 100 hojas rayadas.',
    inStock: true,
    featured: true,
    details: [
      '100 hojas rayadas',
      'Tamaño compacto A5',
      'Portada flexible',
      'Ideal para oficina o escuela',
      'Espiral metálica resistente'
    ]
  },
  {
    id: 2,
    name: 'Bolígrafo Azul Premium',
    price: 1.49,
    images: ['https://thafd.bing.com/th/id/OIP.6q5wyjbqkyKQCGcalNjxegHaE8?w=271&h=181&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Escritura',
    categoryLink: 'escritura',
    description: 'Bolígrafo de tinta azul con punta fina y agarre ergonómico.',
    inStock: true,
    featured: false,
    details: [
      'Tinta azul de secado rápido',
      'Punta fina de 0.7 mm',
      'Diseño ergonómico',
      'Cuerpo plástico transparente',
      'Duración prolongada'
    ]
  },
  {
    id: 3,
    name: 'Resaltadores Fluorescentes (Pack de 5)',
    price: 6.99,
    images: ['https://productoseterna.vtexassets.com/arquivos/ids/156806/resaltadores-eterna-et758_2.jpg?v=638399814336130000'],
    category: 'Escritura',
    categoryLink: 'escritura',
    description: 'Set de 5 resaltadores fluorescentes en colores variados.',
    inStock: true,
    featured: true,
    details: [
      'Colores: amarillo, rosa, verde, naranja, azul',
      'Tinta de secado rápido',
      'Punta biselada',
      'No mancha',
      'Diseño compacto'
    ]
  },
  {
    id: 4,
    name: 'Carpeta A4 con Anillos',
    price: 3.99,
    images: ['https://tse2.mm.bing.net/th/id/OIP.BQhRhY-L8qgBzvVmweXJnQHaF7?rs=1&pid=ImgDetMain&o=7&rm=3', 'https://tse1.mm.bing.net/th/id/OIP.Hi-KExRQ6up9zqQTn0rAhwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3'],
    category: 'Organización',
    categoryLink: 'organizacion',
    description: 'Carpeta tamaño A4 con mecanismo de 2 anillos metálicos.',
    inStock: true,
    featured: false,
    details: [
      'Formato A4 estándar',
      'Anillos metálicos resistentes',
      'Cubierta plástica',
      'Fácil de archivar documentos',
      'Disponible en varios colores'
    ]
  },
  {
    id: 5,
    name: 'Caja de Clips Metálicos (100 unidades)',
    price: 2.49,
    images: ['https://productoseterna.vtexassets.com/arquivos/ids/156717/clips-de-plateados-eterna-et809_3.jpg?v=638399813392030000'],
    category: 'Accesorios',
    categoryLink: 'accesorios',
    description: 'Caja con 100 clips metálicos para oficina.',
    inStock: true,
    featured: false,
    details: [
      'Clips metálicos estándar',
      'No oxidan fácilmente',
      'Caja plástica resistente',
      'Fáciles de usar',
      'Duraderos'
    ]
  },
  {
    id: 6,
    name: 'Papel Bond A4 (500 hojas)',
    price: 8.99,
    images: ['https://mercury.vtexassets.com/arquivos/ids/1071904/shopStar-0.jpg?v=637164436149530000'],
    category: 'Papelería',
    categoryLink: 'papeleria',
    description: 'Paquete de 500 hojas tamaño A4 papel bond 75g.',
    inStock: true,
    featured: true,
    details: [
      '500 hojas',
      'Gramaje 75g',
      'Formato A4',
      'Blanco brillante',
      'Ideal para impresión y escritura'
    ]
  },
  {
    id: 7,
    name: 'Cinta Adhesiva Transparente (Pack 3)',
    price: 3.50,
    images: ['https://th.bing.com/th/id/R.aa6509651249afb8afd8837e53db622b?rik=OP%2f%2fDT5axfTW0g&pid=ImgRaw&r=0'],
    category: 'Accesorios',
    categoryLink: 'accesorios',
    description: 'Pack de 3 rollos de cinta adhesiva transparente.',
    inStock: true,
    featured: false,
    details: [
      'Transparente y resistente',
      'Cada rollo de 40m',
      'Ideal para oficina y hogar',
      'Fácil de cortar',
      'Adhesión fuerte'
    ]
  },
  {
    id: 8,
    name: 'Engrapadora Metálica',
    price: 7.99,
    images: ['https://thafd.bing.com/th/id/OIP.r6aoedbYcesWOz3OR4OrnwHaEU?w=325&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Accesorios',
    categoryLink: 'accesorios',
    description: 'Engrapadora metálica de tamaño estándar para oficina.',
    inStock: true,
    featured: true,
    details: [
      'Capacidad 20 hojas',
      'Incluye 500 grapas',
      'Diseño ergonómico',
      'Resistente y duradera',
      'Base antideslizante'
    ]
  },
  {
    id: 9,
    name: 'Marcadores Permanentes (Pack 4)',
    price: 5.99,
    images: ['https://images.unsplash.com/photo-1616627989396-c34c56a8c5b4?w=400&h=400&fit=crop&q=80'],
    category: 'Escritura',
    categoryLink: 'escritura',
    description: 'Set de 4 marcadores permanentes de colores básicos.',
    inStock: true,
    featured: false,
    details: [
      'Colores: negro, azul, rojo, verde',
      'Punta fina',
      'Tinta indeleble',
      'Secado rápido',
      'Duración prolongada'
    ]
  },
  {
    id: 10,
    name: 'Portaminas 0.7mm',
    price: 2.49,
    images: ['https://thafd.bing.com/th/id/OIP.yEx2yNJQSUJ_jKuUlEQ59AHaHa?w=206&h=206&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Escritura',
    categoryLink: 'escritura',
    description: 'Portaminas 0.7mm con goma de borrar integrada.',
    inStock: true,
    featured: false,
    details: [
      'Mina de 0.7mm HB',
      'Diseño ergonómico',
      'Incluye goma',
      'Recargable',
      'Escritura suave'
    ]
  },
  {
    id: 11,
    name: 'Perforadora de 2 Huecos',
    price: 6.49,
    images: ['https://tse3.mm.bing.net/th/id/OIP.bcx6e3XLq2AkHbaCo64wBgHaF4?rs=1&pid=ImgDetMain&o=7&rm=3'],
    category: 'Accesorios',
    categoryLink: 'accesorios',
    description: 'Perforadora de metal de 2 huecos estándar.',
    inStock: true,
    featured: false,
    details: [
      'Capacidad 30 hojas',
      'Mecanismo resistente',
      'Base con depósito',
      'Diseño compacto',
      'Antideslizante'
    ]
  },
  {
    id: 12,
    name: 'Archivador de Cartón Oficio',
    price: 2.99,
    images: ['https://thafd.bing.com/th/id/OIP.gewGOHkUqM9-frPG-HocIwHaG1?w=223&h=206&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Organización',
    categoryLink: 'organizacion',
    description: 'Archivador tamaño oficio de cartón reforzado.',
    inStock: true,
    featured: false,
    details: [
      'Tamaño oficio',
      'Cartón reforzado',
      'Diseño clásico',
      'Colores variados',
      'Duradero'
    ]
  },
  {
    id: 13,
    name: 'Notas Adhesivas (Pack 6)',
    price: 3.20,
    images: ['https://tse4.mm.bing.net/th/id/OIP.8QKdf7VeCDV4OQgirY59sgHaG-?rs=1&pid=ImgDetMain&o=7&rm=3'],
    category: 'Papelería',
    categoryLink: 'papeleria',
    description: 'Pack de 6 bloques de notas adhesivas en colores neón.',
    inStock: true,
    featured: true,
    details: [
      'Colores: amarillo, verde, rosa, azul',
      'Cada bloque de 100 hojas',
      'Tamaño 76x76 mm',
      'Adhesivo removible',
      'Fáciles de despegar'
    ]
  },
  {
    id: 14,
    name: 'Cinta Correctora',
    price: 1.80,
    images: ['https://thafd.bing.com/th/id/OIP.dYltzz8bNEcrjaPvGojUOQHaF7?w=246&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Papelería',
    categoryLink: 'papeleria',
    description: 'Cinta correctora blanca de aplicación en seco.',
    inStock: true,
    featured: false,
    details: [
      'Aplicación instantánea',
      'No requiere secado',
      'Línea precisa',
      'Diseño ergonómico',
      'Tamaño compacto'
    ]
  },
  {
    id: 15,
    name: 'Tijeras de Oficina 8"',
    price: 2.70,
    images: ['https://thafd.bing.com/th/id/OIP.lmKD76COjI_s4yyZo0SkjgHaHa?w=212&h=212&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Accesorios',
    categoryLink: 'accesorios',
    description: 'Tijeras de oficina de 8 pulgadas con filo inoxidable.',
    inStock: true,
    featured: false,
    details: [
      'Acero inoxidable',
      'Mangos ergonómicos',
      'Tamaño 8 pulgadas',
      'Corte preciso',
      'Duraderas'
    ]
  },
  {
    id: 16,
    name: 'Organizador de Escritorio',
    price: 9.99,
    images: ['https://tse3.mm.bing.net/th/id/OIP.hCdeBewuUgkhBZtaQrBJGwHaGl?rs=1&pid=ImgDetMain&o=7&rm=3'],
    category: 'Organización',
    categoryLink: 'organizacion',
    description: 'Organizador de escritorio multifuncional con compartimentos.',
    inStock: true,
    featured: true,
    details: [
      'Compartimentos múltiples',
      'Material plástico resistente',
      'Diseño moderno',
      'Fácil de limpiar',
      'Mantiene el orden'
    ]
  },
  {
    id: 17,
    name: 'Regla de 30 cm',
    price: 0.99,
    images: ['https://thafd.bing.com/th/id/OIP.tc-2mYrrJo3cGnq7zbXBtQHaHa?w=209&h=209&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Papelería',
    categoryLink: 'papeleria',
    description: 'Regla transparente de 30 cm con medidas en cm y mm.',
    inStock: true,
    featured: false,
    details: [
      'Medidas en cm y mm',
      'Plástico transparente',
      'Alta resistencia',
      'Precisión de medida',
      'Ideal para escuela y oficina'
    ]
  },
  {
    id: 18,
    name: 'Borradores de Goma (Pack 3)',
    price: 1.50,
    images: ['https://thafd.bing.com/th/id/OIP.HusgsaxwhIhPc1tkIf6BpQHaHa?w=191&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Papelería',
    categoryLink: 'papeleria',
    description: 'Pack de 3 borradores blancos de alta calidad.',
    inStock: true,
    featured: false,
    details: [
      'No mancha el papel',
      'Borrado limpio',
      'Tamaño práctico',
      'Duraderos',
      'Material no tóxico'
    ]
  },
  {
    id: 19,
    name: 'Rotuladores para Pizarra (Pack 4)',
    price: 5.49,
    images: ['https://thafd.bing.com/th/id/OIP.fgBZNZqTkzM3fjvWcwZbdwHaHa?w=199&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Escritura',
    categoryLink: 'escritura',
    description: 'Set de 4 rotuladores de pizarra de colores básicos.',
    inStock: true,
    featured: true,
    details: [
      'Colores: negro, azul, rojo, verde',
      'Borrado en seco',
      'Punta redonda',
      'Tinta de larga duración',
      'No tóxicos'
    ]
  },
  {
    id: 20,
    name: 'Caja Organizadora con Divisiones',
    price: 12.99,
    images: ['https://thafd.bing.com/th/id/OIP.8536A-nYf14Mzup1F0sNVAHaHa?w=185&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'],
    category: 'Organización',
    categoryLink: 'organizacion',
    description: 'Caja de plástico con divisiones para almacenar artículos pequeños.',
    inStock: true,
    featured: false,
    details: [
      'Plástico transparente resistente',
      'Tapa segura',
      'Compartimentos ajustables',
      'Fácil de apilar',
      'Ideal para oficina o manualidades'
    ]
  }
];

export default allProducts;
