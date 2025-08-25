// categories.tsx

// Lista principal de categorías con rutas y nombres
export const CATEGORIES = [
  { id: "papeleria", value: "papeleria", label: "Papeleria" },
  { id: "escritura", value: "escritura", label: "Escritura" },
  { id: "organizacion", value: "organizacion", label: "Organizacion" },
  { id: "accesorios", value: "accesorios", label: "Accesorios" },
];


// Exportación alternativa solo con id y nombre (si lo necesitas en otro lado)
export const categories = CATEGORIES.map(cat => ({
  id: cat.id,
  name: cat.label,
}));

// Exportación por defecto
export default CATEGORIES;
