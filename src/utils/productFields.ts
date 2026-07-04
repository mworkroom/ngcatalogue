import { dictionary } from "../i18n";
import type {
  CatalogueProduct,
  Language,
  ProductColumn
} from "../types/product";
import { formatNumber } from "./formatNumber";

export function getColumnLabel(column: ProductColumn, language: Language) {
  return dictionary[language].columns[column];
}

export function getColumnClassName(_column: ProductColumn) {
  return "number-column";
}

export function formatProductColumn(
  product: CatalogueProduct,
  column: ProductColumn,
  language: Language
) {
  switch (column) {
    case "handling_fee":
      return formatNumber(
        "handling_fee" in product ? product.handling_fee : null,
        language
      );
    case "business_price":
      return formatNumber(product.business_price, language);
    case "consumer_price":
      return formatNumber(product.consumer_price, language);
    case "brazil_price":
      return formatNumber(product.brazil_price, language);
    case "brazil_pv":
      return formatNumber(
        "brazil_pv" in product ? product.brazil_pv : null,
        language
      );
  }
}
