import { useEffect, useState } from "react";
import { dictionary } from "../../i18n";
import type { AdminProduct, AdminProductInput } from "../../types/product";

interface AdminProductFormProps {
  busy: boolean;
  product: AdminProduct | null;
  onCancel: () => void;
  onHide?: (product: AdminProduct) => void;
  onRestore?: (product: AdminProduct) => void;
  onSubmit: (input: AdminProductInput) => Promise<void>;
}

interface ProductFormState {
  name_ko: string;
  name_pt: string;
  handling_fee: string;
  business_price: string;
  consumer_price: string;
  brazil_price: string;
  brazil_pv: string;
  korea_price: string;
  korea_pv: string;
  weight: string;
  pack_quantity: string;
  is_set: boolean;
  is_visible: boolean;
  memo: string;
}

const numericFieldLabels: Array<{
  key: keyof Pick<
    ProductFormState,
    | "handling_fee"
    | "business_price"
    | "consumer_price"
    | "brazil_price"
    | "brazil_pv"
    | "korea_price"
    | "korea_pv"
    | "weight"
    | "pack_quantity"
  >;
  step: string;
}> = [
  { key: "handling_fee", step: "0.01" },
  { key: "business_price", step: "0.01" },
  { key: "consumer_price", step: "0.01" },
  { key: "brazil_price", step: "0.01" },
  { key: "brazil_pv", step: "0.01" },
  { key: "korea_price", step: "0.01" },
  { key: "korea_pv", step: "0.01" },
  { key: "weight", step: "0.01" },
  { key: "pack_quantity", step: "1" }
];

export function AdminProductForm({
  busy,
  product,
  onCancel,
  onHide,
  onRestore,
  onSubmit
}: AdminProductFormProps) {
  const adminText = dictionary.ko.admin;
  const [state, setState] = useState<ProductFormState>(() =>
    getInitialState(product)
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setState(getInitialState(product));
    setValidationError("");
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel]);

  const title = product ? adminText.editProduct : adminText.newProduct;

  return (
    <div
      className="admin-editor-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <section
        className="admin-editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-editor-heading">
          <div>
            <h2 id="admin-editor-title">{title}</h2>
            {!product ? <p>{adminText.newProductDescription}</p> : null}
          </div>
          <button
            type="button"
            className="admin-editor-close"
            aria-label={dictionary.ko.close}
            disabled={busy}
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form
          className="admin-product-form"
          onSubmit={(event) => {
            event.preventDefault();
            setValidationError("");

            try {
              const input = toProductInput(state);
              void onSubmit(input).catch(() => {
                // Parent state keeps the form open and shows the readable error.
              });
            } catch (error) {
              setValidationError(
                error instanceof Error ? error.message : adminText.validationFallback
              );
            }
          }}
        >
          <label>
            <span>{adminText.fields.name_ko} *</span>
            <input
              value={state.name_ko}
              type="text"
              autoComplete="off"
              required
              autoFocus
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  name_ko: event.target.value
                }))
              }
            />
          </label>

          <label>
            <span>{adminText.fields.name_pt}</span>
            <input
              value={state.name_pt}
              type="text"
              autoComplete="off"
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  name_pt: event.target.value
                }))
              }
            />
          </label>

          <div className="admin-form-grid">
            {numericFieldLabels.map((field) => (
              <label key={field.key}>
                <span>{adminText.fields[field.key]}</span>
                <input
                  value={state[field.key]}
                  type="number"
                  inputMode="decimal"
                  min={field.key === "pack_quantity" ? "1" : undefined}
                  step={field.step}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      [field.key]: event.target.value
                    }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="admin-switch-row">
            <label>
              <input
                checked={state.is_set}
                type="checkbox"
                onChange={(event) =>
                  setState((current) => ({
                    ...current,
                    is_set: event.target.checked
                  }))
                }
              />
              <span>{adminText.fields.is_set}</span>
            </label>
          </div>

          <label>
            <span>{adminText.fields.memo}</span>
            <textarea
              value={state.memo}
              rows={4}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  memo: event.target.value
                }))
              }
            />
          </label>

          {validationError ? (
            <p className="access-message" role="alert">
              {validationError}
            </p>
          ) : null}

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-button admin-button-primary"
              disabled={busy}
            >
              {busy ? adminText.saving : adminText.save}
            </button>
            <button
              type="button"
              className="admin-button admin-button-secondary"
              disabled={busy}
              onClick={onCancel}
            >
              {adminText.cancel}
            </button>
            {product?.is_visible && onHide ? (
              <button
                type="button"
                className="admin-button admin-button-danger"
                disabled={busy}
                onClick={() => onHide(product)}
              >
                {adminText.hide}
              </button>
            ) : null}
            {product && !product.is_visible && onRestore ? (
              <button
                type="button"
                className="admin-button admin-button-primary"
                disabled={busy}
                onClick={() => onRestore(product)}
              >
                {adminText.showAgain}
              </button>
            ) : null}
          </div>
        </form>
      </section>
    </div>
  );
}

function getInitialState(product: AdminProduct | null): ProductFormState {
  return {
    name_ko: product?.name_ko ?? "",
    name_pt: product?.name_pt ?? "",
    handling_fee: toInputValue(product?.handling_fee),
    business_price: toInputValue(product?.business_price),
    consumer_price: toInputValue(product?.consumer_price),
    brazil_price: toInputValue(product?.brazil_price),
    brazil_pv: toInputValue(product?.brazil_pv),
    korea_price: toInputValue(product?.korea_price),
    korea_pv: toInputValue(product?.korea_pv),
    weight: toInputValue(product?.weight),
    pack_quantity: toInputValue(product?.pack_quantity),
    is_set: product?.is_set ?? false,
    is_visible: product?.is_visible ?? true,
    memo: product?.memo ?? ""
  };
}

function toProductInput(state: ProductFormState): AdminProductInput {
  const adminText = dictionary.ko.admin;
  const nameKo = state.name_ko.trim();

  if (!nameKo) {
    throw new Error(adminText.requiredName);
  }

  return {
    name_ko: nameKo,
    name_pt: state.name_pt.trim(),
    handling_fee: parseNullableNumber(
      state.handling_fee,
      adminText.fields.handling_fee
    ),
    business_price: parseNullableNumber(
      state.business_price,
      adminText.fields.business_price
    ),
    consumer_price: parseNullableNumber(
      state.consumer_price,
      adminText.fields.consumer_price
    ),
    brazil_price: parseNullableNumber(
      state.brazil_price,
      adminText.fields.brazil_price
    ),
    brazil_pv: parseNullableNumber(
      state.brazil_pv,
      adminText.fields.brazil_pv
    ),
    korea_price: parseNullableNumber(
      state.korea_price,
      adminText.fields.korea_price
    ),
    korea_pv: parseNullableNumber(state.korea_pv, adminText.fields.korea_pv),
    weight: parseNullableNumber(state.weight, adminText.fields.weight),
    pack_quantity: parseNullableInteger(
      state.pack_quantity,
      adminText.fields.pack_quantity
    ),
    is_set: state.is_set,
    is_visible: state.is_visible,
    memo: state.memo.trim() || null
  };
}

function toInputValue(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function parseNullableNumber(value: string, label: string) {
  const adminText = dictionary.ko.admin;
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const number = Number(trimmed);

  if (!Number.isFinite(number)) {
    throw new Error(adminText.numberError(label));
  }

  return number;
}

function parseNullableInteger(value: string, label: string) {
  const adminText = dictionary.ko.admin;
  const number = parseNullableNumber(value, label);

  if (number === null) {
    return null;
  }

  if (!Number.isInteger(number)) {
    throw new Error(adminText.integerError(label));
  }

  return number;
}
