import { dictionary } from "../i18n";
import type {
  CatalogueMode,
  CatalogueProduct,
  Language
} from "../types/product";
import { ProductCard } from "./ProductCard";

interface ProductCardListProps {
  mode: CatalogueMode;
  language: Language;
  products: CatalogueProduct[];
  showEmpty: boolean;
}

export function ProductCardList({
  mode,
  language,
  products,
  showEmpty
}: ProductCardListProps) {
  const t = dictionary[language];

  if (showEmpty && products.length === 0) {
    return (
      <section className="mobile-list">
        <div className="empty">{t.empty}</div>
      </section>
    );
  }

  return (
    <section className="mobile-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          mode={mode}
          product={product}
          language={language}
        />
      ))}
    </section>
  );
}
