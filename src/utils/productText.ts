import type { Language, ProductNameFields } from "../types/product";

export function normalizeText(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLocaleLowerCase();
}

export function getProductName(product: ProductNameFields, language: Language) {
  if (language === "pt") {
    return product.name_pt?.trim() || product.name_ko?.trim() || "";
  }

  return product.name_ko?.trim() || product.name_pt?.trim() || "";
}
