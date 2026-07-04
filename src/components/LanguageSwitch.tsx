import { dictionary } from "../i18n";
import type { Language } from "../types/product";

interface LanguageSwitchProps {
  language: Language;
  onChange: (language: Language) => void;
}

export function LanguageSwitch({ language, onChange }: LanguageSwitchProps) {
  const label = dictionary[language].language;

  return (
    <div className="language-switch" aria-label={label}>
      <button
        type="button"
        className={language === "pt" ? "active" : ""}
        aria-pressed={language === "pt"}
        onClick={() => onChange("pt")}
      >
        PT
      </button>
      <button
        type="button"
        className={language === "ko" ? "active" : ""}
        aria-pressed={language === "ko"}
        onClick={() => onChange("ko")}
      >
        한국어
      </button>
    </div>
  );
}
