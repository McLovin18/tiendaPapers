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
    colors: ['Blanco', 'Azul'],
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
    colors: ['Plomo', 'Rojo'],
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
    colors: ['Beige', 'Verde oscuro', 'blanco'],
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
    sizes: ['S', 'M', 'L', 'XL'],
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
    sizes: ['S', 'M', 'L', 'XL'],
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
    sizes: ['S', 'M', 'L', 'XL'],
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
    sizes: ['S', 'M', 'L', 'XL'],
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
  // Productos adicionales para demostrar paginación
  {
    id: 19,
    name: 'Blusa Casual Rayada',
    price: 32.99,
    images: ['/images/product1.svg'],
    category: 'blusas',
    categoryLink: '/mujer',
    description: 'Blusa casual con diseño de rayas modernas.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Azul', 'Blanco', 'Negro'],
    details: [
      'Tejido 100% algodón',
      'Manga larga',
      'Corte holgado',
      'Lavable a máquina'
    ]
  },
  {
    id: 20,
    name: 'Pantalón Cargo Militar',
    price: 48.99,
    images: ['/images/product2.svg'],
    category: 'pantalones',
    categoryLink: '/hombre',
    description: 'Pantalón cargo con múltiples bolsillos y estilo militar.',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Verde', 'Caqui', 'Negro'],
    details: [
      'Tejido resistente',
      'Múltiples bolsillos',
      'Corte regular',
      'Lavable a máquina'
    ]
  },
  {
    id: 21,
    name: 'Vestido de Noche Elegante',
    price: 89.99,
    images: ['/images/product3.svg'],
    category: 'vestidos',
    categoryLink: '/mujer',
    description: 'Vestido elegante perfecto para eventos de noche.',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Negro', 'Azul Marino', 'Burdeos'],
    details: [
      'Tejido satinado',
      'Corte entallado',
      'Largo midi',
      'Lavado en seco'
    ]
  },
  {
    id: 22,
    name: 'Polo Clásico Hombre',
    price: 26.99,
    images: ['/images/product4.svg'],
    category: 'polos',
    categoryLink: '/hombre',
    description: 'Polo clásico de algodón peinado de alta calidad.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Negro', 'Azul', 'Rojo'],
    details: [
      'Algodón peinado',
      'Cuello polo',
      'Manga corta',
      'Lavable a máquina'
    ]
  },
  {
    id: 23,
    name: 'Falda Midi Plisada',
    price: 38.99,
    images: ['/images/product1.svg'],
    category: 'faldas',
    categoryLink: '/mujer',
    description: 'Falda midi con plisado elegante y cintura alta.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Rosa', 'Gris', 'Azul'],
    details: [
      'Tejido plisado',
      'Cintura alta',
      'Largo midi',
      'Lavable a máquina'
    ]
  },
  {
    id: 24,
    name: 'Chaqueta Bomber',
    price: 65.99,
    images: ['/images/product2.svg'],
    category: 'chaquetas',
    categoryLink: '/hombre',
    description: 'Chaqueta bomber moderna con cierre de cremallera.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Verde', 'Azul'],
    details: [
      'Tejido resistente al viento',
      'Cierre con cremallera',
      'Bolsillos laterales',
      'Forro interior'
    ]
  },
  {
    id: 25,
    name: 'Bañador Deportivo',
    price: 35.99,
    images: ['/images/product3.svg'],
    category: 'bañadores',
    categoryLink: '/sport',
    description: 'Bañador deportivo para natación y actividades acuáticas.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Negro', 'Rojo'],
    details: [
      'Tejido de secado rápido',
      'Resistente al cloro',
      'Ajuste cómodo',
      'Protección UV'
    ]
  },
  {
    id: 26,
    name: 'Overol de Mezclilla',
    price: 72.99,
    images: ['/images/product4.svg'],
    category: 'overoles',
    categoryLink: '/mujer',
    description: 'Overol de mezclilla vintage con tirantes ajustables.',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Azul', 'Negro', 'Blanco'],
    details: [
      'Mezclilla 100% algodón',
      'Tirantes ajustables',
      'Bolsillos frontales',
      'Lavable a máquina'
    ]
  },
  {
    id: 27,
    name: 'Camiseta Técnica Running',
    price: 28.99,
    images: ['/images/product1.svg'],
    category: 'camisetas',
    categoryLink: '/sport',
    description: 'Camiseta técnica transpirable para running.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris', 'Negro', 'Azul', 'Verde'],
    details: [
      'Tejido transpirable',
      'Secado rápido',
      'Costuras planas',
      'Protección UV'
    ]
  },
  {
    id: 28,
    name: 'Vestido Casual Verano',
    price: 42.99,
    images: ['/images/product2.svg'],
    category: 'vestidos',
    categoryLink: '/mujer',
    description: 'Vestido casual perfecto para el verano.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Amarillo', 'Rosa', 'Blanco'],
    details: [
      'Tejido ligero',
      'Manga corta',
      'Corte A',
      'Lavable a máquina'
    ]
  },
  {
    id: 29,
    name: 'Sudadera con Capucha',
    price: 45.99,
    images: ['/images/product3.svg'],
    category: 'sudaderas',
    categoryLink: '/hombre',
    description: 'Sudadera cómoda con capucha y bolsillo canguro.',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Gris', 'Negro', 'Azul'],
    details: [
      'Algodón con poliéster',
      'Capucha ajustable',
      'Bolsillo canguro',
      'Puños elásticos'
    ]
  },
  {
    id: 30,
    name: 'Shorts de Playa',
    price: 22.99,
    images: ['/images/product4.svg'],
    category: 'shorts',
    categoryLink: '/hombre',
    description: 'Shorts ligeros perfectos para la playa.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Verde', 'Naranja'],
    details: [
      'Tejido de secado rápido',
      'Cintura elástica',
      'Bolsillos laterales',
      'Resistente al agua'
    ]
  },
  {
    id: 31,
    name: 'Blusa Formal Oficina',
    price: 39.99,
    images: ['/images/product1.svg'],
    category: 'blusas',
    categoryLink: '/mujer',
    description: 'Blusa formal elegante para la oficina.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blanco', 'Azul', 'Negro'],
    details: [
      'Tejido no arrugable',
      'Manga larga',
      'Cuello clásico',
      'Lavable a máquina'
    ]
  },
  {
    id: 32,
    name: 'Pantalón Chino Casual',
    price: 41.99,
    images: ['/images/product2.svg'],
    category: 'pantalones',
    categoryLink: '/hombre',
    description: 'Pantalón chino casual versátil para cualquier ocasión.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Caqui', 'Azul Marino', 'Negro'],
    details: [
      'Algodón stretch',
      'Corte slim',
      'Bolsillos traseros',
      'Lavable a máquina'
    ]
  },
  {
    id: 33,
    name: 'Top Deportivo Mujer',
    price: 24.99,
    images: ['/images/product3.svg'],
    category: 'tops',
    categoryLink: '/sport',
    description: 'Top deportivo con soporte medio para ejercicio.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Negro', 'Rosa', 'Gris'],
    details: [
      'Soporte medio',
      'Tejido transpirable',
      'Secado rápido',
      'Costuras planas'
    ]
  },
  {
    id: 34,
    name: 'Cardigan Largo',
    price: 52.99,
    images: ['/images/product4.svg'],
    category: 'cardigans',
    categoryLink: '/mujer',
    description: 'Cardigan largo y cómodo para looks casuales.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige', 'Gris', 'Negro'],
    details: [
      'Tejido suave',
      'Largo hasta la rodilla',
      'Bolsillos laterales',
      'Lavable a máquina'
    ]
  },
  {
    id: 35,
    name: 'Camisa Formal Rayas',
    price: 35.99,
    images: ['/images/product1.svg'],
    category: 'camisas',
    categoryLink: '/hombre',
    description: 'Camisa formal con elegante diseño a rayas.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Blanco', 'Gris'],
    details: [
      'Algodón premium',
      'Manga larga',
      'Cuello clásico',
      'No requiere plancha'
    ]
  },
  {
    id: 36,
    name: 'Falda Lápiz Ejecutiva',
    price: 33.99,
    images: ['/images/product2.svg'],
    category: 'faldas',
    categoryLink: '/mujer',
    description: 'Falda lápiz profesional para look ejecutivo.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Negro', 'Azul Marino', 'Gris'],
    details: [
      'Corte entallado',
      'Cintura alta',
      'Cierre trasero',
      'Tela stretch'
    ]
  },
  {
    id: 37,
    name: 'Chaleco Acolchado',
    price: 58.99,
    images: ['/images/product3.svg'],
    category: 'chalecos',
    categoryLink: '/hombre',
    description: 'Chaleco acolchado perfecto para entretiempo.',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Negro', 'Azul', 'Verde'],
    details: [
      'Relleno sintético',
      'Resistente al viento',
      'Bolsillos con cremallera',
      'Lavable a máquina'
    ]
  },
  {
    id: 38,
    name: 'Mono Deportivo',
    price: 67.99,
    images: ['/images/product4.svg'],
    category: 'monos',
    categoryLink: '/sport',
    description: 'Mono deportivo cómodo para yoga y pilates.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul'],
    details: [
      'Tejido elástico',
      'Ajuste ceñido',
      'Transpirable',
      'Secado rápido'
    ]
  },
  {
    id: 39,
    name: 'Camiseta Polo Mujer',
    price: 29.99,
    images: ['/images/product1.svg'],
    category: 'polos',
    categoryLink: '/mujer',
    description: 'Polo femenino clásico de algodón suave.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blanco', 'Rosa', 'Azul'],
    details: [
      'Algodón piqué',
      'Corte femenino',
      'Cuello polo',
      'Lavable a máquina'
    ]
  },
  {
    id: 40,
    name: 'Bermuda Casual',
    price: 31.99,
    images: ['/images/product2.svg'],
    category: 'bermudas',
    categoryLink: '/hombre',
    description: 'Bermuda casual cómoda para el verano.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Caqui', 'Azul', 'Negro'],
    details: [
      'Algodón ligero',
      'Largo a la rodilla',
      'Bolsillos laterales',
      'Cintura ajustable'
    ]
  },
  {
    id: 41,
    name: 'Vestido Maxi Bohemio',
    price: 76.99,
    images: ['/images/product3.svg'],
    category: 'vestidos',
    categoryLink: '/mujer',
    description: 'Vestido largo bohemio con estampado floral.',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Multicolor', 'Azul', 'Verde'],
    details: [
      'Estampado floral',
      'Largo hasta el suelo',
      'Manga larga',
      'Tela fluida'
    ]
  },
  {
    id: 42,
    name: 'Chaqueta Vaquera',
    price: 62.99,
    images: ['/images/product4.svg'],
    category: 'chaquetas',
    categoryLink: '/mujer',
    description: 'Chaqueta vaquera clásica de mezclilla.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Negro', 'Blanco'],
    details: [
      'Mezclilla 100%',
      'Corte clásico',
      'Bolsillos frontales',
      'Lavable a máquina'
    ]
  },
  {
    id: 43,
    name: 'Pantalón Jogger',
    price: 37.99,
    images: ['/images/product1.svg'],
    category: 'pantalones',
    categoryLink: '/sport',
    description: 'Pantalón jogger cómodo para entrenamiento.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris', 'Negro', 'Azul'],
    details: [
      'Algodón con lycra',
      'Cintura elástica',
      'Puños ajustados',
      'Bolsillos laterales'
    ]
  },
  {
    id: 44,
    name: 'Top Halter Verano',
    price: 26.99,
    images: ['/images/product2.svg'],
    category: 'tops',
    categoryLink: '/mujer',
    description: 'Top halter ligero perfecto para el verano.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blanco', 'Negro', 'Rosa'],
    details: [
      'Tela ligera',
      'Escote halter',
      'Sin mangas',
      'Lavable a máquina'
    ]
  },
  {
    id: 45,
    name: 'Camisa Hawaiana',
    price: 43.99,
    images: ['/images/product3.svg'],
    category: 'camisas',
    categoryLink: '/hombre',
    description: 'Camisa hawaiana con estampado tropical.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Verde', 'Rojo'],
    details: [
      'Estampado tropical',
      'Manga corta',
      'Corte relajado',
      'Algodón transpirable'
    ]
  },
  {
    id: 46,
    name: 'Leggings Deportivos Premium',
    price: 49.99,
    images: ['/images/product4.svg'],
    category: 'leggings',
    categoryLink: '/sport',
    description: 'Leggings premium con tecnología de compresión.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Negro', 'Gris', 'Azul Marino'],
    details: [
      'Compresión media',
      'Cintura alta',
      'Bolsillo lateral',
      'Antiodor'
    ]
  },
  {
    id: 47,
    name: 'Blazer Casual Mujer',
    price: 68.99,
    images: ['/images/product1.svg'],
    category: 'blazers',
    categoryLink: '/mujer',
    description: 'Blazer casual elegante para cualquier ocasión.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Beige', 'Azul Marino'],
    details: [
      'Corte moderno',
      'Solapas estilizadas',
      'Forro interior',
      'Lavado en seco'
    ]
  },
  {
    id: 48,
    name: 'Pantalón de Vestir',
    price: 55.99,
    images: ['/images/product2.svg'],
    category: 'pantalones',
    categoryLink: '/hombre',
    description: 'Pantalón de vestir formal para ocasiones especiales.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Azul Marino', 'Gris'],
    details: [
      'Tela de vestir',
      'Corte clásico',
      'Pliegue frontal',
      'Lavado en seco'
    ]
  },
  {
    id: 49,
    name: 'Crop Top Deportivo',
    price: 21.99,
    images: ['/images/product3.svg'],
    category: 'tops',
    categoryLink: '/sport',
    description: 'Crop top deportivo para entrenamientos intensos.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Negro', 'Blanco', 'Rosa'],
    details: [
      'Soporte ligero',
      'Corte crop',
      'Transpirable',
      'Secado rápido'
    ]
  },
  {
    id: 50,
    name: 'Suéter Cuello V',
    price: 44.99,
    images: ['/images/product4.svg'],
    category: 'suéteres',
    categoryLink: '/hombre',
    description: 'Suéter clásico con cuello en V.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris', 'Azul', 'Negro'],
    details: [
      'Lana merino',
      'Cuello en V',
      'Manga larga',
      'Lavable a máquina'
    ]
  },
  {
    id: 51,
    name: 'Shorts Ciclista',
    price: 27.99,
    images: ['/images/product1.svg'],
    category: 'shorts',
    categoryLink: '/sport',
    description: 'Shorts ciclista ajustados para ciclismo.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul'],
    details: [
      'Tejido técnico',
      'Acolchado gel',
      'Compresión',
      'Reflectantes'
    ]
  },
  {
    id: 52,
    name: 'Vestido Cóctel',
    price: 95.99,
    images: ['/images/product2.svg'],
    category: 'vestidos',
    categoryLink: '/mujer',
    description: 'Vestido de cóctel elegante para eventos.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Negro', 'Rojo', 'Azul'],
    details: [
      'Tela satinada',
      'Corte entallado',
      'Sin mangas',
      'Lavado en seco'
    ]
  },
  {
    id: 53,
    name: 'Parka Invierno',
    price: 129.99,
    images: ['/images/product3.svg'],
    category: 'parkas',
    categoryLink: '/hombre',
    description: 'Parka resistente para el invierno.',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Negro', 'Verde', 'Azul'],
    details: [
      'Resistente al agua',
      'Capucha desmontable',
      'Forro térmico',
      'Múltiples bolsillos'
    ]
  },
  {
    id: 54,
    name: 'Body Básico',
    price: 18.99,
    images: ['/images/product4.svg'],
    category: 'bodies',
    categoryLink: '/mujer',
    description: 'Body básico versátil para combinar.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Negro', 'Blanco', 'Beige'],
    details: [
      'Algodón stretch',
      'Manga larga',
      'Cuello redondo',
      'Cierre inferior'
    ]
  },
  {
    id: 55,
    name: 'Traje de Baño Completo',
    price: 68.99,
    images: ['/images/product1.svg'],
    category: 'trajes de baño',
    categoryLink: '/mujer',
    description: 'Traje de baño completo con diseño moderno.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Azul', 'Rojo'],
    details: [
      'Protección UV',
      'Secado rápido',
      'Ajuste perfecto',
      'Resistente al cloro'
    ]
  },
  {
    id: 56,
    name: 'Chándal Completo',
    price: 75.99,
    images: ['/images/product2.svg'],
    category: 'chándales',
    categoryLink: '/sport',
    description: 'Chándal completo para entrenamiento.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Gris', 'Negro', 'Azul'],
    details: [
      'Conjunto completo',
      'Tejido transpirable',
      'Cremalleras YKK',
      'Bolsillos funcionales'
    ]
  },
  {
    id: 57,
    name: 'Falda Plisada Escolar',
    price: 35.99,
    images: ['/images/product3.svg'],
    category: 'faldas',
    categoryLink: '/ninos',
    description: 'Falda plisada perfecta para uniforme escolar.',
    inStock: true,
    sizes: ['XS', 'S', 'M'],
    colors: ['Azul Marino', 'Gris', 'Negro'],
    details: [
      'Plisado permanente',
      'Cintura elástica',
      'Tela resistente',
      'Fácil cuidado'
    ]
  },
  {
    id: 58,
    name: 'Camiseta Básica Niños',
    price: 15.99,
    images: ['/images/product4.svg'],
    category: 'camisetas',
    categoryLink: '/ninos',
    description: 'Camiseta básica cómoda para niños.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blanco', 'Azul', 'Rojo', 'Verde'],
    details: [
      'Algodón suave',
      'Manga corta',
      'Cuello redondo',
      'Colores sólidos'
    ]
  },
  {
    id: 59,
    name: 'Pijama Infantil',
    price: 28.99,
    images: ['/images/product1.svg'],
    category: 'pijamas',
    categoryLink: '/bebe',
    description: 'Pijama suave y cómodo para bebés.',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Rosa', 'Azul', 'Amarillo'],
    details: [
      'Algodón orgánico',
      'Botones seguros',
      'Pies cerrados',
      'Lavable a máquina'
    ]
  },
  {
    id: 60,
    name: 'Mallas Térmicas',
    price: 32.99,
    images: ['/images/product2.svg'],
    category: 'mallas',
    categoryLink: '/sport',
    description: 'Mallas térmicas para deportes de invierno.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul'],
    details: [
      'Tecnología térmica',
      'Compresión gradual',
      'Costuras planas',
      'Antibacterial'
    ]
  },
  {
    id: 61,
    name: 'Vestido Fiesta Niña',
    price: 45.99,
    images: ['/images/product3.svg'],
    category: 'vestidos',
    categoryLink: '/ninos',
    description: 'Vestido elegante para fiestas infantiles.',
    inStock: true,
    sizes: ['XS', 'S', 'M'],
    colors: ['Rosa', 'Blanco', 'Azul'],
    details: [
      'Tul decorativo',
      'Lazo en la cintura',
      'Forro suave',
      'Lavado delicado'
    ]
  },
  {
    id: 62,
    name: 'Chaleco Ejecutivo',
    price: 48.99,
    images: ['/images/product4.svg'],
    category: 'chalecos',
    categoryLink: '/hombre',
    description: 'Chaleco ejecutivo para trajes formales.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul Marino'],
    details: [
      'Tela premium',
      'Corte entallado',
      'Botones metálicos',
      'Forro de seda'
    ]
  },
  {
    id: 63,
    name: 'Pantuflas Deportivas',
    price: 24.99,
    images: ['/images/product1.svg'],
    category: 'pantuflas',
    categoryLink: '/sport',
    description: 'Pantuflas cómodas para después del ejercicio.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Negro', 'Gris', 'Azul'],
    details: [
      'Suela antideslizante',
      'Material transpirable',
      'Acolchado interno',
      'Lavable a máquina'
    ]
  },
  {
    id: 64,
    name: 'Kimono Elegante',
    price: 89.99,
    images: ['/images/product2.svg'],
    category: 'kimonos',
    categoryLink: '/mujer',
    description: 'Kimono elegante con estampado oriental.',
    inStock: true,
    sizes: ['S', 'M', 'L'],
    colors: ['Rojo', 'Azul', 'Negro'],
    details: [
      'Seda sintética',
      'Estampado oriental',
      'Manga ancha',
      'Cinturón incluido'
    ]
  },
  {
    id: 65,
    name: 'Overol de Trabajo',
    price: 65.99,
    images: ['/images/product3.svg'],
    category: 'overoles',
    categoryLink: '/hombre',
    description: 'Overol resistente para trabajo pesado.',
    inStock: true,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Azul', 'Gris', 'Negro'],
    details: [
      'Tela resistente',
      'Múltiples bolsillos',
      'Tirantes ajustables',
      'Rodilleras reforzadas'
    ]
  },
  {
    id: 66,
    name: 'Bikini Estampado',
    price: 39.99,
    images: ['/images/product4.svg'],
    category: 'bikinis',
    categoryLink: '/mujer',
    description: 'Bikini con estampado tropical moderno.',
    inStock: true,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Verde', 'Azul', 'Rosa'],
    details: [
      'Estampado tropical',
      'Copa moldeada',
      'Tirantes ajustables',
      'Secado rápido'
    ]
  },
  {
    id: 67,
    name: 'Pantalón Pijama',
    price: 25.99,
    images: ['/images/product1.svg'],
    category: 'pijamas',
    categoryLink: '/hombre',
    description: 'Pantalón de pijama cómodo para dormir.',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Azul', 'Gris', 'Verde'],
    details: [
      'Algodón suave',
      'Cintura elástica',
      'Bolsillos laterales',
      'Corte relajado'
    ]
  },
  {
    id: 68,
    name: 'Gorra Deportiva',
    price: 19.99,
    images: ['/images/product2.svg'],
    category: 'gorras',
    categoryLink: '/sport',
    description: 'Gorra deportiva con protección UV.',
    inStock: true,
    sizes: ['M', 'L'],
    colors: ['Negro', 'Blanco', 'Azul', 'Rojo'],
    details: [
      'Protección UV',
      'Material transpirable',
      'Ajuste con velcro',
      'Visera curva'
    ]
  }
];

export default allProducts; 