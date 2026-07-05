import { dictionary } from "../../i18n";
import type { AdminProduct } from "../../types/product";
import { AdminProductList } from "./AdminProductList";
import { AdminProductTable } from "./AdminProductTable";

interface AdminHiddenProductsProps {
  expanded: boolean;
  products: AdminProduct[];
  restoreBusy: boolean;
  onEdit: (product: AdminProduct) => void;
  onRestore: (product: AdminProduct) => void;
}

export function AdminHiddenProducts({
  expanded,
  products,
  restoreBusy,
  onEdit,
  onRestore
}: AdminHiddenProductsProps) {
  const adminText = dictionary.ko.admin;

  if (!expanded) {
    return null;
  }

  return (
    <section className="admin-section" aria-labelledby="admin-hidden-title">
      <div className="admin-section-heading">
        <div>
          <h2 className="admin-section-title" id="admin-hidden-title">
            {adminText.hiddenCount(products.length)}
          </h2>
        </div>
      </div>
      <AdminProductTable
        emptyMessage={adminText.emptyHidden}
        products={products}
        restoreBusy={restoreBusy}
        showRestore
        onEdit={onEdit}
        onRestore={onRestore}
      />
      <AdminProductList
        emptyMessage={adminText.emptyHidden}
        products={products}
        restoreBusy={restoreBusy}
        onEdit={onEdit}
        onRestore={onRestore}
      />
    </section>
  );
}
