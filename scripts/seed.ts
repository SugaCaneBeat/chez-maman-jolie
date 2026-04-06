import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../src/data", file), "utf-8"));
}

const categoryDefs = [
  { slug: "entrees", name: "Entrées", icon: "🥗", type: "standard", file: "entrees.json" },
  { slug: "specialites", name: "Spécialités Maison", icon: "⭐", type: "standard", file: "specialites.json" },
  { slug: "viandes", name: "Viandes", icon: "🥩", type: "standard", file: "viandes.json" },
  { slug: "poissons", name: "Poissons", icon: "🐟", type: "standard", file: "poissons.json" },
  { slug: "mijotes", name: "Cuisine Mijotée", icon: "🍲", type: "standard", file: "mijotes.json" },
  { slug: "legumes", name: "Légumes", icon: "🥬", type: "standard", file: "legumes.json" },
  { slug: "accompagnements", name: "Accompagnements", icon: "🍚", type: "standard", file: "accompagnements.json" },
  { slug: "desserts", name: "Desserts", icon: "🍮", type: "standard", file: "desserts.json" },
  { slug: "formules", name: "Formules Midi", icon: "📋", type: "formules", file: "formules.json" },
  { slug: "boissons", name: "Boissons", icon: "🥤", type: "boissons", file: "boissons.json" },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await supabase.from("order_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("formule_conditions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("boisson_subcategories").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  for (let i = 0; i < categoryDefs.length; i++) {
    const def = categoryDefs[i];
    const data = readJson(def.file);

    // Insert category
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .insert({ slug: def.slug, name: def.name, icon: def.icon, type: def.type, display_order: i })
      .select()
      .single();

    if (catErr || !cat) {
      console.error(`❌ Category ${def.slug}:`, catErr?.message);
      continue;
    }
    console.log(`✅ Category: ${def.name}`);

    if (def.type === "boissons") {
      // Boissons have nested categories
      const boissonsData = data as { categories: { name: string; image?: string; items: { name: string; price: number }[] }[] };
      for (let j = 0; j < boissonsData.categories.length; j++) {
        const subcat = boissonsData.categories[j];
        const { data: sub, error: subErr } = await supabase
          .from("boisson_subcategories")
          .insert({ category_id: cat.id, name: subcat.name, image: subcat.image || null, display_order: j })
          .select()
          .single();

        if (subErr || !sub) {
          console.error(`  ❌ Subcategory ${subcat.name}:`, subErr?.message);
          continue;
        }

        const items = subcat.items.map((item, k) => ({
          category_id: cat.id,
          boisson_subcategory_id: sub.id,
          name: item.name,
          price: item.price,
          display_order: k,
        }));

        const { error: itemsErr } = await supabase.from("menu_items").insert(items);
        if (itemsErr) console.error(`  ❌ Items for ${subcat.name}:`, itemsErr.message);
        else console.log(`  📦 ${subcat.name}: ${items.length} items`);
      }
    } else if (def.type === "formules") {
      // Formules have items + conditions
      const formulesData = data as { formules: { name: string; price: number }[]; conditions: string };
      const items = formulesData.formules.map((f, k) => ({
        category_id: cat.id,
        name: f.name,
        price: f.price,
        display_order: k,
      }));

      const { error: itemsErr } = await supabase.from("menu_items").insert(items);
      if (itemsErr) console.error(`  ❌ Formule items:`, itemsErr.message);
      else console.log(`  📦 ${items.length} formules`);

      const { error: condErr } = await supabase
        .from("formule_conditions")
        .insert({ category_id: cat.id, conditions: formulesData.conditions });
      if (condErr) console.error(`  ❌ Conditions:`, condErr.message);
      else console.log(`  📝 Conditions saved`);
    } else {
      // Standard category: array of items
      const items = (data as { name: string; price: number; image?: string; accompagnement?: string; badge?: string }[]).map((item, k) => ({
        category_id: cat.id,
        name: item.name,
        price: item.price,
        image: item.image || null,
        accompagnement: item.accompagnement || null,
        badge: item.badge || null,
        display_order: k,
      }));

      const { error: itemsErr } = await supabase.from("menu_items").insert(items);
      if (itemsErr) console.error(`  ❌ Items:`, itemsErr.message);
      else console.log(`  📦 ${items.length} items`);
    }
  }

  console.log("\n✅ Seed complete!");
}

seed().catch(console.error);
