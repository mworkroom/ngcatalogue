import { CENTER_FUNCTION } from "../config/catalog";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl
} from "./supabase";
import type { CenterProduct } from "../types/product";

export interface CenterSession {
  token: string;
  expiresAt: string;
}

export type CenterApiErrorType =
  | "missing-config"
  | "unauthorized"
  | "network"
  | "server";

export class CenterApiError extends Error {
  readonly type: CenterApiErrorType;

  constructor(type: CenterApiErrorType, message: string) {
    super(message);
    this.name = "CenterApiError";
    this.type = type;
  }
}

interface CenterProductsResponse {
  products: CenterProduct[];
}

export async function loginCenter(code: string) {
  return callCenterFunction<CenterSession>({
    action: "login",
    code
  });
}

export async function loadCenterProducts(token: string) {
  const data = await callCenterFunction<CenterProductsResponse>({
    action: "products",
    token
  });

  return Array.isArray(data.products) ? data.products : [];
}

async function callCenterFunction<TResponse>(body: unknown) {
  if (!isSupabaseConfigured) {
    throw new CenterApiError(
      "missing-config",
      "Supabase frontend configuration is missing."
    );
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${CENTER_FUNCTION}`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: supabasePublishableKey,
        authorization: `Bearer ${supabasePublishableKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error(error);
    throw new CenterApiError("network", "Center function request failed.");
  }

  if (response.status === 401) {
    throw new CenterApiError("unauthorized", "Center access was rejected.");
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    console.error(errorBody ?? `Center function failed: ${response.status}`);
    throw new CenterApiError("server", "Center function returned an error.");
  }

  return (await response.json()) as TResponse;
}

async function readErrorBody(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
