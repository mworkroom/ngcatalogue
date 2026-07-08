import { columnConfig } from "../config/catalog";
import { dictionary } from "../i18n";
import type {
  CatalogueMode,
  CatalogueProduct,
  Language
} from "../types/product";
import {
  formatProductColumn,
  getColumnClassName,
  getColumnLabel
} from "../utils/productFields";
import { ProductName } from "./ProductName";

interface ProductTableProps {
  mode: CatalogueMode;
  language: Language;
  products: CatalogueProduct[];
  showEmpty: boolean;
}

export function ProductTable({
  mode,
  language,
  products,
  showEmpty
}: ProductTableProps) {
  const t = dictionary[language];
  const columns = columnConfig[mode];

  return (
    <section className={`table-card ${mode === "center" ? "center-table-card" : ""}`}>
      <table className={mode === "center" ? "center-table" : "public-table"}>
        <colgroup>
          <col className="catalogue-name-col" />
          {columns.map((column) => (
            <col
              key={column}
              className="catalogue-number-col"
              style={{ width: `${54 / columns.length}%` }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="name-column">{t.columns.productName}</th>
            {columns.map((column) => (
              <th key={column} className={getColumnClassName(column)}>
                {getColumnLabel(column, language)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="name-column">
                <ProductName product={product} language={language} />
              </td>
              {columns.map((column) => (
                <td key={column} className={getColumnClassName(column)}>
                  {formatProductColumn(product, column, language)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {showEmpty && products.length === 0 ? (
        <div className="empty">{t.empty}</div>
      ) : null}
    </section>
  );
}
