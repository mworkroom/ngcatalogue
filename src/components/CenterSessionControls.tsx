import { dictionary } from "../i18n";
import type { Language } from "../types/product";

interface CenterSessionControlsProps {
  language: Language;
  onLogout: () => void;
}

export function CenterSessionControls({
  language,
  onLogout
}: CenterSessionControlsProps) {
  return (
    <button type="button" className="logout-button" onClick={onLogout}>
      {dictionary[language].centerLogout}
    </button>
  );
}
