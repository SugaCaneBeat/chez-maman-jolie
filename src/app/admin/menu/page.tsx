import { createServerClient } from "@/lib/supabase/server";
import MenuEditor from "./MenuEditor";

async function getMenuDataForAdmin() {
  try {
    const supabase = createServerClient();
    const { data: categories } = await supabase
      .from("categories")
      .select("*")
      .order("display_order");

    const { data: items } = await supabase
      .from("menu_items")
      .select("*")
      .order("display_order");

    return { categories: categories || [], items: items || [] };
  } catch {
    return { categories: [], items: [] };
  }
}

export default async function AdminMenuPage() {
  const { categories, items } = await getMenuDataForAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion du Menu</h1>
      <MenuEditor initialCategories={categories} initialItems={items} />
    </div>
  );
}
