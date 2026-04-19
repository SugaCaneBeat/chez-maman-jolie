import entreesJson from "@/data/entrees.json";
import specialitesJson from "@/data/specialites.json";
import viandesJson from "@/data/viandes.json";
import poissonsJson from "@/data/poissons.json";
import mijotesJson from "@/data/mijotes.json";
import legumesJson from "@/data/legumes.json";
import accompagnementsJson from "@/data/accompagnements.json";
import dessertsJson from "@/data/desserts.json";
import formulesJson from "@/data/formules.json";
import boissonsJson from "@/data/boissons.json";

export interface MenuItem {
  id?: string;
  name: string;
  price: number;
  image?: string;
  accompagnement?: string;
  badge?: string;
}

export interface BoissonSubcategory {
  name: string;
  image?: string;
  items: { name: string; price: number }[];
}

export interface FormuleComponent {
  component_type: string;
  menu_item_id: string;
  item: { id: string; name: string; image?: string };
}

export interface Formule {
  id: string;
  name: string;
  price: number;
  image?: string;
  components: FormuleComponent[];
}

export interface FormulesData {
  formules: Formule[];
  conditions: string;
}

export interface BoissonsData {
  categories: BoissonSubcategory[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  type: "standard" | "formules" | "boissons";
  items: MenuItem[];
  boissonsData?: BoissonsData;
  formulesData?: FormulesData;
}

export async function getMenuData(): Promise<Category[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || url.includes("YOUR_PROJECT")) throw new Error("Not configured");

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    // Fetch categories
    const { data: cats, error: catsErr } = await supabase
      .from("categories")
      .select("*")
      .eq("active", true)
      .order("display_order");
    if (catsErr || !cats || cats.length === 0) throw catsErr;

    const categories: Category[] = [];

    for (const cat of cats) {
      if (cat.type === "boissons") {
        // Fetch subcategories + their items
        const { data: subs } = await supabase
          .from("boisson_subcategories")
          .select("*")
          .eq("category_id", cat.id)
          .order("display_order");

        const subcats: BoissonSubcategory[] = [];
        for (const sub of subs || []) {
          const { data: items } = await supabase
            .from("menu_items")
            .select("*")
            .eq("boisson_subcategory_id", sub.id)
            .eq("available", true)
            .order("display_order");
          subcats.push({
            name: sub.name,
            image: sub.image,
            items: (items || []).map(i => ({ name: i.name, price: Number(i.price) })),
          });
        }

        categories.push({
          id: cat.id, slug: cat.slug, name: cat.name, icon: cat.icon, type: cat.type,
          items: [],
          boissonsData: { categories: subcats },
        });
      } else if (cat.type === "formules") {
        const { data: items } = await supabase
          .from("menu_items")
          .select("*")
          .eq("category_id", cat.id)
          .eq("available", true)
          .order("display_order");

        const { data: cond } = await supabase
          .from("formule_conditions")
          .select("*")
          .eq("category_id", cat.id)
          .single();

        // Build Formule[] with components
        const formules: Formule[] = [];
        for (const i of (items || [])) {
          const { data: comps } = await supabase
            .from("formule_components")
            .select("component_type, menu_item_id, display_order")
            .eq("formule_id", i.id)
            .order("display_order");

          const components: FormuleComponent[] = [];
          for (const comp of (comps || [])) {
            const { data: linked } = await supabase
              .from("menu_items")
              .select("id, name, image")
              .eq("id", comp.menu_item_id)
              .single();
            if (linked) {
              components.push({
                component_type: comp.component_type,
                menu_item_id: comp.menu_item_id,
                item: { id: linked.id, name: linked.name, image: linked.image ?? undefined },
              });
            }
          }

          formules.push({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            image: i.image ?? undefined,
            components,
          });
        }

        categories.push({
          id: cat.id, slug: cat.slug, name: cat.name, icon: cat.icon, type: cat.type,
          items: (items || []).map(i => ({ id: i.id, name: i.name, price: Number(i.price), image: i.image })),
          formulesData: {
            formules,
            conditions: cond?.conditions || "",
          },
        });
      } else if (cat.slug === "specialites") {
        // Items marqués is_specialite sur toutes les catégories
        const { data: items } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_specialite", true)
          .eq("available", true)
          .order("display_order");

        categories.push({
          id: cat.id, slug: cat.slug, name: cat.name, icon: cat.icon, type: cat.type,
          items: (items || []).map(i => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            image: i.image,
            accompagnement: i.accompagnement,
            badge: i.badge,
          })),
        });
      } else {
        const { data: items } = await supabase
          .from("menu_items")
          .select("*")
          .eq("category_id", cat.id)
          .eq("available", true)
          .order("display_order");

        categories.push({
          id: cat.id, slug: cat.slug, name: cat.name, icon: cat.icon, type: cat.type,
          items: (items || []).map(i => ({
            id: i.id,
            name: i.name,
            price: Number(i.price),
            image: i.image,
            accompagnement: i.accompagnement,
            badge: i.badge,
          })),
        });
      }
    }

    return categories;
  } catch {
    // Fallback to static JSON
    return buildFromJson();
  }
}

function buildFromJson(): Category[] {
  return [
    { id: "entrees", slug: "entrees", name: "Entrées", icon: "🥗", type: "standard", items: entreesJson },
    { id: "specialites", slug: "specialites", name: "Spécialités Maison", icon: "⭐", type: "standard", items: specialitesJson },
    { id: "viandes", slug: "viandes", name: "Viandes", icon: "🥩", type: "standard", items: viandesJson },
    { id: "poissons", slug: "poissons", name: "Poissons", icon: "🐟", type: "standard", items: poissonsJson },
    { id: "mijotes", slug: "mijotes", name: "Cuisine Mijotée", icon: "🍲", type: "standard", items: mijotesJson },
    { id: "legumes", slug: "legumes", name: "Légumes", icon: "🥬", type: "standard", items: legumesJson },
    { id: "accompagnements", slug: "accompagnements", name: "Accompagnements", icon: "🍚", type: "standard", items: accompagnementsJson },
    { id: "desserts", slug: "desserts", name: "Desserts", icon: "🍮", type: "standard", items: dessertsJson },
    {
      id: "formules", slug: "formules", name: "Formules Midi", icon: "📋", type: "formules", items: [],
      formulesData: {
        formules: (formulesJson.formules as { name: string; price: number }[]).map((f, i) => ({
          id: `fallback-${i}`,
          name: f.name,
          price: f.price,
          components: [],
        })),
        conditions: formulesJson.conditions,
      },
    },
    { id: "boissons", slug: "boissons", name: "Boissons", icon: "🥤", type: "boissons", items: [], boissonsData: boissonsJson },
  ];
}
