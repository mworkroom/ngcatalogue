import { useMemo, useState } from "react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { dictionary } from "../../i18n";
import type { AdminProduct } from "../../types/product";
import { printCatalogue } from "../../utils/printCatalogue";
import { sortProducts } from "../../utils/productSort";
import { ErrorState } from "../ErrorState";
import { LoadingState } from "../LoadingState";
import { SearchBar } from "../SearchBar";
import { AdminConfirmDialog } from "./AdminConfirmDialog";
import { AdminProductForm } from "./AdminProductForm";
import { AdminProductList } from "./AdminProductList";
import { AdminProductTable } from "./AdminProductTable";

interface AdminDashboardProps {
  busy: boolean;
  email: string;
  onLogout: () => void;
}

export function AdminDashboard({
  busy,
  email,
  onLogout
}: AdminDashboardProps) {
  const t = dictionary.ko;
  const adminText = t.admin;
  const {
    action,
    clearFeedback,
    createProduct,
    error,
    feedback,
    hideProduct,
    loading,
    products,
    restoreProduct,
    updateProduct
  } = useAdminProducts();
  const [query, setQuery] = useState("");
  const [showHidden, setShowHidden] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null
  );
  const [hideTarget, setHideTarget] = useState<AdminProduct | null>(null);
  const actionBusy = action !== "idle";

  const visibleProducts = useMemo(
    () =>
      sortProducts(
        filterProducts(products.filter((product) => product.is_visible), query),
        "ko",
        query
      ),
    [products, query]
  );
  const hiddenProducts = useMemo(
    () =>
      sortProducts(
        filterProducts(products.filter((product) => !product.is_visible), query),
        "ko",
        query
      ),
    [products, query]
  );
  const editorOpen = creating || selectedProduct !== null;
  const currentProducts = showHidden ? hiddenProducts : visibleProducts;
  const currentTitle = showHidden
    ? adminText.hiddenCount(hiddenProducts.length)
    : adminText.visibleCount(visibleProducts.length);
  const currentEmptyMessage = showHidden
    ? adminText.emptyHidden
    : adminText.emptyVisible;

  const closeEditor = () => {
    setCreating(false);
    setSelectedProduct(null);
  };

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <header className="topbar admin-topbar">
        <h1 id="admin-dashboard-title">{t.title}</h1>
        <div className="topbar-actions">
          <details className="topbar-menu">
            <summary aria-label={adminText.menu}>
              <span aria-hidden="true">⚙</span>
            </summary>
            <div className="topbar-menu-panel">
              <p className="topbar-menu-account">
                <span>{adminText.loggedInEmail}</span>
                <strong>{email || adminText.fallbackAccount}</strong>
              </p>
              <button
                type="button"
                disabled={busy || actionBusy}
                onClick={onLogout}
              >
                {adminText.logout}
              </button>
            </div>
          </details>
        </div>
      </header>

      <SearchBar
        value={query}
        label={adminText.searchLabel}
        printLabel={t.print}
        printLargeLabel={t.printLarge}
        onChange={setQuery}
        onPrint={() => printCatalogue("default")}
        onPrintLarge={() => printCatalogue("large")}
      />

      <div className="admin-toolbar">
        <button
          type="button"
          className="admin-button admin-button-primary"
          disabled={actionBusy}
          onClick={() => {
            clearFeedback();
            setSelectedProduct(null);
            setCreating((current) => !current);
          }}
        >
          {adminText.newProduct}
        </button>
        <button
          type="button"
          className="admin-button admin-button-secondary"
          onClick={() => {
            clearFeedback();
            closeEditor();
            setShowHidden((current) => !current);
          }}
        >
          {showHidden ? adminText.showVisible : adminText.showHidden}
        </button>
      </div>

      {feedback ? (
        <p className="admin-feedback" role="status">
          {feedback}
        </p>
      ) : null}
      {error ? <ErrorState message={error} /> : null}

      {editorOpen ? (
        <AdminProductForm
          busy={actionBusy}
          product={selectedProduct}
          onCancel={closeEditor}
          onHide={(product) => setHideTarget(product)}
          onRestore={(product) => {
            void restoreProduct(product.id).then(() => {
              closeEditor();
              setShowHidden(false);
            }).catch(() => {
              // Error text is surfaced by the hook.
            });
          }}
          onSubmit={async (input) => {
            if (selectedProduct) {
              await updateProduct(selectedProduct.id, input);
              closeEditor();
              return;
            }

            await createProduct(input);
            closeEditor();
          }}
        />
      ) : null}

      <section className="admin-section" aria-labelledby="admin-visible-title">
        <div className="admin-section-heading">
          <h2 className="admin-section-title" id="admin-visible-title">
            {currentTitle}
          </h2>
        </div>
        {loading ? (
          <LoadingState message={adminText.loadingProducts} />
        ) : (
          <>
            <AdminProductTable
              emptyMessage={currentEmptyMessage}
              products={currentProducts}
              restoreBusy={action === "restoring"}
              showRestore={showHidden}
              onEdit={(product) => {
                clearFeedback();
                setCreating(false);
                setSelectedProduct(product);
              }}
              onRestore={(product) => {
                void restoreProduct(product.id).catch(() => {
                  // Error text is surfaced by the hook.
                });
              }}
            />
            <AdminProductList
              emptyMessage={currentEmptyMessage}
              products={currentProducts}
              restoreBusy={action === "restoring"}
              onEdit={(product) => {
                clearFeedback();
                setCreating(false);
                setSelectedProduct(product);
              }}
              onRestore={showHidden ? (product) => {
                void restoreProduct(product.id).catch(() => {
                  // Error text is surfaced by the hook.
                });
              } : undefined}
            />
          </>
        )}
      </section>

      {hideTarget ? (
        <AdminConfirmDialog
          busy={action === "hiding"}
          title={adminText.hideDialogTitle}
          message={adminText.hideDialogMessage}
          confirmLabel={adminText.hide}
          cancelLabel={adminText.cancel}
          onCancel={() => setHideTarget(null)}
          onConfirm={() => {
            void hideProduct(hideTarget.id).then(() => {
              setHideTarget(null);
              closeEditor();
            }).catch(() => {
              // Error text is surfaced by the hook.
            });
          }}
        />
      ) : null}
    </section>
  );
}

function filterProducts(products: AdminProduct[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    const nameKo = product.name_ko.toLocaleLowerCase();
    const namePt = (product.name_pt ?? "").toLocaleLowerCase();
    return nameKo.includes(normalizedQuery) || namePt.includes(normalizedQuery);
  });
}
