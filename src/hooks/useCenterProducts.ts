import { useEffect, useState } from "react";
import { CenterApiError, loadCenterProducts } from "../lib/centerApi";
import type { CenterProduct } from "../types/product";

export type CenterProductsError =
  | "missing-config"
  | "unauthorized"
  | "network"
  | "server";

interface CenterProductsState {
  products: CenterProduct[];
  loading: boolean;
  error: CenterProductsError | null;
}

export function useCenterProducts(
  token: string | null,
  onUnauthorized: () => void
) {
  const [state, setState] = useState<CenterProductsState>({
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
        const products = await loadCenterProducts(activeToken);

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

function getProductsError(error: unknown): CenterProductsError {
  if (error instanceof CenterApiError) {
    return error.type;
  }

  return "server";
}
