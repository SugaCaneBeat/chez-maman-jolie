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

  const totalItems = items.length;
  const availableItems = items.filter((i) => i.available).length;
  const withImage = items.filter((i) => i.image).length;
  const specialites = items.filter((i) => i.is_specialite).length;
  const avgPrice = totalItems > 0
    ? items.reduce((s, i) => s + Number(i.price), 0) / totalItems
    : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestion du Menu</h1>
        <p className="text-gray-500 text-sm mt-1">
          Catégories, plats, formules et boissons — tout votre menu.
        </p>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Plats total" value={String(totalItems)} />
        <StatCard label="Disponibles" value={String(availableItems)} accent="emerald" />
        <StatCard label="Indisponibles" value={String(totalItems - availableItems)} accent={totalItems - availableItems > 0 ? "red" : "default"} />
        <StatCard label="Avec photo" value={`${withImage}/${totalItems}`} />
        <StatCard label="Prix moyen" value={`${avgPrice.toFixed(0)} €`} />
      </div>

      <MenuEditor
        initialCategories={categories}
        initialItems={items}
        globalStats={{ totalItems, availableItems, withImage, specialites, avgPrice }}
      />
    </div>
  );
}

function StatCard({ label, value, accent = "default" }: { label: string; value: string; accent?: "default" | "emerald" | "red" }) {
  const colorMap = {
    default: "text-gray-900",
    emerald: "text-emerald-600",
    red:     "text-red-500",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-[5px] p-3 lg:p-4 shadow-sm">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{label}</p>
      <p className={`text-2xl font-bold mt-1 tracking-tight ${colorMap[accent]}`}>{value}</p>
    </div>
  );
}
