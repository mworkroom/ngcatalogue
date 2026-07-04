import { useCallback, useEffect, useMemo, useState } from "react";
import { BusinessAccessForm } from "./components/BusinessAccessForm";
import { CenterAccessForm } from "./components/CenterAccessForm";
import { SessionControls } from "./components/SessionControls";
import { AdminLogin } from "./components/AdminLogin";
import { AdminPlaceholder } from "./components/AdminPlaceholder";
import { AdminUnauthorized } from "./components/AdminUnauthorized";
import { ErrorState } from "./components/ErrorState";
import { LanguageSwitch } from "./components/LanguageSwitch";
import { LoadingState } from "./components/LoadingState";
import { ProductCardList } from "./components/ProductCardList";
import { ProductTable } from "./components/ProductTable";
import { SearchBar } from "./components/SearchBar";
import {
  type BusinessProductsError,
  useBusinessProducts
} from "./hooks/useBusinessProducts";
import {
  type CenterProductsError,
  useCenterProducts
} from "./hooks/useCenterProducts";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useBusinessSession } from "./hooks/useBusinessSession";
import { useCenterSession } from "./hooks/useCenterSession";
import { dictionary } from "./i18n";
import {
  cleanOAuthCallbackUrl,
  clearPostAuthRoute,
  getOAuthCallbackErrorMessage,
  readPostAuthRoute,
  storeAuthError
} from "./lib/authRedirect";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import type { CatalogueMode, Language } from "./types/product";
import { searchProducts } from "./utils/productSearch";
import { sortProducts } from "./utils/productSort";

export default function App() {
  const restoringPostAuthRoute = usePostAuthRouteRestore();
  const route = useAppRoute();

  if (restoringPostAuthRoute) {
    return <AuthCallbackLoading />;
  }

  if (route === "admin") {
    return <AdminRoute />;
  }

  return <CatalogueRoute mode={route} />;
}

function AuthCallbackLoading() {
  useEffect(() => {
    document.documentElement.lang = "ko-KR";
    document.title = "로그인 확인";
  }, []);

  return (
    <main className="app app-admin">
      <section className="access-panel admin-panel admin-status-panel">
        <LoadingState message="로그인 상태를 확인하는 중입니다." />
      </section>
    </main>
  );
}

function CatalogueRoute({ mode }: { mode: CatalogueMode }) {
  const isCenterMode = mode === "center";
  const isBusinessMode = mode === "business";
  const [language, setLanguage] = useState<Language>("pt");
  const [query, setQuery] = useState("");
  const {
    session: businessSession,
    checking: checkingBusinessSession,
    validating: validatingBusinessSession,
    error: businessSessionError,
    login: loginBusinessSession,
    logout: logoutBusinessSession,
    clearSession: clearBusinessSession
  } = useBusinessSession(isBusinessMode);
  const {
    session: centerSession,
    checking: checkingCenterSession,
    validating: validatingCenterSession,
    error: centerSessionError,
    login: loginCenterSession,
    logout: logoutCenterSession,
    clearSession: clearCenterSession
  } = useCenterSession(isCenterMode);
  const handleCenterUnauthorized = useCallback(() => {
    clearCenterSession("expired-session");
  }, [clearCenterSession]);
  const handleBusinessUnauthorized = useCallback(() => {
    clearBusinessSession("expired-session");
  }, [clearBusinessSession]);
  const businessState = useBusinessProducts(
    isBusinessMode ? businessSession?.token ?? null : null,
    handleBusinessUnauthorized
  );
  const centerState = useCenterProducts(
    isCenterMode ? centerSession?.token ?? null : null,
    handleCenterUnauthorized
  );
  const t = dictionary[language];
  const products = isCenterMode ? centerState.products : businessState.products;
  const loading = isCenterMode ? centerState.loading : businessState.loading;

  const visibleProducts = useMemo(() => {
    return sortProducts(searchProducts(products, query), language, query);
  }, [language, products, query]);

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "ko";
    document.title = isCenterMode ? t.centerTitle : t.title;
  }, [isCenterMode, language, t.centerTitle, t.title]);

  if (isBusinessMode && checkingBusinessSession) {
    return (
      <main className="app app-public">
        <Header
          mode={mode}
          language={language}
          onLanguageChange={setLanguage}
        />
        <section className="access-panel">
          <LoadingState message={t.checkingBusinessSession} />
        </section>
      </main>
    );
  }

  if (isBusinessMode && !businessSession) {
    return (
      <main className="app app-public">
        <Header
          mode={mode}
          language={language}
          onLanguageChange={setLanguage}
        />
        <BusinessAccessForm
          language={language}
          validating={validatingBusinessSession}
          error={businessSessionError}
          onSubmit={loginBusinessSession}
        />
      </main>
    );
  }

  if (isBusinessMode && businessState.error) {
    return (
      <main className="app app-public">
        <Header
          mode={mode}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={logoutBusinessSession}
        />
        <section className="access-panel">
          <ErrorState
            message={getBusinessProductsErrorMessage(
              businessState.error,
              language
            )}
          />
        </section>
      </main>
    );
  }

  if (isCenterMode && checkingCenterSession) {
    return (
      <main className="app app-center">
        <Header
          mode={mode}
          language={language}
          onLanguageChange={setLanguage}
        />
        <section className="access-panel">
          <LoadingState message={t.checkingCenterSession} />
        </section>
      </main>
    );
  }

  if (isCenterMode && !centerSession) {
    return (
      <main className="app app-center">
        <Header
          mode={mode}
          language={language}
          onLanguageChange={setLanguage}
        />
        <CenterAccessForm
          language={language}
          validating={validatingCenterSession}
          error={centerSessionError}
          onSubmit={loginCenterSession}
        />
      </main>
    );
  }

  if (isCenterMode && centerState.error) {
    return (
      <main className="app app-center">
        <Header
          mode={mode}
          language={language}
          onLanguageChange={setLanguage}
          onLogout={logoutCenterSession}
        />
        <section className="access-panel">
          <ErrorState
            message={getCenterProductsErrorMessage(centerState.error, language)}
          />
        </section>
      </main>
    );
  }

  const errorMessage = isCenterMode
    ? getCenterProductsErrorMessage(centerState.error, language)
    : getBusinessProductsErrorMessage(businessState.error, language);
  const showEmpty =
    !loading &&
    (isCenterMode ? !centerState.error : !businessState.error);

  return (
    <main className={`app ${isCenterMode ? "app-center" : "app-public"}`}>
      <Header
        mode={mode}
        language={language}
        onLanguageChange={setLanguage}
        onLogout={isCenterMode ? logoutCenterSession : logoutBusinessSession}
      />

      <SearchBar
        value={query}
        label={t.search}
        printLabel={t.print}
        onChange={setQuery}
        onPrint={() => window.print()}
      />

      <div className="meta" aria-live="polite">
        {loading ? (
          <LoadingState
            message={
              isCenterMode ? t.loadingCenterProducts : t.loadingBusinessProducts
            }
          />
        ) : (
          <span>{t.count(visibleProducts.length)}</span>
        )}
        {errorMessage ? (
          <ErrorState message={errorMessage} />
        ) : (
          <span />
        )}
      </div>

      <ProductTable
        mode={mode}
        language={language}
        products={visibleProducts}
        showEmpty={showEmpty}
      />
      <ProductCardList
        mode={mode}
        language={language}
        products={visibleProducts}
        showEmpty={showEmpty}
      />
    </main>
  );
}

function AdminRoute() {
  const { action, signInWithDifferentAccount, signInWithGoogle, signOut, state } =
    useAdminAuth();
  const busy = action !== "idle";

  useEffect(() => {
    document.documentElement.lang = "ko-KR";
    document.title = "관리자 페이지";
  }, []);

  if (state.status === "checking-session") {
    return (
      <main className="app app-admin">
        <section className="access-panel admin-panel admin-status-panel">
          <LoadingState message="로그인 상태를 확인하는 중입니다." />
        </section>
      </main>
    );
  }

  if (state.status === "checking-membership") {
    return (
      <main className="app app-admin">
        <section className="access-panel admin-panel admin-status-panel">
          <LoadingState message="관리자 권한을 확인하는 중입니다." />
        </section>
      </main>
    );
  }

  if (state.status === "authorized" && state.user) {
    return (
      <main className="app app-admin">
        <AdminPlaceholder
          email={state.user.email ?? ""}
          busy={busy}
          onLogout={signOut}
        />
      </main>
    );
  }

  if (state.status === "unauthorized" && state.user) {
    return (
      <main className="app app-admin">
        <AdminUnauthorized
          email={state.user.email ?? ""}
          busy={busy}
          onLoginWithDifferentAccount={signInWithDifferentAccount}
          onLogout={signOut}
        />
      </main>
    );
  }

  return (
    <main className="app app-admin">
      <AdminLogin
        busy={busy}
        error={state.status === "error" ? state.error : null}
        onLogin={signInWithGoogle}
      />
    </main>
  );
}

interface HeaderProps {
  mode: CatalogueMode;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onLogout?: () => void;
}

function Header({
  mode,
  language,
  onLanguageChange,
  onLogout
}: HeaderProps) {
  const t = dictionary[language];

  return (
    <header className="topbar">
      <h1>{mode === "center" ? t.centerTitle : t.title}</h1>
      <div className="topbar-actions">
        {onLogout ? (
          <SessionControls
            label={mode === "center" ? t.centerLogout : t.businessLogout}
            onLogout={onLogout}
          />
        ) : null}
        <LanguageSwitch language={language} onChange={onLanguageChange} />
      </div>
    </header>
  );
}

type AppRoute = CatalogueMode | "admin";

function getAppRoute(): AppRoute {
  const rawHashRoute = window.location.hash.replace(/^#/, "");
  const hashRoute = normalizeRoute(rawHashRoute);

  if (rawHashRoute) {
    if (hashRoute === "/admin") {
      return "admin";
    }

    return hashRoute === "/catalog/center" ? "center" : "business";
  }

  const pathname = normalizeRoute(window.location.pathname);
  if (pathname.endsWith("/admin")) {
    return "admin";
  }

  return pathname.endsWith("/catalog/center") ? "center" : "business";
}

function useAppRoute() {
  const [route, setRoute] = useState<AppRoute>(() => getAppRoute());

  useEffect(() => {
    const syncMode = () => {
      setRoute(getAppRoute());
    };

    window.addEventListener("hashchange", syncMode);
    window.addEventListener("popstate", syncMode);

    return () => {
      window.removeEventListener("hashchange", syncMode);
      window.removeEventListener("popstate", syncMode);
    };
  }, []);

  return route;
}

function normalizeRoute(route: string) {
  const pathOnly = route.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return pathOnly || "/";
}

function usePostAuthRouteRestore() {
  const [checking, setChecking] = useState(() =>
    Boolean(readPostAuthRoute())
  );

  useEffect(() => {
    const postAuthRoute = readPostAuthRoute();

    if (!postAuthRoute) {
      setChecking(false);
      return;
    }

    let isMounted = true;
    let completed = false;
    let unsubscribeAuthListener: (() => void) | null = null;

    const finish = () => {
      window.setTimeout(() => {
        if (isMounted) {
          setChecking(false);
        }
      }, 0);
    };

    const returnToPostAuthRoute = () => {
      if (completed) {
        return;
      }

      completed = true;
      unsubscribeAuthListener?.();
      unsubscribeAuthListener = null;
      clearPostAuthRoute();
      cleanOAuthCallbackUrl();
      window.location.hash = postAuthRoute;
      finish();
    };

    const oauthError = getOAuthCallbackErrorMessage();

    if (oauthError) {
      const message = `Google OAuth 오류: ${oauthError}`;
      console.error(message);
      storeAuthError(message);
      returnToPostAuthRoute();

      return () => {
        isMounted = false;
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      returnToPostAuthRoute();

      return () => {
        isMounted = false;
      };
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        returnToPostAuthRoute();
      }
    });
    unsubscribeAuthListener = () => subscription.unsubscribe();

    void supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          throw error;
        }

        returnToPostAuthRoute();
      })
      .catch((error) => {
        const message = "OAuth 콜백 세션 확인 중 문제가 발생했습니다.";
        console.error(
          message,
          error instanceof Error ? error.message : String(error)
        );
        storeAuthError(message);
        returnToPostAuthRoute();
      });

    return () => {
      isMounted = false;
      unsubscribeAuthListener?.();
    };
  }, []);

  return checking;
}

function getCenterProductsErrorMessage(
  error: CenterProductsError | null,
  language: Language
) {
  if (!error || error === "unauthorized") {
    return "";
  }

  const t = dictionary[language];

  if (error === "missing-config") {
    return t.setup;
  }

  if (error === "network") {
    return t.centerNetworkError;
  }

  return t.centerServerError;
}

function getBusinessProductsErrorMessage(
  error: BusinessProductsError | null,
  language: Language
) {
  if (!error || error === "unauthorized") {
    return "";
  }

  const t = dictionary[language];

  if (error === "missing-config") {
    return t.setup;
  }

  if (error === "network") {
    return t.businessNetworkError;
  }

  return t.businessServerError;
}
