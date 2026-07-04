import type { AdminProduct } from "../../types/product";
import { QuantityBadge } from "../QuantityBadge";
import { SetBadge } from "../SetBadge";

interface AdminProductCardProps {
  product: AdminProduct;
  onEdit: (product: AdminProduct) => void;
  onRestore?: (product: AdminProduct) => void;
  restoreBusy?: boolean;
}

export function AdminProductCard({
  product,
  onEdit,
  onRestore,
  restoreBusy = false
}: AdminProductCardProps) {
  const hasQuantityBadge = Boolean(
    product.pack_quantity && product.pack_quantity > 1
  );

  return (
    <article className="admin-product-card">
      <button
        type="button"
        className="admin-product-card-main"
        onClick={() => onEdit(product)}
      >
        <span className="admin-product-names">
          <strong>{product.name_ko}</strong>
          <span>{product.name_pt || "포르투갈어 상품명 없음"}</span>
        </span>
        <span className="admin-product-prices" aria-label="가격">
          <span>사업자 {formatAdminNumber(product.business_price)}</span>
          <span>소비자 {formatAdminNumber(product.consumer_price)}</span>
          <span>사이트 {formatAdminNumber(product.brazil_price)}</span>
        </span>
        {(product.is_set || hasQuantityBadge) ? (
          <span className="product-badges">
            {product.is_set ? <SetBadge language="ko" /> : null}
            <QuantityBadge quantity={product.pack_quantity} />
          </span>
        ) : null}
      </button>
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
    </article>
  );
}

function formatAdminNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2
  }).format(value);
}
