import { dictionary } from "../../i18n";
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
  const adminText = dictionary.ko.admin;

  return (
    <section className="table-card center-table-card admin-product-table-card">
      <table className="center-table admin-product-table">
        <thead>
          <tr>
            <th className="name-column">{adminText.fields.name_ko}</th>
            <th>{adminText.fields.name_pt}</th>
            <th className="number-column">{adminText.fields.handling_fee}</th>
            <th className="number-column">{adminText.fields.business_price}</th>
            <th className="number-column">{adminText.fields.consumer_price}</th>
            <th className="number-column">{adminText.fields.brazil_price}</th>
            <th className="number-column">{adminText.fields.brazil_pv}</th>
            <th className="number-column">{adminText.fields.korea_price}</th>
            <th className="number-column">{adminText.fields.korea_pv}</th>
            <th className="number-column">{adminText.fields.weight}</th>
            <th className="number-column">{adminText.fields.pack_quantity}</th>
            <th>{adminText.fields.is_set}</th>
            <th>{adminText.fields.memo}</th>
            <th>{adminText.manage}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="name-column">
                <strong>{product.name_ko}</strong>
                <AdminProductBadges product={product} />
              </td>
              <td className="admin-portuguese-name">{product.name_pt || "-"}</td>
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
                    {adminText.edit}
                  </button>
                  {showRestore && onRestore ? (
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
