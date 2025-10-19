export const CATEGORIES = [
  { id: "suministrosOficina", label: "Suministros de Oficina" },
  { id: "suministrosMedicos", label: "Suministros Médicos" },
  { id: "cosmeticos", label: "Cosméticos" },
  { id: "bisuteria", label: "Bisutería" },
];

// Subcategorías conectadas a su categoría principal
export const SUBCATEGORIES = [
  { id: "suministrosOficina", value: "papeles", label: "Papeles" },
  { id: "suministrosOficina", value: "boligrafos", label: "Boligrafos" },
  { id: "suministrosOficina", value: "lapices", label: "Lapices" },
  { id: "suministrosOficina", value: "marcadores", label: "Marcadores" },
  { id: "suministrosOficina", value: "pinturas", label: "Pinturas" },
  { id: "suministrosOficina", value: "foami", label: "Foami" },
  { id: "suministrosOficina", value: "grapadoras", label: "Grapadoras" },
  { id: "suministrosOficina", value: "perforadoras", label: "Perforadoras" },
  { id: "suministrosOficina", value: "organizadores-de-escritorio", label: "Organizadores de Escritorios" },
  { id: "suministrosOficina", value: "articulos-generales", label: "Articulos Generales" },
  { id: "suministrosOficina", value: "calculadora", label: "Calculadora" },
  { id: "suministrosOficina", value: "cuadernos", label: "Cuadernos" },


    { id: "suministrosMedicos", value: "gorros", label: "Gorros" },
    { id: "suministrosOficina", value: "guantes", label: "Guantes" },
    { id: "suministrosOficina", value: "mandiles", label: "Mandiles" },



  { id: "suministrosOficina", value: "escritura-y-correccion", label: "escritura y correccion" },
  { id: "suministrosOficina", value: "accesorios", label: "Accesorios" },
  { id: "suministrosOficina", value: "belleza", label: "Belleza" },

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
