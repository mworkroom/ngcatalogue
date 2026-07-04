import { BUSINESS_FUNCTION } from "../config/catalog";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl
} from "./supabase";
import type { BusinessProduct } from "../types/product";

export interface BusinessSession {
  token: string;
  expiresAt: string;
}

export type BusinessApiErrorType =
  | "missing-config"
  | "unauthorized"
  | "network"
  | "server";

export class BusinessApiError extends Error {
  readonly type: BusinessApiErrorType;

  constructor(type: BusinessApiErrorType, message: string) {
    super(message);
    this.name = "BusinessApiError";
    this.type = type;
  }
}

interface BusinessProductsResponse {
  products: BusinessProduct[];
}

export async function loginBusiness(code: string) {
  return callBusinessFunction<BusinessSession>({
    action: "login",
    code
  });
}

export async function loadBusinessProducts(token: string) {
  const data = await callBusinessFunction<BusinessProductsResponse>({
    action: "products",
    token
  });

  return Array.isArray(data.products) ? data.products : [];
}

async function callBusinessFunction<TResponse>(body: unknown) {
  if (!isSupabaseConfigured) {
    throw new BusinessApiError(
      "missing-config",
      "Supabase frontend configuration is missing."
    );
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/${BUSINESS_FUNCTION}`;

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
    throw new BusinessApiError("network", "Business function request failed.");
  }

  if (response.status === 401) {
    throw new BusinessApiError("unauthorized", "Business access was rejected.");
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    console.error(errorBody ?? `Business function failed: ${response.status}`);
    throw new BusinessApiError("server", "Business function returned an error.");
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
