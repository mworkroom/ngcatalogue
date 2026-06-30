import { dictionary } from "../i18n";
import type { Language, ProductNameFields } from "../types/product";
import { getProductName, normalizeText } from "./productText";

export function sortProducts<TProduct extends ProductNameFields>(
  products: TProduct[],
  language: Language,
  query: string
) {
  const hasQuery = normalizeText(query).length > 0;

  return [...products].sort((first, second) => {
    if (hasQuery && Boolean(first.is_set) !== Boolean(second.is_set)) {
      return first.is_set ? -1 : 1;
    }

    return getProductName(first, language).localeCompare(
      getProductName(second, language),
      dictionary[language].locale,
      { sensitivity: "base", numeric: true }
    );
  });
}
