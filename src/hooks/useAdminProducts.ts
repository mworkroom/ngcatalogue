import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminProduct,
  listAdminProducts,
  setAdminProductVisibility,
  updateAdminProduct
} from "../lib/adminProducts";
import type { AdminProduct, AdminProductInput } from "../types/product";

type ProductAction = "idle" | "creating" | "saving" | "hiding" | "restoring";

export function useAdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ProductAction>("idle");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const sortedProducts = useMemo(() => sortAdminProducts(products), [products]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextProducts = await listAdminProducts();
      setProducts(nextProducts);
    } catch (loadError) {
      console.error(loadError);
      setError(getAdminProductErrorMessage(loadError, "상품을 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const createProduct = useCallback(async (input: AdminProductInput) => {
    setAction("creating");
    setError(null);
    setFeedback(null);

    try {
      const createdProduct = await createAdminProduct(input);
      setProducts((currentProducts) => [createdProduct, ...currentProducts]);
      setFeedback("새 상품을 추가했습니다.");
      return createdProduct;
    } catch (createError) {
      console.error(createError);
      setError(getAdminProductErrorMessage(createError, "상품을 추가하지 못했습니다."));
      throw createError;
    } finally {
      setAction("idle");
    }
  }, []);

  const updateProduct = useCallback(
    async (productId: string, input: AdminProductInput) => {
      setAction("saving");
      setError(null);
      setFeedback(null);

      try {
        const updatedProduct = await updateAdminProduct(productId, input);
        setProducts((currentProducts) =>
          replaceProduct(currentProducts, updatedProduct)
        );
        setFeedback("상품 정보를 저장했습니다.");
        return updatedProduct;
      } catch (updateError) {
        console.error(updateError);
        setError(
          getAdminProductErrorMessage(updateError, "상품 정보를 저장하지 못했습니다.")
        );
        throw updateError;
      } finally {
        setAction("idle");
      }
    },
    []
  );

  const hideProduct = useCallback(async (productId: string) => {
    setAction("hiding");
    setError(null);
    setFeedback(null);

    try {
      const hiddenProduct = await setAdminProductVisibility(productId, false);
      setProducts((currentProducts) => replaceProduct(currentProducts, hiddenProduct));
      setFeedback("상품을 가격표에서 숨겼습니다.");
      return hiddenProduct;
    } catch (hideError) {
      console.error(hideError);
      setError(getAdminProductErrorMessage(hideError, "상품을 숨기지 못했습니다."));
      throw hideError;
    } finally {
      setAction("idle");
    }
  }, []);

  const restoreProduct = useCallback(async (productId: string) => {
    setAction("restoring");
    setError(null);
    setFeedback(null);

    try {
      const restoredProduct = await setAdminProductVisibility(productId, true);
      setProducts((currentProducts) =>
        replaceProduct(currentProducts, restoredProduct)
      );
      setFeedback("상품을 복구했습니다.");
      return restoredProduct;
    } catch (restoreError) {
      console.error(restoreError);
      setError(getAdminProductErrorMessage(restoreError, "상품을 복구하지 못했습니다."));
      throw restoreError;
    } finally {
      setAction("idle");
    }
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  return {
    action,
    clearFeedback,
    createProduct,
    error,
    feedback,
    hideProduct,
    loading,
    products: sortedProducts,
    restoreProduct,
    updateProduct
  };
}

function replaceProduct(products: AdminProduct[], product: AdminProduct) {
  const exists = products.some((currentProduct) => currentProduct.id === product.id);

  if (!exists) {
    return [product, ...products];
  }

  return products.map((currentProduct) =>
    currentProduct.id === product.id ? product : currentProduct
  );
}

function sortAdminProducts(products: AdminProduct[]) {
  return [...products].sort((first, second) =>
    first.name_ko.localeCompare(second.name_ko, "ko-KR")
  );
}

function getAdminProductErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return `${fallback} ${error.message}`;
  }

  if (typeof error === "object" && error && "message" in error) {
    const message = String((error as { message?: unknown }).message ?? "");
    return message ? `${fallback} ${message}` : fallback;
  }

  return fallback;
}
