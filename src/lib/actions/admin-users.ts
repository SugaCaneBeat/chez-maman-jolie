"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { isValidRole, type AdminRole } from "@/lib/roles";
import { requireRole } from "@/lib/auth/require-role";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole | null;
  created_at: string;
  last_sign_in_at: string | null;
}

/* Extract role from a Supabase user (app_metadata.role) — returns null if absent. */
function roleOf(u: { app_metadata?: Record<string, unknown> }): AdminRole | null {
  const r = u.app_metadata?.role;
  return typeof r === "string" && isValidRole(r) ? r : null;
}

/* ── List all admin users (admin only) ── */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return [];

  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error || !data) return [];
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    role: roleOf(u),
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));
}

/* ── Create new admin user with role (admin only) ── */
export async function createAdminUser(
  email: string,
  password: string,
  role: AdminRole
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return auth.error;

  if (!email || !password) return { success: false, error: "Email et mot de passe requis" };
  if (password.length < 8) return { success: false, error: "Le mot de passe doit faire au moins 8 caractères" };
  if (!isValidRole(role)) return { success: false, error: "Rôle invalide" };

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { role },
  });

  if (error) {
    /* Ne pas leaker les détails Supabase au client. On log côté serveur. */
    console.warn("[admin-users] createAdminUser failed:", error.message);
    return { success: false, error: "Impossible de créer l'utilisateur" };
  }
  revalidatePath("/admin/users");
  return { success: true };
}

/* ── Delete admin user (admin only) ── */
export async function deleteAdminUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return auth.error;

  /* Empêcher l'auto-suppression du dernier admin (et de soi-même). */
  if (id === auth.user.id) {
    return { success: false, error: "Impossible de supprimer son propre compte" };
  }

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    console.warn("[admin-users] deleteAdminUser failed:", error.message);
    return { success: false, error: "Suppression impossible" };
  }
  revalidatePath("/admin/users");
  return { success: true };
}

/* ── Reset password (admin only) ── */
export async function resetAdminPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return auth.error;

  if (newPassword.length < 8) return { success: false, error: "Au moins 8 caractères requis" };
  const supabase = adminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, { password: newPassword });
  if (error) {
    console.warn("[admin-users] resetAdminPassword failed:", error.message);
    return { success: false, error: "Réinitialisation impossible" };
  }
  return { success: true };
}

/* ── Update a user's role (admin only) ── */
export async function updateAdminUserRole(
  id: string,
  role: AdminRole
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole(["admin"]);
  if (!auth.ok) return auth.error;

  if (!isValidRole(role)) return { success: false, error: "Rôle invalide" };

  /* Empêcher de se rétrograder soi-même (sortir d'admin). */
  if (id === auth.user.id && role !== "admin") {
    return { success: false, error: "Impossible de modifier son propre rôle" };
  }

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, {
    app_metadata: { role },
  });
  if (error) {
    console.warn("[admin-users] updateAdminUserRole failed:", error.message);
    return { success: false, error: "Mise à jour impossible" };
  }
  revalidatePath("/admin/users");
  return { success: true };
}
