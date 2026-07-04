export type Language = "pt" | "ko";

export type CatalogueMode = "business" | "center";

export interface ProductNameFields {
  id: string;
  name_ko: string | null;
  name_pt: string | null;
  is_set: boolean;
  pack_quantity: number | null;
}

export interface BusinessProduct extends ProductNameFields {
  name_ko: string;
  business_price: number | null;
  consumer_price: number | null;
  brazil_price: number | null;
}

export interface CenterProduct extends ProductNameFields {
  name_ko: string;
  handling_fee: number | null;
  brazil_pv: number | null;
  business_price: number | null;
  consumer_price: number | null;
  brazil_price: number | null;
}

export type CatalogueProduct = BusinessProduct | CenterProduct;

export interface AdminProduct extends ProductNameFields {
  name_ko: string;
  name_pt: string | null;
  handling_fee: number | null;
  business_price: number | null;
  consumer_price: number | null;
  brazil_price: number | null;
  brazil_pv: number | null;
  korea_pv: number | null;
  korea_price: number | null;
  weight: number | null;
  memo: string | null;
  is_set: boolean;
  pack_quantity: number | null;
  is_visible: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export type AdminProductInput = Pick<
  AdminProduct,
  | "name_ko"
  | "name_pt"
  | "handling_fee"
  | "business_price"
  | "consumer_price"
  | "brazil_price"
  | "brazil_pv"
  | "korea_pv"
  | "korea_price"
  | "weight"
  | "memo"
  | "is_set"
  | "pack_quantity"
  | "is_visible"
>;

export type BusinessPriceColumn =
  | "business_price"
  | "consumer_price"
  | "brazil_price";

export type CenterProductColumn =
  | "handling_fee"
  | "business_price"
  | "consumer_price"
  | "brazil_price"
  | "brazil_pv";

export type ProductColumn = BusinessPriceColumn | CenterProductColumn;
