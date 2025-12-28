export const CATEGORIES = [
  { id: "suministrosOficina", label: "Suministros de Oficina" }, // 1-1999
  { id: "suministrosBelleza", label: "Suministros de Belleza" }, // 2000-3999
  { id: "suministrosMedicos", label: "Suministros Médicos" },    // 4000-4999
  { id: "suministrosLimpieza", label: "Suministros de Limpieza" }, // 5000-5999
  { id: "productosCosmeticos", label: "Cosméticos" },            // 6000-6999
  { id: "productosOrganicos", label: "Productos Orgánicos" },    // 7000-7999
];

export const SUBCATEGORIES = [
  // Categoría 1: Suministros de oficina (1-1999)
  { id: "suministrosOficina", value: "papeles", label: "Papeles", minId: 1, maxId: 139 },
  { id: "suministrosOficina", value: "boligrafos", label: "Bolígrafos", minId: 140, maxId: 279 },
  { id: "suministrosOficina", value: "lapices", label: "Lápices", minId: 280, maxId: 419 },
  { id: "suministrosOficina", value: "marcadores", label: "Marcadores", minId: 420, maxId: 559 },
  { id: "suministrosOficina", value: "pinturas", label: "Pinturas", minId: 560, maxId: 699 },
  { id: "suministrosOficina", value: "foami", label: "Foami", minId: 700, maxId: 839 },
  { id: "suministrosOficina", value: "grapadoras", label: "Grapadoras", minId: 840, maxId: 979 },
  { id: "suministrosOficina", value: "perforadoras", label: "Perforadoras", minId: 980, maxId: 1119 },
  { id: "suministrosOficina", value: "organizadores-de-escritorio", label: "Organizadores de Escritorio", minId: 1120, maxId: 1259 },
  { id: "suministrosOficina", value: "articulos-generales", label: "Artículos Generales", minId: 1260, maxId: 1359 },
  { id: "suministrosOficina", value: "calculadora", label: "Calculadora", minId: 1400, maxId: 1539 },
  { id: "suministrosOficina", value: "cuadernos", label: "Cuadernos", minId: 1540, maxId: 1679 },
  { id: "suministrosOficina", value: "material-didactico", label: "Material didáctico", minId: 1680, maxId: 1819 },
  { id: "suministrosOficina", value: "sobres", label: "Sobres", minId: 1820, maxId: 1999 },

  // Categoría 2: Suministros de belleza (2000-3999)
  { id: "suministrosBelleza", value: "tijeras", label: "Tijeras", minId: 2000, maxId: 2169 },
  { id: "suministrosBelleza", value: "alicates", label: "Alicates", minId: 2170, maxId: 2339 },
  { id: "suministrosBelleza", value: "peinillas", label: "Peinillas", minId: 2340, maxId: 2509 },
  { id: "suministrosBelleza", value: "cepillosCabello", label: "Cepillos de Cabello", minId: 2510, maxId: 2679 },
  { id: "suministrosBelleza", value: "brochas", label: "Brochas", minId: 2680, maxId: 2849 },
  { id: "suministrosBelleza", value: "pinzas", label: "Pinzas", minId: 2850, maxId: 3019 },
  { id: "suministrosBelleza", value: "moños", label: "Moños", minId: 3020, maxId: 3189 },
  { id: "suministrosBelleza", value: "binchas", label: "Binchas", minId: 3190, maxId: 3359 },
  { id: "suministrosBelleza", value: "limas", label: "Limas", minId: 3360, maxId: 3529 },
  { id: "suministrosBelleza", value: "rulos", label: "Rulos", minId: 3530, maxId: 3699 },
  { id: "suministrosBelleza", value: "extensiones-cabello", label: "Extensiones Cabello", minId: 3700, maxId: 3869 },
  { id: "suministrosBelleza", value: "uñas-postizas", label: "Uñas Postizas", minId: 3870, maxId: 3999 },

  // Categoría 3: Suministros médicos (4000-4999)
  { id: "suministrosMedicos", value: "gorros", label: "Gorros", minId: 4000, maxId: 4149 },
  { id: "suministrosMedicos", value: "guantes", label: "Guantes", minId: 4150, maxId: 4299 },
  { id: "suministrosMedicos", value: "mandiles", label: "Mandiles", minId: 4300, maxId: 4449 },
  { id: "suministrosMedicos", value: "mascarillas", label: "Mascarillas", minId: 4450, maxId: 4599 },
  { id: "suministrosMedicos", value: "zapatones", label: "Zapatones", minId: 4600, maxId: 4749 },
  { id: "suministrosMedicos", value: "algodon", label: "Algodón", minId: 4750, maxId: 4899 },
  { id: "suministrosMedicos", value: "varios", label: "Varios", minId: 4900, maxId: 4999 },

  // Categoría 4: Suministros de limpieza (5000-5999)
  { id: "suministrosLimpieza", value: "escobas", label: "Escobas", minId: 5000, maxId: 5199 },
  { id: "suministrosLimpieza", value: "recogedores", label: "Recogedores", minId: 5200, maxId: 5399 },
  { id: "suministrosLimpieza", value: "cepillos", label: "Cepillos", minId: 5400, maxId: 5599 },
  { id: "suministrosLimpieza", value: "fundas", label: "Fundas", minId: 5600, maxId: 5799 },
  { id: "suministrosLimpieza", value: "toallas", label: "Toallas", minId: 5800, maxId: 5999 },

  // Categoría 5: Cosméticos (6000-6999)
  { id: "productosCosmeticos", value: "cuidado-capilar", label: "Cuidado Capilar", minId: 6000, maxId: 6129 },
  { id: "productosCosmeticos", value: "cuidado-facial", label: "Cuidado Facial", minId: 6130, maxId: 6259 },
  { id: "productosCosmeticos", value: "cuidado-manos-pies", label: "Cuidado de manos y pies", minId: 6260, maxId: 6389 },
  { id: "productosCosmeticos", value: "cuidado-corporal", label: "Cuidado Corporal", minId: 6390, maxId: 6519 },
  { id: "productosCosmeticos", value: "fragancias", label: "Fragancias", minId: 6520, maxId: 6649 },
  { id: "productosCosmeticos", value: "maquillaje", label: "Maquillaje", minId: 6650, maxId: 6779 },
  { id: "productosCosmeticos", value: "jabones", label: "Jabones", minId: 6780, maxId: 6909 },
  // gel-dental sin rango explícito por ahora
  { id: "productosCosmeticos", value: "protector-solar", label: "Protector Solar", minId: 6910, maxId: 6999 },

  // Categoría 6: Productos orgánicos (7000-7999)
  { id: "productosOrganicos", value: "cuidado-piel", label: "Cuidado de la Piel", minId: 7000, maxId: 7159 },
  { id: "productosOrganicos", value: "bebidas-aloe", label: "Bebidas Aloe", minId: 7160, maxId: 7319 },
  { id: "productosOrganicos", value: "cuidado-personal", label: "Cuidado Personal", minId: 7320, maxId: 7479 },
  { id: "productosOrganicos", value: "productos-de-la-colmena", label: "Productos de la Colmena", minId: 7480, maxId: 7639 },
  { id: "productosOrganicos", value: "nutricion", label: "Nutrición", minId: 7640, maxId: 7799 },
  { id: "productosOrganicos", value: "control-peso", label: "Control de Peso", minId: 7800, maxId: 7999 },
];

// Lista plana alternativa de subcategorías (solo id + nombre)
export const subcategories = SUBCATEGORIES.map((cat) => ({
  id: cat.id,
  name: cat.label,
}));

// Helper para obtener el rango de IDs de una subcategoría a partir de su value
export const getSubcategoryIdRange = (value: string) => {
  const sub = SUBCATEGORIES.find((s) => s.value === value);
  if (!sub || typeof (sub as any).minId !== "number" || typeof (sub as any).maxId !== "number") {
    return null;
  }
  return { categoryId: sub.id, minId: (sub as any).minId as number, maxId: (sub as any).maxId as number };
};

// Export por defecto: categorías principales (usado en Navbar, páginas de categorías, etc.)
export default CATEGORIES;
