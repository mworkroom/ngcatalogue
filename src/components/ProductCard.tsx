import { columnConfig } from "../config/catalog";
import type {
  CatalogueMode,
  CatalogueProduct,
  Language
} from "../types/product";
import {
  formatProductColumn,
  getColumnLabel
} from "../utils/productFields";
import { getProductName } from "../utils/productText";
import { SetBadge } from "./SetBadge";

interface ProductCardProps {
  mode: CatalogueMode;
  language: Language;
  product: CatalogueProduct;
}

export function ProductCard({ mode, language, product }: ProductCardProps) {
  const columns = columnConfig[mode];

  return (
    <details className={`product-card ${mode}-product-card`}>
      <summary>
        <span className="summary-name">
          {getProductName(product, language)}
          {product.is_set ? <SetBadge language={language} /> : null}
        </span>
        {mode === "public" ? (
          <span className="summary-price">
            {formatProductColumn(product, "business_price", language)}
          </span>
        ) : null}
      </summary>
      <div className="card-details">
        {columns.map((column) => (
          <div className="detail-row" key={column}>
            <span className="detail-label">
              {getColumnLabel(column, language)}
            </span>
            <span
              className={
                column === "memo" ? "detail-value text-value" : "detail-value"
              }
            >
              {formatProductColumn(product, column, language)}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}
