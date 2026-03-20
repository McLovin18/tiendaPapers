export const CATEGORIES = [

  { id: "productosCosmeticos", label: "BELLEZA" },     // 6000-6999
  { id: "productosOrganicos", label: "SUPLEMENTOS" },      // 7000-7999
  { id: "varios", label: "VARIEDADES" },    // 7000-7999

];

export const SUBCATEGORIES = [
  // Categoría 5: Cosméticos (6000-6999)
  { id: "productosCosmeticos", value: "cuidado-capilar", label: "Cuidado Capilar", minId: 0, maxId: 500 },
  { id: "productosCosmeticos", value: "cuidado-facial", label: "Cuidado Facial", minId: 501, maxId: 1000 },
  { id: "productosCosmeticos", value: "cuidado-manos-pies", label: "Cuidado de manos y pies", minId: 1001, maxId: 1500 },
  { id: "productosCosmeticos", value: "cuidado-corporal", label: "Cuidado Corporal", minId: 1501, maxId: 2000 },
  { id: "productosCosmeticos", value: "fragancias", label: "Fragancias", minId: 2001, maxId: 2500 },
  { id: "productosCosmeticos", value: "maquillaje", label: "Maquillaje", minId: 2501, maxId: 3000 },
  { id: "productosCosmeticos", value: "jabones", label: "Jabónes", minId: 3001, maxId: 3500 },
  // gel-dental sin rango explícito por ahora
  { id: "productosCosmeticos", value: "protector-solar", label: "Protector Solar", minId: 3501, maxId: 4000 },


  { id: "varios", value: "escolares", label: "Escolares", minId: 4001, maxId: 4800 },
  { id: "varios", value: "oficina", label: "De oficina", minId: 4801, maxId: 5600 },
    { id: "varios", value: "papeleria", label: "Papelería", minId: 5601, maxId: 6300 },
  { id: "varios", value: "varios", label: "Varios", minId: 6301, maxId: 7000 },


  // Categoría 6: Productos orgánicos (7000-7999)
  { id: "productosOrganicos", value: "de-aloe-vera", label: "De aloe vera", minId: 7160, maxId: 7319 },
  { id: "productosOrganicos", value: "productos-de-la-colmena", label: "De la Colmena", minId: 7480, maxId: 7639 },
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
