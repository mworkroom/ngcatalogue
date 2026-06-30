export type Language = "pt" | "ko";

export type CatalogueMode = "public" | "center";

export interface ProductNameFields {
  id: string;
  name_ko: string | null;
  name_pt: string | null;
  is_set: boolean;
}

export interface PublicProduct extends ProductNameFields {
  name_ko: string;
  business_price: number | null;
  consumer_price: number | null;
  brazil_price: number | null;
}

export interface CenterProduct extends PublicProduct {
  handling_fee: number | null;
  brazil_pv: number | null;
  korea_pv: number | null;
  korea_price: number | null;
  weight: number | null;
  memo: string | null;
  updated_at: string | null;
}

export type CatalogueProduct = PublicProduct | CenterProduct;

export type PublicPriceColumn =
  | "business_price"
  | "consumer_price"
  | "brazil_price";

export type CenterProductColumn =
  | "handling_fee"
  | "business_price"
  | "consumer_price"
  | "brazil_price"
  | "brazil_pv"
  | "korea_pv"
  | "korea_price"
  | "weight"
  | "memo"
  | "updated_at";

export type ProductColumn = PublicPriceColumn | CenterProductColumn;
