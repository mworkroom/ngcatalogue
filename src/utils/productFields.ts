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

export function getColumnClassName(column: ProductColumn) {
  if (column === "memo") {
    return "text-column memo-column";
  }

  if (column === "updated_at") {
    return "text-column date-column";
  }

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
    case "korea_pv":
      return formatNumber(
        "korea_pv" in product ? product.korea_pv : null,
        language
      );
    case "korea_price":
      return formatNumber(
        "korea_price" in product ? product.korea_price : null,
        language
      );
    case "weight":
      return formatWeight("weight" in product ? product.weight : null, language);
    case "memo":
      return "memo" in product && product.memo?.trim()
        ? product.memo.trim()
        : "—";
    case "updated_at":
      return formatDate(
        "updated_at" in product ? product.updated_at : null,
        language
      );
  }
}

function formatWeight(value: unknown, language: Language) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return `${formatNumber(number, language)} g`;
}

function formatDate(value: string | null, language: Language) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(language === "pt" ? "pt-BR" : "ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}
