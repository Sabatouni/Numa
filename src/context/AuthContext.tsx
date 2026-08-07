import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { fetchMyPermissions, ROLE_LEVELS, type AppPermission } from "../lib/permissions";

// numa-web only. Owner and Admin exist here; there is no Worker tier for
// this application. A user's standing in stv-pos, alie-web, ulphoria-web,
// or stv-web has zero bearing on this app, because the grant lookup below
// only ever reads the row matching this slug.
const APP_SLUG = "numa-web";

interface AuthValue {
  session: Session | null;
  user: User | null;
  permissions: AppPermission[];
  role: string | null;
  roleLevel: number | null;
  hasAccess: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  ready: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [ready, setReady] = useState(false);

  const loadPermissions = useCallback(async () => {
    try {
      setPermissions(await fetchMyPermissions());
    } catch (err) {
      console.error("[Auth] failed to load permissions:", err);
      setPermissions([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // onAuthStateChange fires immediately with INITIAL_SESSION in
    // supabase-js v2, covering restore-on-refresh as well as sign-in/out
    // and token refresh -- a separate getSession() call would only
    // duplicate it. Permissions are re-fetched on every transition so a
    // role change (grant/revoke) takes effect next time the session is
    // touched, without requiring a hard reload.
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (cancelled) return;
      setSession(nextSession);
      if (nextSession?.user) {
        await loadPermissions();
      } else {
        setPermissions([]);
      }
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadPermissions]);

  async function signOut() {
    await supabase.auth.signOut();
  }

  const grant = useMemo(
    () => permissions.find((p) => p.application_slug === APP_SLUG) ?? null,
    [permissions]
  );
  const role = grant?.role_slug ?? null;
  const roleLevel = role ? ROLE_LEVELS[role] ?? grant!.role_level : null;
  const hasAccess = !!grant;
  const isOwner = role === "owner";
  const isAdmin = roleLevel !== null && roleLevel >= ROLE_LEVELS.admin;

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      permissions,
      role,
      roleLevel,
      hasAccess,
      isOwner,
      isAdmin,
      ready,
      refresh: loadPermissions,
      signOut,
    }),
    [session, permissions, role, roleLevel, hasAccess, isOwner, isAdmin, ready, loadPermissions]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
