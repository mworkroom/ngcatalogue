import { Fragment } from "react";
import { dictionary } from "../../i18n";
import type { AdminProduct } from "../../types/product";
import { formatAdminNumber } from "./AdminProductTable";

interface AdminProductCardProps {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onRestore?: (product: AdminProduct) => void;
  restoreBusy?: boolean;
}

const adminDetailRows: Array<{
  key: keyof Pick<
    AdminProduct,
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
}> = [
  { key: "handling_fee" },
  { key: "business_price" },
  { key: "consumer_price" },
  { key: "brazil_price" },
  { key: "brazil_pv" },
  { key: "korea_price" },
  { key: "korea_pv" },
  { key: "weight" },
  { key: "pack_quantity" }
];

export function AdminProductCard({
  product,
  onEdit,
  onRestore,
  restoreBusy = false
}: AdminProductCardProps) {
  const adminText = dictionary.ko.admin;

  return (
    <details className="product-card admin-product-card">
      <summary>
        <span className="summary-name">
          <span className="product-name">{product.name_ko}</span>
        </span>
        <span className="summary-price">
          {formatAdminNumber(product.consumer_price)}
        </span>
      </summary>
      <div className="card-details">
        <div className="detail-row admin-portuguese-row">
          <span className="detail-label">{adminText.fields.name_pt}</span>
          <span className="detail-value admin-portuguese-name">
            {product.name_pt || "-"}
          </span>
        </div>
        {adminDetailRows.map((row) => (
          <Fragment key={row.key}>
            <div className="detail-row">
              <span className="detail-label">{adminText.fields[row.key]}</span>
              <span className="detail-value">
                {formatAdminNumber(product[row.key])}
              </span>
            </div>
            {row.key === "brazil_pv" ? (
              <div className="admin-detail-divider" aria-hidden="true" />
            ) : null}
          </Fragment>
        ))}
        <div className="detail-row">
          <span className="detail-label">{adminText.fields.is_set}</span>
          <span className="detail-value">
            {product.is_set ? adminText.yes : adminText.no}
          </span>
        </div>
        <div className="detail-row admin-memo-row">
          <span className="detail-label">{adminText.fields.memo}</span>
          <span className="detail-value">{product.memo || "-"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">{adminText.fields.updated_at}</span>
          <span className="detail-value">
            {formatAdminDate(product.updated_at)}
          </span>
        </div>
        <div className="admin-product-card-actions">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => onEdit(product)}
          >
            {adminText.edit}
          </button>
          {onRestore ? (
            <button
              type="button"
              className="admin-button admin-button-primary"
              disabled={restoreBusy}
              onClick={() => onRestore(product)}
            >
              {restoreBusy ? adminText.restoring : adminText.restore}
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}

function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}
