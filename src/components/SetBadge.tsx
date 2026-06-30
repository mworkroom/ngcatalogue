import { dictionary } from "../i18n";
import type { Language } from "../types/product";

interface SetBadgeProps {
  language: Language;
}

export function SetBadge({ language }: SetBadgeProps) {
  return <span className="set-badge">{dictionary[language].set}</span>;
}
