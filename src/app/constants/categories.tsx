// categories.tsx

// Lista principal de categorías con rutas y nombres
export const CATEGORIES = [
  { id: "maquillaje", value: "/maquillaje", label: "Maquillaje" },
  { id: "cuidado-piel", value: "/cuidado-piel", label: "Cuidado de Piel" },
  { id: "fragancias", value: "/fragancias", label: "Fragancias" },
  { id: "accesorios", value: "/accesorios", label: "Accesorios" },
];

// Exportación alternativa solo con id y nombre (si lo necesitas en otro lado)
export const categories = CATEGORIES.map(cat => ({
  id: cat.id,
  name: cat.label,
}));

// Exportación por defecto
export default CATEGORIES;
