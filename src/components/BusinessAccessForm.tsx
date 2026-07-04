import { useState } from "react";
import { dictionary } from "../i18n";
import type { BusinessSessionError } from "../hooks/useBusinessSession";
import type { Language } from "../types/product";

interface BusinessAccessFormProps {
  language: Language;
  validating: boolean;
  error: BusinessSessionError | null;
  onSubmit: (code: string) => void;
}

export function BusinessAccessForm({
  language,
  validating,
  error,
  onSubmit
}: BusinessAccessFormProps) {
  const [code, setCode] = useState("");
  const t = dictionary[language];
  const canSubmit = /^\d{8}$/.test(code) && !validating;

  return (
    <section className="access-panel" aria-labelledby="business-access-title">
      <h2 id="business-access-title">{t.businessAccessTitle}</h2>
      <form
        className="access-form"
        onSubmit={(event) => {
          event.preventDefault();

          if (canSubmit) {
            onSubmit(code);
          }
        }}
      >
        <label htmlFor="business-code">{t.businessCodeLabel}</label>
        <input
          id="business-code"
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
          {validating ? t.businessValidating : t.businessLoginButton}
        </button>
      </form>
      {error ? (
        <p className="access-message" role="alert">
          {getBusinessSessionErrorMessage(error, language)}
        </p>
      ) : null}
      <p className="access-note">{t.installFreeNote}</p>
    </section>
  );
}

function getBusinessSessionErrorMessage(
  error: BusinessSessionError,
  language: Language
) {
  const t = dictionary[language];

  switch (error) {
    case "invalid-code":
      return t.invalidAccessCode;
    case "expired-session":
      return t.expiredBusinessSession;
    case "missing-config":
      return t.setup;
    case "network":
      return t.businessNetworkError;
    case "server":
      return t.businessServerError;
  }
}
