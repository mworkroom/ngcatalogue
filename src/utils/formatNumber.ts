import type { Language } from "../types/product";

export function formatNumber(value: unknown, language: Language) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
}
