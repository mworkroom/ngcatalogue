import type { AdminProduct } from "../../types/product";
import { QuantityBadge } from "../QuantityBadge";
import { SetBadge } from "../SetBadge";

interface AdminProductTableProps {
  emptyMessage: string;
  products: AdminProduct[];
  restoreBusy?: boolean;
  showRestore?: boolean;
  onEdit: (product: AdminProduct) => void;
  onRestore?: (product: AdminProduct) => void;
}

export function AdminProductTable({
  emptyMessage,
  products,
  restoreBusy = false,
  showRestore = false,
  onEdit,
  onRestore
}: AdminProductTableProps) {
  return (
    <section className="table-card center-table-card admin-product-table-card">
      <table className="center-table admin-product-table">
        <thead>
          <tr>
            <th className="name-column">한국어 상품명</th>
            <th>포르투갈어 상품명</th>
            <th className="number-column">취급 수수료</th>
            <th className="number-column">사업자 가격</th>
            <th className="number-column">소비자 가격</th>
            <th className="number-column">브라질 사이트 가격</th>
            <th className="number-column">브라질 PV</th>
            <th className="number-column">한국 가격</th>
            <th className="number-column">한국 PV</th>
            <th className="number-column">무게</th>
            <th className="number-column">수량</th>
            <th>세트 상품</th>
            <th>메모</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="name-column">
                <strong>{product.name_ko}</strong>
              </td>
              <td>{product.name_pt || "-"}</td>
              <td className="number-column">
                {formatAdminNumber(product.handling_fee)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.business_price)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.consumer_price)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.brazil_price)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.brazil_pv)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.korea_price)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.korea_pv)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.weight)}
              </td>
              <td className="number-column">
                {formatAdminNumber(product.pack_quantity)}
              </td>
              <td>
                {product.is_set ? <SetBadge language="ko" /> : "-"}
              </td>
              <td className="admin-memo-cell">{product.memo || "-"}</td>
              <td>
                <div className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-button admin-button-secondary"
                    onClick={() => onEdit(product)}
                  >
                    수정
                  </button>
                  {showRestore && onRestore ? (
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {products.length === 0 ? (
        <div className="empty">{emptyMessage}</div>
      ) : null}
    </section>
  );
}

export function AdminProductBadges({ product }: { product: AdminProduct }) {
  const hasQuantityBadge = Boolean(
    product.pack_quantity && product.pack_quantity > 1
  );

  if (!product.is_set && !hasQuantityBadge) {
    return null;
  }

  return (
    <span className="product-badges">
      {product.is_set ? <SetBadge language="ko" /> : null}
      <QuantityBadge quantity={product.pack_quantity} />
    </span>
  );
}

export function formatAdminNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2
  }).format(value);
}
