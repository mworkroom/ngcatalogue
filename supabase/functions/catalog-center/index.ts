import { createClient } from "npm:@supabase/supabase-js@2.50.0";
import { SignJWT, jwtVerify } from "npm:jose@5.9.6";

const CENTER_SESSION_DAYS = 30;
const INVALID_LOGIN_DELAY_MS = 650;
const CENTER_SELECT_COLUMNS = [
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

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, apikey, content-type",
  "access-control-max-age": "86400"
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Invalid request." }, 405);
  }

  const body = await readJson(request);

  if (!isRecord(body) || typeof body.action !== "string") {
    return json({ error: "Invalid request." }, 400);
  }

  if (body.action === "login") {
    return handleLogin(body);
  }

  if (body.action === "products") {
    return handleProducts(body);
  }

  return json({ error: "Invalid request." }, 400);
});

async function handleLogin(body: Record<string, unknown>) {
  const configuredCode = Deno.env.get("CENTER_ACCESS_CODE")?.trim() ?? "";
  const submittedCode = String(body.code ?? "").trim();

  if (!/^\d{8}$/.test(configuredCode)) {
    console.error("CENTER_ACCESS_CODE is not configured as an 8-digit value.");
    return json({ error: "Center access is not configured." }, 500);
  }

  if (!/^\d{8}$/.test(submittedCode)) {
    await delayInvalidLogin();
    return unauthorized();
  }

  if (!timingSafeEqual(submittedCode, configuredCode)) {
    await delayInvalidLogin();
    return unauthorized();
  }

  const now = Date.now();
  const expiresAt = new Date(now + CENTER_SESSION_DAYS * 24 * 60 * 60 * 1000);
  const sessionSecret = getSessionSecret();

  if (!sessionSecret) {
    console.error("CENTER_SESSION_SECRET is not configured.");
    return json({ error: "Center access is not configured." }, 500);
  }

  const token = await new SignJWT({ role: "center" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt(Math.floor(now / 1000))
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(sessionSecret);

  return json({
    token,
    expiresAt: expiresAt.toISOString()
  });
}

async function handleProducts(body: Record<string, unknown>) {
  const token = typeof body.token === "string" ? body.token : "";
  const sessionSecret = getSessionSecret();

  if (!sessionSecret) {
    console.error("CENTER_SESSION_SECRET is not configured.");
    return json({ error: "Center access is not configured." }, 500);
  }

  try {
    const { payload } = await jwtVerify(token, sessionSecret, {
      algorithms: ["HS256"]
    });

    if (payload.role !== "center") {
      return unauthorized();
    }
  } catch {
    return unauthorized();
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim() ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Supabase service configuration is missing.");
    return json({ error: "Center access is not configured." }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await supabase
    .from("catalog_products")
    .select(CENTER_SELECT_COLUMNS)
    .eq("is_visible", true);

  if (error) {
    console.error("Center product load failed.", error.message);
    return json({ error: "Unable to load products." }, 500);
  }

  return json({
    products: Array.isArray(data) ? data : []
  });
}

function getSessionSecret() {
  const secret = Deno.env.get("CENTER_SESSION_SECRET")?.trim() ?? "";
  return secret ? new TextEncoder().encode(secret) : null;
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "content-type": "application/json"
    }
  });
}

function unauthorized() {
  return json({ error: "Invalid access code." }, 401);
}

function timingSafeEqual(first: string, second: string) {
  if (first.length !== second.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < first.length; index += 1) {
    result |= first.charCodeAt(index) ^ second.charCodeAt(index);
  }

  return result === 0;
}

function delayInvalidLogin() {
  return new Promise((resolve) => {
    setTimeout(resolve, INVALID_LOGIN_DELAY_MS);
  });
}
