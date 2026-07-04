export const ADMIN_ROUTE_HASH = "#/admin";

export const POST_AUTH_ROUTE_STORAGE_KEY = "catalog_post_auth_route";

const AUTH_ERROR_STORAGE_KEY = "catalog_auth_error";

export function getOAuthRedirectUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

export function storeAdminPostAuthRoute() {
  sessionStorage.setItem(POST_AUTH_ROUTE_STORAGE_KEY, ADMIN_ROUTE_HASH);
}

export function readPostAuthRoute() {
  return sessionStorage.getItem(POST_AUTH_ROUTE_STORAGE_KEY);
}

export function clearPostAuthRoute() {
  sessionStorage.removeItem(POST_AUTH_ROUTE_STORAGE_KEY);
}

export function storeAuthError(message: string) {
  sessionStorage.setItem(AUTH_ERROR_STORAGE_KEY, message);
}

export function readAndClearAuthError() {
  const message = sessionStorage.getItem(AUTH_ERROR_STORAGE_KEY);

  if (message) {
    sessionStorage.removeItem(AUTH_ERROR_STORAGE_KEY);
  }

  return message;
}

export function getOAuthCallbackErrorMessage() {
  const searchError = getErrorMessageFromParams(
    new URLSearchParams(window.location.search)
  );

  if (searchError) {
    return searchError;
  }

  const hashParams = getAuthHashParams();

  return hashParams ? getErrorMessageFromParams(hashParams) : null;
}

export function cleanOAuthCallbackUrl() {
  window.history.replaceState(null, document.title, window.location.pathname);
}

function getAuthHashParams() {
  const rawHash = window.location.hash.replace(/^#/, "");

  if (!rawHash || rawHash.startsWith("/")) {
    return null;
  }

  return new URLSearchParams(rawHash);
}

function getErrorMessageFromParams(params: URLSearchParams) {
  const error = params.get("error") ?? params.get("error_code");
  const description = params.get("error_description");

  if (!error && !description) {
    return null;
  }

  return [error, description].filter(Boolean).join(": ");
}
