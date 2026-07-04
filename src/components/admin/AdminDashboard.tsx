import { useMemo, useState } from "react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import type { AdminProduct } from "../../types/product";
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
  const {
    action,
    clearFeedback,
    createProduct,
    error,
    feedback,
    hideProduct,
    loading,
    products,
    refresh,
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
    () => filterProducts(products.filter((product) => product.is_visible), query),
    [products, query]
  );
  const hiddenProducts = useMemo(
    () => filterProducts(products.filter((product) => !product.is_visible), query),
    [products, query]
  );
  const editorOpen = creating || selectedProduct !== null;
  const currentProducts = showHidden ? hiddenProducts : visibleProducts;
  const currentTitle = showHidden
    ? `숨긴 상품 ${hiddenProducts.length}개`
    : `등록된 상품 ${visibleProducts.length}개`;
  const currentEmptyMessage = showHidden
    ? "숨긴 상품이 없습니다."
    : "표시 중인 상품이 없습니다.";

  const closeEditor = () => {
    setCreating(false);
    setSelectedProduct(null);
  };

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <header className="topbar admin-topbar">
        <h1 id="admin-dashboard-title">애터미 가격표</h1>
        <div className="topbar-actions">
          <details className="topbar-menu">
            <summary aria-label="관리자 메뉴">⋮</summary>
            <div className="topbar-menu-panel">
              <button
                type="button"
                disabled={busy || actionBusy}
                onClick={onLogout}
              >
                로그아웃
              </button>
            </div>
          </details>
        </div>
      </header>

      <SearchBar
        value={query}
        label="한국어 또는 포르투갈어 상품명"
        printLabel="PDF 출력"
        onChange={setQuery}
        onPrint={() => window.print()}
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
          새 상품 추가
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
          {showHidden ? "등록된 상품 보기" : "숨긴 상품 보기"}
        </button>
        <button
          type="button"
          className="admin-button admin-button-secondary"
          disabled={loading}
          onClick={() => void refresh()}
        >
          새로고침
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
              const updatedProduct = await updateProduct(selectedProduct.id, input);
              setSelectedProduct(updatedProduct);
              return;
            }

            await createProduct(input);
            closeEditor();
          }}
        />
      ) : null}

      <section className="admin-section" aria-labelledby="admin-visible-title">
        <div className="admin-section-heading">
          <h2 id="admin-visible-title">{currentTitle}</h2>
        </div>
        {loading ? (
          <LoadingState message="상품을 불러오는 중..." />
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
          title="상품 숨기기"
          message="이 상품을 가격표에서 숨길까요? 데이터는 삭제되지 않으며 나중에 복구할 수 있습니다."
          confirmLabel="숨기기"
          cancelLabel="취소"
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
      <footer className="admin-session-footer">
        로그인한 아이디: {email || "관리자 계정"}
      </footer>
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
