import { useMemo, useState } from "react";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import type { AdminProduct } from "../../types/product";
import { ErrorState } from "../ErrorState";
import { LoadingState } from "../LoadingState";
import { SearchBar } from "../SearchBar";
import { AdminConfirmDialog } from "./AdminConfirmDialog";
import { AdminHiddenProducts } from "./AdminHiddenProducts";
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

  const closeEditor = () => {
    setCreating(false);
    setSelectedProduct(null);
  };

  return (
    <section className="admin-dashboard" aria-labelledby="admin-dashboard-title">
      <header className="admin-dashboard-header">
        <div>
          <h1 id="admin-dashboard-title">상품 관리</h1>
          <p>{email || "관리자 계정"}</p>
        </div>
        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-button admin-button-primary"
            disabled={actionBusy}
            onClick={() => {
              clearFeedback();
              setCreating(true);
              setSelectedProduct(null);
            }}
          >
            새 상품 추가
          </button>
          <button
            type="button"
            className="admin-button admin-button-secondary"
            disabled={busy || actionBusy}
            onClick={onLogout}
          >
            로그아웃
          </button>
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
          className="admin-button admin-button-secondary"
          disabled={loading}
          onClick={() => void refresh()}
        >
          새로고침
        </button>
        <button
          type="button"
          className="admin-button admin-button-secondary"
          onClick={() => setShowHidden((current) => !current)}
        >
          숨긴 상품 {showHidden ? "닫기" : "보기"} ({hiddenProducts.length})
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
          <div>
            <h2 id="admin-visible-title">표시 중인 상품</h2>
            <p>{visibleProducts.length}개</p>
          </div>
        </div>
        {loading ? (
          <LoadingState message="상품을 불러오는 중..." />
        ) : (
          <>
            <AdminProductTable
              emptyMessage="표시 중인 상품이 없습니다."
              products={visibleProducts}
              onEdit={(product) => {
                clearFeedback();
                setCreating(false);
                setSelectedProduct(product);
              }}
            />
            <AdminProductList
              emptyMessage="표시 중인 상품이 없습니다."
              products={visibleProducts}
              onEdit={(product) => {
                clearFeedback();
                setCreating(false);
                setSelectedProduct(product);
              }}
            />
          </>
        )}
      </section>

      <AdminHiddenProducts
        expanded={showHidden}
        products={hiddenProducts}
        restoreBusy={action === "restoring"}
        onToggle={() => setShowHidden((current) => !current)}
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
