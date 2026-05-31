/**
 * Génère un résumé textuel compact du menu live, à injecter dans le
 * system prompt de l'agent IA. Permet à l'agent de parler du menu
 * fidèlement sans rien inventer.
 *
 * Format : sections + nom + prix + accompagnement, formaté pour être
 * efficace en tokens (l'agent va lire ça à chaque interaction).
 */

import { createClient } from "@supabase/supabase-js";

interface MenuRow {
  id: string;
  name: string;
  price: number;
  available: boolean;
  accompagnement: string | null;
  badge: string | null;
  category_id: string;
  is_specialite: boolean | null;
}

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  active: boolean;
  type: "standard" | "formules" | "boissons";
}

/* Cache en mémoire pour ne pas re-fetch à chaque requête.
 * TTL : 60 secondes (compromis entre fraîcheur et coût). */
let CACHE: { text: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function getMenuSnapshot(force = false): Promise<string> {
  if (!force && CACHE && CACHE.expiresAt > Date.now()) {
    return CACHE.text;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return "(menu indisponible — la base de données n'est pas configurée)";
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug, name, display_order, active, type")
    .eq("active", true)
    .order("display_order");

  const { data: items } = await supabase
    .from("menu_items")
    .select("id, name, price, available, accompagnement, badge, category_id, is_specialite")
    .eq("available", true)
    .order("display_order");

  if (!cats || !items) return "(menu temporairement indisponible)";

  const lines: string[] = [];

  for (const cat of cats as CategoryRow[]) {
    const sectionItems = (items as MenuRow[]).filter((i) => i.category_id === cat.id);
    if (sectionItems.length === 0) continue;

    lines.push(`\n## ${cat.name}`);
    for (const item of sectionItems) {
      const accomp = item.accompagnement ? ` (servi avec ${item.accompagnement})` : "";
      const badge = item.badge ? ` [${item.badge}]` : "";
      const spec = item.is_specialite ? " ⭐" : "";
      lines.push(`- ${item.name} — ${formatPrice(item.price)}${accomp}${badge}${spec}`);
    }
  }

  /* Specialités cross-category — pour les mettre en valeur */
  const specs = (items as MenuRow[]).filter((i) => i.is_specialite);
  if (specs.length > 0) {
    lines.unshift(
      `\n⭐ SPÉCIALITÉS MAISON À RECOMMANDER : ${specs.map((s) => s.name).join(", ")}`
    );
  }

  const text = lines.join("\n").trim();

  CACHE = { text, expiresAt: Date.now() + CACHE_TTL_MS };
  return text;
}

function formatPrice(price: number): string {
  return price % 1 === 0
    ? `${price} €`
    : `${price.toFixed(2).replace(".", ",")} €`;
}

/* Pour les besoins de test / debug */
export function clearMenuCache() {
  CACHE = null;
}
