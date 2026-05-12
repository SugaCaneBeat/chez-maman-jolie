/**
 * Système de rôles admin — 3 niveaux.
 *
 * Le rôle est stocké dans auth.users.app_metadata.role :
 * - "admin"     : accès complet
 * - "caissier"  : Commandes uniquement (validation/préparation)
 * - "tech"      : Menu, Médias, Dashboard (maintenance contenu)
 *
 * app_metadata est immodifiable côté client (seule la service_role peut
 * y toucher), donc c'est le bon endroit pour stocker un rôle.
 */

export type AdminRole = "admin" | "caissier" | "tech";

export const ALL_ROLES: AdminRole[] = ["admin", "caissier", "tech"];

export const ROLE_LABELS: Record<AdminRole, string> = {
  admin:    "Administrateur",
  caissier: "Caissier",
  tech:     "Technique",
};

export const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  admin:    "Accès complet à toutes les fonctionnalités",
  caissier: "Gestion des commandes uniquement",
  tech:     "Gestion du menu, des médias et du contenu",
};

/* Couleurs Tailwind utilitaires pour badge */
export const ROLE_COLORS: Record<AdminRole, { bg: string; text: string }> = {
  admin:    { bg: "bg-[#C9922A]/15", text: "text-[#C9922A]" },
  caissier: { bg: "bg-emerald-100",   text: "text-emerald-700" },
  tech:     { bg: "bg-blue-100",      text: "text-blue-700" },
};

/* ─── Permissions par rôle (pour la navigation + middleware) ───
 *  Chemin → liste des rôles autorisés.
 *  Le chemin /admin (dashboard) est accessible à tous les rôles authentifiés.
 */
export const ROUTE_PERMISSIONS: Array<{ path: string; roles: AdminRole[] }> = [
  { path: "/admin/orders",       roles: ["admin", "caissier"] },
  { path: "/admin/menu",         roles: ["admin", "tech"] },
  { path: "/admin/media",        roles: ["admin", "tech"] },
  { path: "/admin/users",        roles: ["admin"] },
  { path: "/admin/help",         roles: ["admin", "caissier", "tech"] },
];

/* Vérifie si un rôle a accès à un chemin donné. Le dashboard /admin est ouvert. */
export function canAccess(role: AdminRole | null | undefined, pathname: string): boolean {
  if (!role) return false;
  /* Dashboard principal accessible à tous les rôles connectés */
  if (pathname === "/admin" || pathname === "/admin/") return true;
  /* Cherche la règle qui matche le préfixe du chemin */
  const rule = ROUTE_PERMISSIONS.find((r) => pathname.startsWith(r.path));
  if (!rule) return true; /* chemin non listé → autorisé par défaut */
  return rule.roles.includes(role);
}

/* Vérifie qu'une string est un rôle valide */
export function isValidRole(s: string): s is AdminRole {
  return (ALL_ROLES as string[]).includes(s);
}

/* Aucun rôle par défaut : un user sans app_metadata.role explicite est
 * refusé partout. Ne JAMAIS mettre "admin" ici — n'importe quel inscrit
 * Supabase deviendrait admin si l'inscription publique est activée. */
export const DEFAULT_ROLE: AdminRole | null = null;
