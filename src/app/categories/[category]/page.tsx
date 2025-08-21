import { notFound } from "next/navigation";
import CATEGORIES from "@/app/constants/categories";
import ProductsClient from "./ProductsClient";

// ✅ genera rutas estáticas para cada categoría
export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    category: cat.value,
  }));
}

export default function ProductsByCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const categoryInfo = CATEGORIES.find((c) => c.value === params.category);

  // si no existe la categoría -> 404
  if (!categoryInfo) {
    return notFound();
  }

  return <ProductsClient categoryInfo={categoryInfo} />;
}
