import type { ProductNameFields } from "../types/product";
import { normalizeText } from "./productText";

export function searchProducts<TProduct extends ProductNameFields>(
  products: TProduct[],
  query: string
) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    return (
      normalizeText(product.name_pt).includes(normalizedQuery) ||
      normalizeText(product.name_ko).includes(normalizedQuery)
    );
  });
}
