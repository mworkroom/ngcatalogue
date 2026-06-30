import { useCallback, useEffect, useState } from "react";
import { CENTER_SESSION_STORAGE_KEY } from "../config/catalog";
import {
  CenterApiError,
  loginCenter,
  type CenterSession
} from "../lib/centerApi";

export type CenterSessionError =
  | "invalid-code"
  | "expired-session"
  | "missing-config"
  | "network"
  | "server";

interface CenterSessionState {
  session: CenterSession | null;
  checking: boolean;
  validating: boolean;
  error: CenterSessionError | null;
}

export function useCenterSession(enabled: boolean) {
  const [state, setState] = useState<CenterSessionState>({
    session: null,
    checking: enabled,
    validating: false,
    error: null
  });

  useEffect(() => {
    if (!enabled) {
      setState({
        session: null,
        checking: false,
        validating: false,
        error: null
      });
      return;
    }

    const storedSession = readStoredSession();

    if (!storedSession) {
      setState({
        session: null,
        checking: false,
        validating: false,
        error: null
      });
      return;
    }

    if (isExpired(storedSession.expiresAt)) {
      localStorage.removeItem(CENTER_SESSION_STORAGE_KEY);
      setState({
        session: null,
        checking: false,
        validating: false,
        error: "expired-session"
      });
      return;
    }

    setState({
      session: storedSession,
      checking: false,
      validating: false,
      error: null
    });
  }, [enabled]);

  const clearSession = useCallback((error: CenterSessionError | null = null) => {
    localStorage.removeItem(CENTER_SESSION_STORAGE_KEY);
    setState({
      session: null,
      checking: false,
      validating: false,
      error
    });
  }, []);

  const login = useCallback(async (code: string) => {
    setState((current) => ({
      ...current,
      validating: true,
      error: null
    }));

    try {
      const session = await loginCenter(code);
      localStorage.setItem(CENTER_SESSION_STORAGE_KEY, JSON.stringify(session));
      setState({
        session,
        checking: false,
        validating: false,
        error: null
      });
    } catch (error) {
      console.error(error);
      setState((current) => ({
        ...current,
        session: null,
        checking: false,
        validating: false,
        error: getLoginError(error)
      }));
    }
  }, []);

  return {
    ...state,
    login,
    logout: () => clearSession(null),
    clearSession
  };
}

function readStoredSession() {
  const rawValue = localStorage.getItem(CENTER_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<CenterSession>;

    if (
      typeof parsed.token === "string" &&
      typeof parsed.expiresAt === "string"
    ) {
      return {
        token: parsed.token,
        expiresAt: parsed.expiresAt
      };
    }
  } catch (error) {
    console.error(error);
  }

  localStorage.removeItem(CENTER_SESSION_STORAGE_KEY);
  return null;
}

function isExpired(expiresAt: string) {
  const expiresAtTime = new Date(expiresAt).getTime();
  return !Number.isFinite(expiresAtTime) || expiresAtTime <= Date.now();
}

function getLoginError(error: unknown): CenterSessionError {
  if (error instanceof CenterApiError) {
    if (error.type === "unauthorized") {
      return "invalid-code";
    }

    return error.type;
  }

  return "server";
}
