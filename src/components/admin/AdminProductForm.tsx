import { useEffect, useState } from "react";
import type { AdminProduct, AdminProductInput } from "../../types/product";

interface AdminProductFormProps {
  busy: boolean;
  product: AdminProduct | null;
  onCancel: () => void;
  onHide?: (product: AdminProduct) => void;
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
  label: string;
  step: string;
}> = [
  { key: "handling_fee", label: "취급 수수료", step: "0.01" },
  { key: "business_price", label: "사업자 가격", step: "0.01" },
  { key: "consumer_price", label: "소비자 가격", step: "0.01" },
  { key: "brazil_price", label: "브라질 사이트 가격", step: "0.01" },
  { key: "brazil_pv", label: "브라질 PV", step: "0.01" },
  { key: "korea_price", label: "한국 가격", step: "0.01" },
  { key: "korea_pv", label: "한국 PV", step: "0.01" },
  { key: "weight", label: "무게", step: "0.01" },
  { key: "pack_quantity", label: "수량", step: "1" }
];

export function AdminProductForm({
  busy,
  product,
  onCancel,
  onHide,
  onSubmit
}: AdminProductFormProps) {
  const [state, setState] = useState<ProductFormState>(() =>
    getInitialState(product)
  );
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setState(getInitialState(product));
    setValidationError("");
  }, [product]);

  const title = product ? "상품 수정" : "새 상품 추가";

  return (
    <section className="admin-editor" aria-labelledby="admin-editor-title">
      <div className="admin-editor-heading">
        <div>
          <h2 id="admin-editor-title">{title}</h2>
          {!product ? <p>새 상품 정보를 입력하세요.</p> : null}
        </div>
        <button
          type="button"
          className="admin-button admin-button-secondary"
          disabled={busy}
          onClick={onCancel}
        >
          닫기
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
              error instanceof Error ? error.message : "입력값을 확인해 주세요."
            );
          }
        }}
      >
        <label>
          <span>한국어 상품명 *</span>
          <input
            value={state.name_ko}
            type="text"
            autoComplete="off"
            required
            onChange={(event) =>
              setState((current) => ({
                ...current,
                name_ko: event.target.value
              }))
            }
          />
        </label>

        <label>
          <span>포르투갈어 상품명</span>
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
              <span>{field.label}</span>
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
            <span>세트 상품</span>
          </label>
          <label>
            <input
              checked={state.is_visible}
              type="checkbox"
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  is_visible: event.target.checked
                }))
              }
            />
            <span>가격표에 표시</span>
          </label>
        </div>

        <label>
          <span>메모</span>
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
            {busy ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            className="admin-button admin-button-secondary"
            disabled={busy}
            onClick={onCancel}
          >
            취소
          </button>
          {product?.is_visible && onHide ? (
            <button
              type="button"
              className="admin-button admin-button-danger"
              disabled={busy}
              onClick={() => onHide(product)}
            >
              상품 숨기기
            </button>
          ) : null}
        </div>
      </form>
    </section>
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
  const nameKo = state.name_ko.trim();

  if (!nameKo) {
    throw new Error("한국어 상품명을 입력해 주세요.");
  }

  return {
    name_ko: nameKo,
    name_pt: state.name_pt.trim(),
    handling_fee: parseNullableNumber(state.handling_fee, "취급 수수료"),
    business_price: parseNullableNumber(state.business_price, "사업자 가격"),
    consumer_price: parseNullableNumber(state.consumer_price, "소비자 가격"),
    brazil_price: parseNullableNumber(state.brazil_price, "브라질 사이트 가격"),
    brazil_pv: parseNullableNumber(state.brazil_pv, "브라질 PV"),
    korea_price: parseNullableNumber(state.korea_price, "한국 가격"),
    korea_pv: parseNullableNumber(state.korea_pv, "한국 PV"),
    weight: parseNullableNumber(state.weight, "무게"),
    pack_quantity: parseNullableInteger(state.pack_quantity, "수량"),
    is_set: state.is_set,
    is_visible: state.is_visible,
    memo: state.memo.trim() || null
  };
}

function toInputValue(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function parseNullableNumber(value: string, label: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const number = Number(trimmed);

  if (!Number.isFinite(number)) {
    throw new Error(`${label} 숫자를 확인해 주세요.`);
  }

  return number;
}

function parseNullableInteger(value: string, label: string) {
  const number = parseNullableNumber(value, label);

  if (number === null) {
    return null;
  }

  if (!Number.isInteger(number)) {
    throw new Error(`${label}은 정수로 입력해 주세요.`);
  }

  return number;
}
