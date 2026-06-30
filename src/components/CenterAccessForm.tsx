import { useState } from "react";
import { dictionary } from "../i18n";
import type { CenterSessionError } from "../hooks/useCenterSession";
import type { Language } from "../types/product";

interface CenterAccessFormProps {
  language: Language;
  validating: boolean;
  error: CenterSessionError | null;
  onSubmit: (code: string) => void;
}

export function CenterAccessForm({
  language,
  validating,
  error,
  onSubmit
}: CenterAccessFormProps) {
  const [code, setCode] = useState("");
  const t = dictionary[language];
  const canSubmit = /^\d{8}$/.test(code) && !validating;

  return (
    <section className="access-panel" aria-labelledby="center-access-title">
      <h2 id="center-access-title">{t.centerAccessTitle}</h2>
      <form
        className="access-form"
        onSubmit={(event) => {
          event.preventDefault();

          if (canSubmit) {
            onSubmit(code);
          }
        }}
      >
        <label htmlFor="center-code">{t.centerCodeLabel}</label>
        <input
          id="center-code"
          value={code}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          autoComplete="one-time-code"
          aria-invalid={Boolean(error)}
          onChange={(event) =>
            setCode(event.target.value.replace(/\D/g, "").slice(0, 8))
          }
        />
        <button type="submit" disabled={!canSubmit}>
          {validating ? t.centerValidating : t.centerLoginButton}
        </button>
      </form>
      {error ? (
        <p className="access-message" role="alert">
          {getCenterSessionErrorMessage(error, language)}
        </p>
      ) : null}
    </section>
  );
}

function getCenterSessionErrorMessage(
  error: CenterSessionError,
  language: Language
) {
  const t = dictionary[language];

  switch (error) {
    case "invalid-code":
      return t.invalidAccessCode;
    case "expired-session":
      return t.expiredCenterSession;
    case "missing-config":
      return t.setup;
    case "network":
      return t.centerNetworkError;
    case "server":
      return t.centerServerError;
  }
}
