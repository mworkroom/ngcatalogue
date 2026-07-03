import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAdminRedirectUrl,
  hasCatalogueAdminAccess
} from "../lib/adminAccess";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

export type AdminAuthStatus =
  | "checking-session"
  | "signed-out"
  | "checking-membership"
  | "authorized"
  | "unauthorized"
  | "error";

export type AdminAuthAction = "idle" | "signing-in" | "signing-out";

interface AdminAuthState {
  status: AdminAuthStatus;
  user: User | null;
  error: string | null;
}

const missingConfigMessage =
  "관리자 로그인을 사용하려면 Supabase 프론트엔드 환경 값을 설정해야 합니다.";

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    status: "checking-session",
    user: null,
    error: null
  });
  const [action, setAction] = useState<AdminAuthAction>("idle");
  const mountedRef = useRef(false);
  const sessionCheckRef = useRef(0);

  const applySession = useCallback(async (session: Session | null) => {
    const checkId = ++sessionCheckRef.current;

    if (!mountedRef.current) {
      return;
    }

    if (!session?.user) {
      setState({
        status: "signed-out",
        user: null,
        error: null
      });
      return;
    }

    setState({
      status: "checking-membership",
      user: session.user,
      error: null
    });

    try {
      const hasAccess = await hasCatalogueAdminAccess(session.user.id);

      if (!mountedRef.current || sessionCheckRef.current !== checkId) {
        return;
      }

      setState({
        status: hasAccess ? "authorized" : "unauthorized",
        user: session.user,
        error: null
      });
    } catch (error) {
      console.error(error);

      if (!mountedRef.current || sessionCheckRef.current !== checkId) {
        return;
      }

      setState({
        status: "error",
        user: session.user,
        error: "관리자 권한을 확인하는 중 문제가 발생했습니다."
      });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!isSupabaseConfigured || !supabase) {
      setState({
        status: "error",
        user: null,
        error: missingConfigMessage
      });

      return () => {
        mountedRef.current = false;
        sessionCheckRef.current += 1;
      };
    }

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        return applySession(data.session);
      })
      .catch((error) => {
        console.error(error);

        if (!mountedRef.current) {
          return;
        }

        setState({
          status: "error",
          user: null,
          error: "로그인 상태를 확인하는 중 문제가 발생했습니다."
        });
      });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        return;
      }

      void applySession(session);
    });

    return () => {
      mountedRef.current = false;
      sessionCheckRef.current += 1;
      subscription.unsubscribe();
    };
  }, [applySession]);

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setState({
        status: "error",
        user: null,
        error: missingConfigMessage
      });
      return;
    }

    setAction("signing-in");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAdminRedirectUrl()
      }
    });

    if (error && mountedRef.current) {
      console.error(error);
      setAction("idle");
      setState({
        status: "error",
        user: null,
        error: "Google 로그인 요청을 시작하지 못했습니다."
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) {
      setState({
        status: "signed-out",
        user: null,
        error: null
      });
      return;
    }

    setAction("signing-out");

    const { error } = await supabase.auth.signOut();

    if (!mountedRef.current) {
      return;
    }

    setAction("idle");

    if (error) {
      console.error(error);
      setState({
        status: "error",
        user: null,
        error: "로그아웃 중 문제가 발생했습니다."
      });
      return;
    }

    setState({
      status: "signed-out",
      user: null,
      error: null
    });
  }, []);

  const signInWithDifferentAccount = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setState({
        status: "error",
        user: null,
        error: missingConfigMessage
      });
      return;
    }

    setAction("signing-out");

    const { error: signOutError } = await supabase.auth.signOut();

    if (!mountedRef.current) {
      return;
    }

    if (signOutError) {
      console.error(signOutError);
      setAction("idle");
      setState({
        status: "error",
        user: null,
        error: "현재 계정 로그아웃 중 문제가 발생했습니다."
      });
      return;
    }

    setState({
      status: "signed-out",
      user: null,
      error: null
    });
    setAction("signing-in");

    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAdminRedirectUrl()
      }
    });

    if (signInError && mountedRef.current) {
      console.error(signInError);
      setAction("idle");
      setState({
        status: "error",
        user: null,
        error: "다른 Google 계정 로그인 요청을 시작하지 못했습니다."
      });
    }
  }, []);

  return {
    action,
    state,
    signInWithDifferentAccount,
    signInWithGoogle,
    signOut
  };
}
