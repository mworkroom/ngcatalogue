import type {
  CatalogueMode,
  CenterProductColumn,
  ProductColumn,
  PublicPriceColumn
} from "../types/product";

export const PUBLIC_VIEW = "catalog_public_products";

export const CENTER_FUNCTION = "catalog-center";

export const CENTER_SESSION_STORAGE_KEY = "catalog_center_session";

export const PUBLIC_SELECT_COLUMNS = [
  "id",
  "name_ko",
  "name_pt",
  "business_price",
  "consumer_price",
  "brazil_price",
  "is_set"
].join(",");

export const CENTER_PRODUCT_FIELDS = [
  "id",
  "name_ko",
  "name_pt",
  "handling_fee",
  "business_price",
  "consumer_price",
  "brazil_price",
  "brazil_pv",
  "korea_pv",
  "korea_price",
  "weight",
  "memo",
  "is_set",
  "updated_at"
].join(",");

export const columnConfig: Record<CatalogueMode, readonly ProductColumn[]> = {
  public: [
    "business_price",
    "consumer_price",
    "brazil_price"
  ] satisfies PublicPriceColumn[],
  center: [
    "handling_fee",
    "business_price",
    "consumer_price",
    "brazil_price",
    "brazil_pv",
    "korea_pv",
    "korea_price",
    "weight",
    "memo",
    "updated_at"
  ] satisfies CenterProductColumn[]
};
