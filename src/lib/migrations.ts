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
  {
    label: "formule_components",
    sql: `CREATE TABLE IF NOT EXISTS formule_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formule_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);`,
  },
  {
    label: "orders.sumup_checkout_id",
    sql: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS sumup_checkout_id TEXT;",
  },
  {
    label: "orders.sumup_reference",
    sql: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS sumup_reference TEXT;",
  },
  {
    /* Le check constraint d'origine n'inclut pas 'paid', ce qui empêche
       le webhook SumUp et verifyAndSyncSumUpPayment de mettre à jour le
       statut après un paiement carte réussi. */
    label: "orders.status_check (allow paid)",
    sql: `ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
          ALTER TABLE orders ADD CONSTRAINT orders_status_check
            CHECK (status IN ('pending','paid','confirmed','preparing','ready','delivering','delivered','cancelled'));`,
  },
  {
    label: "orders.tip (pourboire)",
    sql: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS tip NUMERIC(10,2) DEFAULT 0;",
  },
  {
    label: "orders.estimated_delivery_at (ETA livraison)",
    sql: "ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ;",
  },
  {
    /* Permet la suppression d'une commande de supprimer aussi ses items */
    label: "order_items.order_id ON DELETE CASCADE",
    sql: `DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'order_items_order_id_fkey'
      AND pg_get_constraintdef(oid) LIKE '%ON DELETE CASCADE%'
  ) THEN
    ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
    ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
  END IF;
END
$$;`,
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
