export const CATEGORIES = [
  { id: "suministrosOficina", label: "Suministros de Oficina" },
  { id: "suministrosBelleza", label: "Suministros de Belleza" },
  { id: "suministrosMedicos", label: "Suministros Médicos" },
  { id: "suministrosLimpieza", label: "Suministros de Limpieza" },
  { id: "productosCosmeticos", label: "Cosméticos" },
  { id: "cuidadoPersonal", label: "Cuidado Personal" },
  { id: "productosOrganicos", label: " Productos Organicos" },


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
  { id: "suministrosOficina", value: "material-didactico", label: "Material didactico" },
  { id: "suministrosOficina", value: "sobres", label: "Sobres" },



  { id: "suministrosBelleza", value: "tijeras", label: "Tijeras" },
  { id: "suministrosBelleza", value: "alicates", label: "Alicates" },
  { id: "suministrosBelleza", value: "peinillas", label: "Peinillas" },
  { id: "suministrosBelleza", value: "cepillosCabello", label: "Cepillos de Cabello" },
  { id: "suministrosBelleza", value: "brochas", label: "Brochas" },
  { id: "suministrosBelleza", value: "pinzas", label: "Pinzas" },
  { id: "suministrosBelleza", value: "moños", label: "Moños" },
  { id: "suministrosBelleza", value: "binchas", label: "Binchas" },
  { id: "suministrosBelleza", value: "limas", label: "Limas" },
  { id: "suministrosBelleza", value: "rulos", label: "Rulos" },
  { id: "suministrosBelleza", value: "extensiones-cabello", label: "Extensiones de Cabello" },
  { id: "suministrosBelleza", value: "uñas-postizas", label: "Uñas Postizas" },



  { id: "suministrosMedicos", value: "gorros", label: "Gorros" },
  { id: "suministrosMedicos", value: "guantes", label: "Guantes" },
  { id: "suministrosMedicos", value: "mandiles", label: "Mandiles" },
  { id: "suministrosMedicos", value: "mascarillas", label: "Mascarillas" },
  { id: "suministrosMedicos", value: "zapatones", label: "Zapatones" },
  { id: "suministrosMedicos", value: "algodon", label: "Algodón" },
  { id: "suministrosMedicos", value: "varios", label: "Varios" },



  { id: "suministrosLimpieza", value: "escobas", label: "Escobas" },
  { id: "suministrosLimpieza", value: "recogedores", label: "Recogedores" },
  { id: "suministrosLimpieza", value: "cepillos", label: "Cepillos" },
  { id: "suministrosLimpieza", value: "toallas-paños", label: "Toallas y Paños" },
  { id: "suministrosLimpieza", value: "fundas", label: "Fundas" },



  { id: "productosCosmeticos", value: "cuidado-capilar", label: "Cuidado Capilar" },
  { id: "productosCosmeticos", value: "cuidado-facial", label: "Cuidado Facial" },
  { id: "productosCosmeticos", value: "cuidado-manos-pies", label: "Cuidado de manos y pies" },
  { id: "productosCosmeticos", value: "cuidado-corporal", label: "Cuidado Corporal" },
  { id: "productosCosmeticos", value: "fragancias", label: "Fragancias" },
  { id: "productosCosmeticos", value: "maquillaje", label: "Maquillaje" },



  { id: "cuidadoPersonal", value: "jabones", label: "Jabones" },
  { id: "cuidadoPersonal", value: "gel-dental", label: "Gel Dental" },
  { id: "cuidadoPersonal", value: "protector-solar", label: "Protector Solar" },

  
  
  { id: "productosOrganicos", value: "cuidado-piel", label: "Cuidado de la Piel" },
  { id: "productosOrganicos", value: "bebidas-aloe", label: "Bebidas de Aloe" },







];


// Export alternativo (si necesitas lista plana)
export const subcategories = SUBCATEGORIES.map((cat) => ({
  id: cat.id,
  name: cat.label,
}));

export default SUBCATEGORIES;
