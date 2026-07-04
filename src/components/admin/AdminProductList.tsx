import type { AdminProduct } from "../../types/product";
import { AdminProductCard } from "./AdminProductCard";

interface AdminProductListProps {
  emptyMessage: string;
  products: AdminProduct[];
  restoreBusy?: boolean;
  onEdit: (product: AdminProduct) => void;
  onRestore?: (product: AdminProduct) => void;
}

export function AdminProductList({
  emptyMessage,
  products,
  restoreBusy = false,
  onEdit,
  onRestore
}: AdminProductListProps) {
  if (products.length === 0) {
    return <p className="admin-empty">{emptyMessage}</p>;
  }

  return (
    <div className="admin-product-list">
      {products.map((product) => (
        <AdminProductCard
          key={product.id}
          product={product}
          restoreBusy={restoreBusy}
          onEdit={onEdit}
          onRestore={onRestore}
        />
      ))}
    </div>
  );
}
