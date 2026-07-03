import type { CatalogueProduct, Language } from "../types/product";
import { getProductName } from "../utils/productText";
import { QuantityBadge } from "./QuantityBadge";
import { SetBadge } from "./SetBadge";

interface ProductNameProps {
  language: Language;
  product: CatalogueProduct;
  className?: string;
}

export function ProductName({
  language,
  product,
  className
}: ProductNameProps) {
  const rootClassName = ["product-name-line", className]
    .filter(Boolean)
    .join(" ");
  const hasQuantityBadge = Boolean(
    product.pack_quantity && product.pack_quantity > 1
  );
  const hasBadges = product.is_set || hasQuantityBadge;

  return (
    <span className={rootClassName}>
      <span className="product-name">{getProductName(product, language)}</span>
      {hasBadges ? (
        <span className="product-badges">
          {product.is_set ? <SetBadge language={language} /> : null}
          <QuantityBadge quantity={product.pack_quantity} />
        </span>
      ) : null}
    </span>
  );
}
