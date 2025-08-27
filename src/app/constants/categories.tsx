export const CATEGORIES = [
  { id: "suministrosOficina", label: "Suministros de Oficina" },
  { id: "cosmeticos", label: "Cosméticos" },
  { id: "bisuteria", label: "Bisutería" },
];

// Subcategorías conectadas a su categoría principal
export const SUBCATEGORIES = [
  { id: "suministrosOficina", value: "papeleria", label: "Papeleria" },
  { id: "suministrosOficina", value: "escritura", label: "Escritura" },
  { id: "suministrosOficina", value: "organizacion", label: "Organizacion" },
  { id: "suministrosOficina", value: "accesorios", label: "Accesorios" },
  { id: "cosmeticos", value: "maquillaje", label: "Maquillaje" },
  { id: "cosmeticos", value: "cuidado-piel", label: "Cuidado de Piel" },
  { id: "cosmeticos", value: "fragancias", label: "Fragancias" },
  { id: "cosmeticos", value: "accesorios", label: "Accesorios" },
  { id: "bisuteria", value: "collares", label: "Collares" },
  { id: "bisuteria", value: "pulseras", label: "Pulseras" },
  { id: "bisuteria", value: "anillos", label: "Anillos" },
];


// Export alternativo (si necesitas lista plana)
export const subcategories = SUBCATEGORIES.map((cat) => ({
  id: cat.id,
  name: cat.label,
}));

export default SUBCATEGORIES;
