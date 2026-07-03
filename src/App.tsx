import { useCallback, useEffect, useMemo, useState } from "react";
import { CenterAccessForm } from "./components/CenterAccessForm";
import { CenterSessionControls } from "./components/CenterSessionControls";
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
  type CenterProductsError,
  useCenterProducts
} from "./hooks/useCenterProducts";
import { useAdminAuth } from "./hooks/useAdminAuth";
import { useCenterSession } from "./hooks/useCenterSession";
import { useProducts } from "./hooks/useProducts";
import { dictionary } from "./i18n";
import type { CatalogueMode, Language } from "./types/product";
import { searchProducts } from "./utils/productSearch";
import { sortProducts } from "./utils/productSort";

export default function App() {
  const route = useAppRoute();

  if (route === "admin") {
    return <AdminRoute />;
  }

  return <CatalogueRoute mode={route} />;
}

function CatalogueRoute({ mode }: { mode: CatalogueMode }) {
  const isCenterMode = mode === "center";
  const [language, setLanguage] = useState<Language>("pt");
  const [query, setQuery] = useState("");
  const publicState = useProducts(!isCenterMode);
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
  const centerState = useCenterProducts(
    isCenterMode ? centerSession?.token ?? null : null,
    handleCenterUnauthorized
  );
  const t = dictionary[language];
  const products = isCenterMode ? centerState.products : publicState.products;
  const loading = isCenterMode ? centerState.loading : publicState.loading;

  const visibleProducts = useMemo(() => {
    return sortProducts(searchProducts(products, query), language, query);
  }, [language, products, query]);

  useEffect(() => {
    document.documentElement.lang = language === "pt" ? "pt-BR" : "ko";
    document.title = isCenterMode ? t.centerTitle : t.title;
  }, [isCenterMode, language, t.centerTitle, t.title]);

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
    : publicState.error?.type === "missing-config"
      ? t.setup
      : publicState.error
        ? t.loadError
        : "";
  const errorDetail =
    !isCenterMode && publicState.error?.type === "load-error"
      ? publicState.error.message
      : undefined;
  const showEmpty =
    !loading &&
    (isCenterMode ? !centerState.error : !publicState.error);

  return (
    <main className={`app ${isCenterMode ? "app-center" : "app-public"}`}>
      <Header
        mode={mode}
        language={language}
        onLanguageChange={setLanguage}
        onLogout={isCenterMode ? logoutCenterSession : undefined}
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
            message={isCenterMode ? t.loadingCenterProducts : t.loading}
          />
        ) : (
          <span>{t.count(visibleProducts.length)}</span>
        )}
        {errorMessage ? (
          <ErrorState message={errorMessage} detail={errorDetail} />
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
          <CenterSessionControls language={language} onLogout={onLogout} />
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

    return hashRoute === "/catalog/center" ? "center" : "public";
  }

  const pathname = normalizeRoute(window.location.pathname);
  if (pathname.endsWith("/admin")) {
    return "admin";
  }

  return pathname.endsWith("/catalog/center") ? "center" : "public";
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
