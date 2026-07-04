import { isSupabaseConfigured, supabase } from "./supabase";
import type { AdminProduct, AdminProductInput } from "../types/product";

const adminProductFields = [
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
  "pack_quantity",
  "is_visible",
  "created_at",
  "updated_at"
].join(",");

export async function listAdminProducts() {
  const client = getAdminSupabaseClient();
  const { data, error } = await client
    .from("catalog_products")
    .select(adminProductFields)
    .order("name_ko", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AdminProduct[];
}

export async function createAdminProduct(input: AdminProductInput) {
  const client = getAdminSupabaseClient();
  const { data, error } = await client
    .from("catalog_products")
    .insert(input)
    .select(adminProductFields)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as AdminProduct;
}

export async function updateAdminProduct(
  productId: string,
  input: AdminProductInput
) {
  const client = getAdminSupabaseClient();
  const { data, error } = await client
    .from("catalog_products")
    .update(input)
    .eq("id", productId)
    .select(adminProductFields)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as AdminProduct;
}

export async function setAdminProductVisibility(
  productId: string,
  isVisible: boolean
) {
  const client = getAdminSupabaseClient();
  const { data, error } = await client
    .from("catalog_products")
    .update({ is_visible: isVisible })
    .eq("id", productId)
    .select(adminProductFields)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as AdminProduct;
}

function getAdminSupabaseClient() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase 설정이 필요합니다.");
  }

  return supabase;
}
