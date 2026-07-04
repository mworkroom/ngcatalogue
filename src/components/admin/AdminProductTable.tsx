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
    <section className="admin-product-table-card">
      <table className="admin-product-table">
        <thead>
          <tr>
            <th className="name-column">상품명</th>
            <th>포르투갈어</th>
            <th className="number-column">취급</th>
            <th className="number-column">사업자</th>
            <th className="number-column">소비자</th>
            <th className="number-column">사이트</th>
            <th className="number-column">PV</th>
            <th>구성</th>
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
              <td>
                <span className="product-badges">
                  {product.is_set ? <SetBadge language="ko" /> : null}
                  <QuantityBadge quantity={product.pack_quantity} />
                </span>
              </td>
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

function formatAdminNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2
  }).format(value);
}
