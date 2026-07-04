import { useEffect, useState } from "react";
import { BusinessApiError, loadBusinessProducts } from "../lib/businessApi";
import type { BusinessProduct } from "../types/product";

export type BusinessProductsError =
  | "missing-config"
  | "unauthorized"
  | "network"
  | "server";

interface BusinessProductsState {
  products: BusinessProduct[];
  loading: boolean;
  error: BusinessProductsError | null;
}

export function useBusinessProducts(
  token: string | null,
  onUnauthorized: () => void
) {
  const [state, setState] = useState<BusinessProductsState>({
    products: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    if (!token) {
      setState({
        products: [],
        loading: false,
        error: null
      });
      return;
    }

    const activeToken = token;

    async function loadProducts() {
      setState({
        products: [],
        loading: true,
        error: null
      });

      try {
        const products = await loadBusinessProducts(activeToken);

        if (!isMounted) {
          return;
        }

        setState({
          products,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error(error);

        if (!isMounted) {
          return;
        }

        const errorType = getProductsError(error);

        if (errorType === "unauthorized") {
          onUnauthorized();
        }

        setState({
          products: [],
          loading: false,
          error: errorType
        });
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [onUnauthorized, token]);

  return state;
}

function getProductsError(error: unknown): BusinessProductsError {
  if (error instanceof BusinessApiError) {
    return error.type;
  }

  return "server";
}
