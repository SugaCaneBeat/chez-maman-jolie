/**
 * Garde d'authentification pour server actions.
 *
 * Toute mutation côté admin (ou tout call qui utilise la clé service_role)
 * DOIT commencer par un appel à requireRole() pour vérifier que l'utilisateur
 * connecté a bien le droit d'effectuer cette action.
 *
 * Sans cette garde, n'importe qui sur Internet peut appeler la server action
 * directement (Next expose chaque action comme un POST avec un ID prévisible).
 *
 * Usage :
 *
 *   "use server";
 *   import { requireRole } from "@/lib/auth/require-role";
 *
 *   export async function createMenuItem(input) {
 *     const auth = await requireRole(["admin", "tech"]);
 *     if (!auth.ok) return auth.error;     // { success: false, error: "..." }
 *
 *     // ...mutation autorisée
 *   }
 */

import { getCurrentUser, type CurrentUser } from "@/lib/supabase/user";
import type { AdminRole } from "@/lib/roles";

export type RequireRoleResult =
  | { ok: true; user: CurrentUser & { role: AdminRole } }
  | { ok: false; error: { success: false; error: string } };

export async function requireRole(
  allowed: AdminRole[]
): Promise<RequireRoleResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      ok: false,
      error: { success: false, error: "Authentification requise." },
    };
  }

  if (!user.role || !allowed.includes(user.role)) {
    return {
      ok: false,
      error: { success: false, error: "Accès refusé." },
    };
  }

  return { ok: true, user: { ...user, role: user.role } };
}

/* Variante qui throw — utile dans les pages serveur où on veut juste
 * que Next renvoie une 403 plutôt que de gérer le retour. */
export async function assertRole(allowed: AdminRole[]): Promise<CurrentUser & { role: AdminRole }> {
  const r = await requireRole(allowed);
  if (!r.ok) throw new Error(r.error.error);
  return r.user;
}
