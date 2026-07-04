import type {
  BusinessPriceColumn,
  CatalogueMode,
  CenterProductColumn,
  ProductColumn
} from "../types/product";

export const BUSINESS_FUNCTION = "catalog-business";

export const CENTER_FUNCTION = "catalog-center";

export const BUSINESS_SESSION_STORAGE_KEY = "catalog_business_session";

export const CENTER_SESSION_STORAGE_KEY = "catalog_center_session";

export const columnConfig: Record<CatalogueMode, readonly ProductColumn[]> = {
  business: [
    "business_price",
    "consumer_price",
    "brazil_price"
  ] satisfies BusinessPriceColumn[],
  center: [
    "handling_fee",
    "business_price",
    "consumer_price",
    "brazil_price",
    "brazil_pv"
  ] satisfies CenterProductColumn[]
};
