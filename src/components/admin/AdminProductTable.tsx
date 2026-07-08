import { dictionary } from "../../i18n";
import type { AdminProduct } from "../../types/product";

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
        <colgroup>
          <col className="admin-name-ko-col" />
          <col className="admin-name-pt-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-number-col" />
          <col className="admin-memo-col" />
          <col className="admin-manage-col" />
        </colgroup>
        <thead>
          <tr>
            <th className="name-column">{adminText.fields.name_ko}</th>
            <th className="admin-text-column">{adminText.fields.name_pt}</th>
            <th className="number-column">{adminText.fields.handling_fee}</th>
            <th className="number-column">{adminText.fields.business_price}</th>
            <th className="number-column">{adminText.fields.consumer_price}</th>
            <th className="number-column">{adminText.fields.brazil_price}</th>
            <th className="number-column">{adminText.fields.brazil_pv}</th>
            <th className="number-column">{adminText.fields.korea_price}</th>
            <th className="number-column">{adminText.fields.korea_pv}</th>
            <th className="number-column">{adminText.fields.weight}</th>
            <th className="admin-memo-cell">{adminText.fields.memo}</th>
            <th className="admin-manage-column">{adminText.manage}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="name-column">
                <strong>{product.name_ko}</strong>
              </td>
              <td className="admin-portuguese-name admin-text-column">
                {product.name_pt || "-"}
              </td>
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
              <td className="admin-memo-cell">{product.memo || "-"}</td>
              <td className="admin-manage-column">
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

export function formatAdminNumber(value: number | null) {
  if (value === null) {
    return "-";
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2
  }).format(value);
}
