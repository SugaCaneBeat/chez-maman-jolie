/**
 * Automated migration runner — npm run migrate
 *
 * Toutes les migrations utilisent IF NOT EXISTS → idempotentes.
 * Pre-requisite: run scripts/add-run-migration.sql in Supabase SQL Editor once.
 */

// Env chargee via --env-file=.env.local (Node 20+)
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

// ─────────────────────────────────────────────────────────────
//  Migrations (toutes idempotentes via IF NOT EXISTS)
// ─────────────────────────────────────────────────────────────
const migrations = [
  {
    label: "categories.active (BOOLEAN DEFAULT TRUE)",
    sql: "ALTER TABLE categories ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;",
  },
  {
    label: "menu_items.is_specialite (BOOLEAN DEFAULT FALSE)",
    sql: "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_specialite BOOLEAN NOT NULL DEFAULT FALSE;",
  },
  {
    label: "formule_components (table)",
    sql: `CREATE TABLE IF NOT EXISTS formule_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formule_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);`,
  },
];

// ─────────────────────────────────────────────────────────────
//  Runner
// ─────────────────────────────────────────────────────────────
console.log("\n🔄  Application des migrations...\n");

for (const m of migrations) {
  const { error } = await supabase.rpc("run_migration", { sql: m.sql });
  if (error) {
    console.error(`  ❌  ${m.label}: ${error.message}`);
    if (error.message.includes("run_migration") || error.message.includes("Could not find")) {
      console.error("");
      console.error("  ⚠️   La fonction run_migration n'existe pas encore dans votre base.");
      console.error("  👉  Executer scripts/add-run-migration.sql dans le SQL Editor Supabase,");
      console.error("      puis relancer: npm run migrate");
      process.exit(1);
    }
  } else {
    console.log(`  ✅  ${m.label}`);
  }
}

console.log("\n✅  Migrations terminees.\n");
