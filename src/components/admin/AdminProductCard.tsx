import type { AdminProduct } from "../../types/product";
import {
  AdminProductBadges,
  formatAdminNumber
} from "./AdminProductTable";

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
  label: string;
}> = [
  { key: "handling_fee", label: "취급 수수료" },
  { key: "business_price", label: "사업자 가격" },
  { key: "consumer_price", label: "소비자 가격" },
  { key: "brazil_price", label: "브라질 사이트 가격" },
  { key: "brazil_pv", label: "브라질 PV" },
  { key: "korea_price", label: "한국 가격" },
  { key: "korea_pv", label: "한국 PV" },
  { key: "weight", label: "무게" },
  { key: "pack_quantity", label: "수량" }
];

export function AdminProductCard({
  product,
  onEdit,
  onRestore,
  restoreBusy = false
}: AdminProductCardProps) {
  return (
    <details className="product-card admin-product-card">
      <summary>
        <span className="summary-name">
          <span className="product-name-line">
            <span className="product-name">{product.name_ko}</span>
            <AdminProductBadges product={product} />
          </span>
          <span className="admin-card-subtitle">
            {product.name_pt || "포르투갈어 상품명 없음"}
          </span>
        </span>
        <span className="summary-price">
          {formatAdminNumber(product.consumer_price)}
        </span>
      </summary>
      <div className="card-details">
        <div className="detail-row">
          <span className="detail-label">포르투갈어 상품명</span>
          <span className="detail-value">{product.name_pt || "-"}</span>
        </div>
        {adminDetailRows.map((row) => (
          <div className="detail-row" key={row.key}>
            <span className="detail-label">{row.label}</span>
            <span className="detail-value">
              {formatAdminNumber(product[row.key])}
            </span>
          </div>
        ))}
        <div className="detail-row">
          <span className="detail-label">세트 상품</span>
          <span className="detail-value">{product.is_set ? "예" : "아니오"}</span>
        </div>
        <div className="detail-row admin-memo-row">
          <span className="detail-label">메모</span>
          <span className="detail-value">{product.memo || "-"}</span>
        </div>
        <div className="admin-product-card-actions">
          <button
            type="button"
            className="admin-button admin-button-secondary"
            onClick={() => onEdit(product)}
          >
            수정
          </button>
          {onRestore ? (
            <button
              type="button"
              className="admin-button admin-button-primary"
              disabled={restoreBusy}
              onClick={() => onRestore(product)}
            >
              {restoreBusy ? "복구 중..." : "복구"}
            </button>
          ) : null}
        </div>
      </div>
    </details>
  );
}
