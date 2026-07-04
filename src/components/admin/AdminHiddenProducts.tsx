import type { AdminProduct } from "../../types/product";
import { AdminProductList } from "./AdminProductList";
import { AdminProductTable } from "./AdminProductTable";

interface AdminHiddenProductsProps {
  expanded: boolean;
  products: AdminProduct[];
  restoreBusy: boolean;
  onEdit: (product: AdminProduct) => void;
  onRestore: (product: AdminProduct) => void;
  onToggle: () => void;
}

export function AdminHiddenProducts({
  expanded,
  products,
  restoreBusy,
  onEdit,
  onRestore,
  onToggle
}: AdminHiddenProductsProps) {
  return (
    <section className="admin-section" aria-labelledby="admin-hidden-title">
      <div className="admin-section-heading">
        <div>
          <h2 id="admin-hidden-title">숨긴 상품</h2>
          <p>{products.length}개</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button-secondary"
          onClick={onToggle}
        >
          {expanded ? "숨기기" : "보기"}
        </button>
      </div>
      {expanded ? (
        <>
          <AdminProductTable
            emptyMessage="숨긴 상품이 없습니다."
            products={products}
            restoreBusy={restoreBusy}
            showRestore
            onEdit={onEdit}
            onRestore={onRestore}
          />
          <AdminProductList
            emptyMessage="숨긴 상품이 없습니다."
            products={products}
            restoreBusy={restoreBusy}
            onEdit={onEdit}
            onRestore={onRestore}
          />
        </>
      ) : null}
    </section>
  );
}
