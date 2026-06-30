import { useEffect, useState } from "react";
import { PUBLIC_SELECT_COLUMNS, PUBLIC_VIEW } from "../config/catalog";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { PublicProduct } from "../types/product";

type ProductLoadError =
  | { type: "missing-config" }
  | { type: "load-error"; message: string };

interface ProductsState {
  products: PublicProduct[];
  loading: boolean;
  error: ProductLoadError | null;
}

export function useProducts(enabled = true) {
  const [state, setState] = useState<ProductsState>({
    products: [],
    loading: enabled,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      if (!enabled) {
        setState({
          products: [],
          loading: false,
          error: null
        });
        return;
      }

      if (!isSupabaseConfigured || !supabase) {
        setState({
          products: [],
          loading: false,
          error: { type: "missing-config" }
        });
        return;
      }

      const { data, error } = await supabase
        .from(PUBLIC_VIEW)
        .select(PUBLIC_SELECT_COLUMNS)
        .returns<PublicProduct[]>();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(error);
        setState({
          products: [],
          loading: false,
          error: { type: "load-error", message: error.message }
        });
        return;
      }

      setState({
        products: Array.isArray(data) ? data : [],
        loading: false,
        error: null
      });
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return state;
}
