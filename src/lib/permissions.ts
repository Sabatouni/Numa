import { supabase } from "./supabase";

export interface AppPermission {
  application_id: string;
  application_slug: string;
  application_name: string;
  role_id: string;
  role_slug: string;
  role_name: string;
  role_level: number;
  granted_at: string;
}

/**
 * Client-side mirror of the `roles` catalog ordering (owner > admin >
 * worker), used only to decide what the UI shows. The real authorization
 * boundary is Postgres RLS (has_minimum_role/has_role/has_application_access)
 * on the database side, evaluated against the same user_application_roles
 * rows this ordering is derived from -- nothing here can grant access the
 * database wouldn't also grant.
 */
export const ROLE_LEVELS: Record<string, number> = { owner: 30, admin: 20, worker: 10 };

/**
 * Fetches every application + role grant the current authenticated user
 * holds, across every application in this Supabase project, in one call.
 * Backed by `my_permissions()` (SECURITY DEFINER, scoped to auth.uid() --
 * a user can only ever see their own grants).
 */
export async function fetchMyPermissions(): Promise<AppPermission[]> {
  const { data, error } = await supabase.rpc("my_permissions");
  if (error) throw error;
  return (data as AppPermission[]) ?? [];
}

export interface ApplicationMember {
  user_id: string;
  email: string;
  full_name: string | null;
  role_slug: string;
  role_name: string;
  role_level: number;
  granted_at: string;
}

/** Team list for an application -- owner/platform-admin only (enforced in SQL). */
export async function fetchApplicationMembers(appSlug: string): Promise<ApplicationMember[]> {
  const { data, error } = await supabase.rpc("application_members", { p_application_slug: appSlug });
  if (error) throw error;
  return (data as ApplicationMember[]) ?? [];
}

/** Grants a role to a user by email -- owner/platform-admin only (enforced in SQL). */
export async function grantRoleByEmail(email: string, appSlug: string, roleSlug: string): Promise<void> {
  const { error } = await supabase.rpc("grant_application_role_by_email", {
    p_email: email,
    p_application_slug: appSlug,
    p_role_slug: roleSlug,
  });
  if (error) throw error;
}

/** Revokes a user's role on an application -- owner/platform-admin only (enforced in SQL). */
export async function revokeRole(userId: string, appSlug: string): Promise<void> {
  const { error } = await supabase.rpc("revoke_application_role", {
    p_user_id: userId,
    p_application_slug: appSlug,
  });
  if (error) throw error;
}
