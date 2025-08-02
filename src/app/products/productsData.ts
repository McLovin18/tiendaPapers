// src/app/products/productsData.ts

const allProducts = [
  {
    id: 1,
    name: 'Vestido Suplex',
    price: 1.00,
    images: ['/vestidos/vestidoSuplex.png', '/vestidos/colores1.png'],
    category: 'Vestido',
    categoryLink: '/mujer',
    description: 'Vestido elegante y cómodo para cualquier ocasión.',
    inStock: true,
    sizes: ['M'],
    colors: ['Blanco', 'Azul', 'Negro', 'Rojo', 'Verde', 'piel', 'plomo'],
    details: [
      'Tejido 100% algodón',
      'Corte regular',
      'Cuello clásico',
      'Lavable a máquina'
    ],
    featured: true
  },
  {
    id: 2,
    name: 'Buzo Angora',
    price: 8.00,
    images: ['/buzos/buzo1.png', '/buzos/colorB1.png'],
    category: 'Buzo',
    categoryLink: '/mujer',
    description: 'Buzo de algodón suave y cómodo para cualquier ocasión.',
    inStock: true,
    sizes: ['M'],
    colors: ['Plomo', 'Rojo', 'Plata', 'Celeste', 'Azul', 'Cafe', 'Amarillo', 'Gris', 'Rosado', 'Rojo conchevino'],
    details: [
      'Tejido 100% algodón',
      'Corte regular',
      'Cuello clásico',
      'Lavable a máquina'
    ],
    featured: true
  },
  {
    id: 3,
    name: 'Vestido Floral',
    price: 9.99,
    images: ['/vestidos/vestido2.png', '/vestidos/colorV2.png'],
    category: 'Vestido',
    categoryLink: '/mujer',
    description: 'Vestido con estampado gráfico moderno y tejido suave.',
    inStock: true,
    sizes: ['S', 'M'],
    colors: ['Blanco', 'Gris', 'Negro'],
    details: [
      'Tejido 100% algodón',
      'Corte regular',
      'Cuello clásico',
      'Lavable a máquina'
    ],
    featured: true
  },
  {
    id: 4,
    name: 'Vestido 3',
    price: 12.00,
    images: ['/vestidos/vestido3.png'],
    category: 'vestido',
    categoryLink: '/mujer',
    description: 'Vestido de algodón suave y cómodo para cualquier ocasión.',
    inStock: true,
    sizes: ['S', 'M'],
    colors: ['Beige', 'Verde oscuro', 'blanco', 'negro', 'rojo', 'verde claro', 'morado', 'rosado', 'plateado'],
    details: [
      'Tejido 100% algodón',
      'Corte regular',
      'Cintura media',
      'Cierre con botón y cremallera',
      'Bolsillos laterales y traseros',
      'Lavable a máquina'
    ],
    featured: true
  },
  {
    id: 5,
    name: 'Conjunto corto Addle',
    price: 10.00,
    images: ['/conjuntos/conjunto1.png', '/conjuntos/co1.png'],
    category: 'conjunto',
    categoryLink: '/mujer',
    description: 'CONJUNTO CORTO ADLEE TL CALIDAD PIEL DE DURAZNO.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Celeste', 'Negro'],
    details: [
      'tela suave',
      'Buena calidad',


    ],
    featured: true
  },
  {
    id: 6,
    name: 'Jeans Regular',
    price: 44.99,
    images: ['/images/product2.svg'],
    category: 'jeans',
    categoryLink: '/hombre',
    description: 'Jeans de corte regular con gran durabilidad y comodidad.',
    inStock: true,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Azul', 'Negro'],
    details: [
      'Tejido 100% algodón',
      'Corte regular',
      'Cintura media',
      'Cierre con botón y cremallera',
      'Lavable a máquina'
    ]
  },
  {
    id: 7,
    name: 'Camiseta Básica',
    price: 14.99,
    images: ['/images/product3.svg'],
    category: 'camisas',
    categoryLink: '/hombre',
    description: 'Camiseta básica de algodón disponible en varios colores.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Negro', 'Azul', 'Rojo'],
    details: [
      'Tejido 100% algodón',
      'Corte regular',
      'Cuello redondo',
      'Lavable a máquina'
    ]
  },
  {
    id: 8,
    name: 'Pantalón Deportivo',
    price: 29.99,
    images: ['/images/product4.svg'],
    category: 'pantalones',
    categoryLink: '/hombre',
    description: 'Pantalón deportivo cómodo y ligero para actividades físicas.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris', 'Negro', 'Azul'],
    details: [
      'Tejido sintético transpirable',
      'Cintura elástica',
      'Bolsillos laterales',
      'Lavable a máquina'
    ]
  },
  // Nuevos productos
  {
    id: 9,
    name: 'Vestido Floral',
    price: 59.99,
    images: ['/images/product1.svg'],
    category: 'vestidos',
    categoryLink: '/mujer',
    description: 'Vestido con estampado floral y diseño elegante para ocasiones especiales.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Rosa', 'Verde', 'Azul'],
    details: [
      'Tejido 100% poliéster',
      'Corte regular',
      'Largo midi',
      'Cierre con cremallera trasera',
      'Lavado en seco recomendado'
    ]
  },
  {
    id: 10,
    name: 'Sudadera Oversize',
    price: 34.99,
    images: ['/images/product2.svg'],
    category: 'sudaderas',
    categoryLink: '/mujer',
    description: 'Sudadera oversize de algodón suave, ideal para looks casuales.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris', 'Negro', 'Beige'],
    details: [
      'Tejido 80% algodón, 20% poliéster',
      'Corte oversize',
      'Capucha ajustable',
      'Bolsillo canguro',
      'Lavable a máquina'
    ]
  },
  {
    id: 11,
    name: 'Falda Plisada',
    price: 24.99,
    images: ['/images/product3.svg'],
    category: 'faldas',
    categoryLink: '/mujer',
    description: 'Falda plisada midi, perfecta para primavera y verano.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Rosa', 'Negro', 'Azul Marino'],
    details: [
      'Tejido 100% poliéster',
      'Cintura elástica',
      'Corte midi',
      'Plisado permanente',
      'Lavable a máquina'
    ]
  },
  {
    id: 12,
    name: 'Blazer Clásico',
    price: 69.99,
    images: ['/images/product4.svg'],
    category: 'blazers',
    categoryLink: '/mujer',
    description: 'Blazer clásico entallado, ideal para oficina o eventos formales.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Azul Marino', 'Beige'],
    details: [
      'Tejido mezcla de poliéster y viscosa',
      'Corte entallado',
      'Solapa clásica',
      'Cierre con botón',
      'Bolsillos frontales'
    ]
  },
  {
    id: 13,
    name: 'Short Deportivo',
    price: 19.99,
    images: ['/images/product1.svg'],
    category: 'shorts',
    categoryLink: '/sport',
    description: 'Short deportivo transpirable para entrenamiento y running.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Azul', 'Verde'],
    details: [
      'Tejido sintético ligero',
      'Cintura elástica',
      'Secado rápido',
      'Bolsillos laterales'
    ]
  },
  {
    id: 14,
    name: 'Chaqueta Rompevientos',
    price: 54.99,
    images: ['/images/product2.svg'],
    category: 'chaquetas',
    categoryLink: '/sport',
    description: 'Chaqueta rompevientos ligera y resistente al agua.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Rojo', 'Azul'],
    details: [
      'Tejido sintético resistente al agua',
      'Cierre con cremallera',
      'Capucha ajustable',
      'Bolsillos laterales',
      'Ligera y compacta'
    ]
  },
  {
    id: 15,
    name: 'Body para Bebé',
    price: 12.99,
    images: ['/images/product3.svg'],
    category: 'bebe',
    categoryLink: '/bebe',
    description: 'Body de algodón suave para bebé, fácil de poner y quitar.',
    inStock: true,
    sizes: ['0-3M', '3-6M', '6-9M', '9-12M'],
    colors: ['Blanco', 'Celeste', 'Rosa'],
    details: [
      'Tejido 100% algodón',
      'Cierres a presión',
      'Cuello americano',
      'Lavable a máquina'
    ]
  },
  {
    id: 16,
    name: 'Conjunto Infantil',
    price: 29.99,
    images: ['/images/product4.svg'],
    category: 'ninos',
    categoryLink: '/ninos',
    description: 'Conjunto de camiseta y pantalón corto para niños.',
    inStock: true,
    sizes: ['2', '4', '6', '8', '10'],
    colors: ['Azul', 'Rojo', 'Verde'],
    details: [
      'Camiseta 100% algodón',
      'Pantalón corto de felpa',
      'Diseño divertido',
      'Lavable a máquina'
    ]
  },
  {
    id: 17,
    name: 'Pijama de Algodón',
    price: 22.99,
    images: ['/images/product1.svg'],
    category: 'pijamas',
    categoryLink: '/ninos',
    description: 'Pijama de algodón transpirable para noches cómodas.',
    inStock: true,
    sizes: ['2', '4', '6', '8', '10'],
    colors: ['Azul', 'Gris', 'Rosa'],
    details: [
      'Tejido 100% algodón',
      'Cintura elástica',
      'Diseño infantil',
      'Lavable a máquina'
    ]
  },
  {
    id: 18,
    name: 'Leggings Deportivos',
    price: 27.99,
    images: ['/images/product2.svg'],
    category: 'leggings',
    categoryLink: '/sport',
    description: 'Leggings deportivos elásticos y de secado rápido.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul'],
    details: [
      'Tejido elástico de alto rendimiento',
      'Cintura alta',
      'Secado rápido',
      'Costuras planas antirozaduras'
    ]
  },
];

export default allProducts; 