import { CATALOGUE_WORKSPACE_ID } from "../constants/workspaces";
import { isSupabaseConfigured, supabase } from "./supabase";

export async function hasCatalogueAdminAccess(userId: string) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase frontend configuration is missing.");
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", CATALOGUE_WORKSPACE_ID)
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role === "admin";
}

export function getAdminRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}#/admin`;
}
