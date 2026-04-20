"use server";

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

/* ── List all admin users ── */
export async function listAdminUsers(): Promise<AdminUser[]> {
  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error || !data) return [];
  return data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
  }));
}

/* ── Create new admin user ── */
export async function createAdminUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  if (!email || !password) return { success: false, error: "Email et mot de passe requis" };
  if (password.length < 8) return { success: false, error: "Le mot de passe doit faire au moins 8 caractères" };

  const supabase = adminClient();
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* ── Delete admin user ── */
export async function deleteAdminUser(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = adminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* ── Reset password ── */
export async function resetAdminPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) return { success: false, error: "Au moins 8 caractères requis" };
  const supabase = adminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, { password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
