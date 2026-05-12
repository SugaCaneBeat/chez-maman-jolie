/**
 * Helper pour récupérer l'utilisateur courant + son rôle côté serveur
 * (dans un Server Component, server action ou route handler).
 */

import { cookies } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { DEFAULT_ROLE, isValidRole, type AdminRole } from "@/lib/roles";

export interface CurrentUser {
  id: string;
  email: string;
  role: AdminRole | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  const supabase = createSSRClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        /* read-only en RSC */
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const roleStr = (user.app_metadata as { role?: string } | undefined)?.role;
  const role: AdminRole | null =
    roleStr && isValidRole(roleStr) ? roleStr : DEFAULT_ROLE;

  return {
    id: user.id,
    email: user.email ?? "",
    role,
  };
}
