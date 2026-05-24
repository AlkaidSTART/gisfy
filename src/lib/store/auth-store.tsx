"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  register: (
    email: string,
    name: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_USER_ID_KEY = "gisfy_userid";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时检查登录状态
  useEffect(() => {
    const initAuth = async () => {
      const userId = window.localStorage.getItem(AUTH_USER_ID_KEY);
      if (!userId) return;

      const json = await fetch(`/api/auth/${encodeURIComponent(userId)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);

      if (json?.success) setUser(json.data);
      else window.localStorage.removeItem(AUTH_USER_ID_KEY);
    };

    void initAuth()
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (json.success) {
      setUser(json.data);
      if (json.data?.id) {
        window.localStorage.setItem(AUTH_USER_ID_KEY, json.data.id);
      }
      return { ok: true };
    }
    return { ok: false, error: json.error?.message ?? "登录失败" };
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data);
        if (json.data?.id) {
          window.localStorage.setItem(AUTH_USER_ID_KEY, json.data.id);
        }
        return { ok: true };
      }
      return { ok: false, error: json.error?.message ?? "注册失败" };
    },
    [],
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.localStorage.removeItem(AUTH_USER_ID_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
