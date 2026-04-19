/**
 * Auto-migration au démarrage du serveur Next.js.
 * Chaque migration vérifie d'abord si elle est nécessaire,
 * puis appelle run_migration() (fonction SQL SECURITY DEFINER).
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// ─────────────────────────────────────────────────────────────
// Liste des migrations (idempotentes)
// ─────────────────────────────────────────────────────────────
// Toutes idempotentes via IF NOT EXISTS
const MIGRATIONS: Array<{ label: string; sql: string }> = [
  {
    label: "categories.active",
    sql: "ALTER TABLE categories ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;",
  },
  {
    label: "menu_items.is_specialite",
    sql: "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_specialite BOOLEAN NOT NULL DEFAULT FALSE;",
  },
];

// ─────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────
export async function runMigrations() {
  if (!url || !key || url.includes("YOUR_PROJECT")) return;

  const supabase = createClient(url, key);

  for (const m of MIGRATIONS) {
    try {
      const { error } = await supabase.rpc("run_migration", { sql: m.sql });
      if (error) {
        console.warn(`[migrations] ${m.label} — échec:`, error.message);
      } else {
        console.log(`[migrations] ✅ ${m.label} OK`);
      }
    } catch (e) {
      console.warn(`[migrations] ${m.label} — erreur inattendue:`, e);
    }
  }
}

// Lance les migrations immédiatement à l'import
runMigrations().catch(() => {/* silencieux en prod */});
