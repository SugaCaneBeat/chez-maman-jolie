"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ─── Types ─── */
export interface PickerItem {
  id: string;
  name: string;
  image?: string | null;
}

export interface FormuleComponent {
  component_type: string;
  menu_item_id: string;
  item: { id: string; name: string; image?: string | null };
}

export interface FormuleWithComponents {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  available: boolean;
  components: FormuleComponent[];
}

/* ─── getMenuItemsForPicker ─── */
export async function getMenuItemsForPicker(): Promise<{
  entrees: PickerItem[];
  plats: PickerItem[];
  desserts: PickerItem[];
  boissons: PickerItem[];
}> {
  const supabase = createServerClient();

  // Fetch all categories once
  const { data: cats } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("active", true);

  const catBySlug = Object.fromEntries(
    (cats || []).map((c: { id: string; slug: string }) => [c.slug, c.id])
  );

  const platSlugs = ["viandes", "poissons", "mijotes", "legumes", "specialites"];

  // entrees
  const entreeIds = catBySlug["entrees"] ? [catBySlug["entrees"]] : [];
  const platIds   = platSlugs.map(s => catBySlug[s]).filter(Boolean) as string[];
  const dessertIds = catBySlug["desserts"] ? [catBySlug["desserts"]] : [];

  const [entreesRes, platsRes, dessertsRes, boissonsRes] = await Promise.all([
    entreeIds.length
      ? supabase
          .from("menu_items")
          .select("id, name, image")
          .in("category_id", entreeIds)
          .eq("available", true)
          .order("display_order")
      : Promise.resolve({ data: [] }),

    platIds.length
      ? supabase
          .from("menu_items")
          .select("id, name, image")
          .in("category_id", platIds)
          .eq("available", true)
          .order("display_order")
      : Promise.resolve({ data: [] }),

    dessertIds.length
      ? supabase
          .from("menu_items")
          .select("id, name, image")
          .in("category_id", dessertIds)
          .eq("available", true)
          .order("display_order")
      : Promise.resolve({ data: [] }),

    supabase
      .from("menu_items")
      .select("id, name, image")
      .not("boisson_subcategory_id", "is", null)
      .eq("available", true)
      .order("display_order"),
  ]);

  const toItem = (r: { id: string; name: string; image?: string | null }): PickerItem => ({
    id: r.id,
    name: r.name,
    image: r.image ?? null,
  });

  return {
    entrees:  (entreesRes.data  || []).map(toItem),
    plats:    (platsRes.data    || []).map(toItem),
    desserts: (dessertsRes.data || []).map(toItem),
    boissons: (boissonsRes.data || []).map(toItem),
  };
}

/* ─── getFormules ─── */
export async function getFormules(categoryId: string): Promise<FormuleWithComponents[]> {
  const supabase = createServerClient();

  const { data: items, error } = await supabase
    .from("menu_items")
    .select("id, name, price, image, available")
    .eq("category_id", categoryId)
    .order("display_order");

  if (error || !items) return [];

  const formules: FormuleWithComponents[] = [];

  for (const item of items) {
    const { data: comps } = await supabase
      .from("formule_components")
      .select("component_type, menu_item_id, display_order")
      .eq("formule_id", item.id)
      .order("display_order");

    const components: FormuleComponent[] = [];

    for (const comp of comps || []) {
      const { data: linked } = await supabase
        .from("menu_items")
        .select("id, name, image")
        .eq("id", comp.menu_item_id)
        .single();

      if (linked) {
        components.push({
          component_type: comp.component_type,
          menu_item_id: comp.menu_item_id,
          item: { id: linked.id, name: linked.name, image: linked.image ?? null },
        });
      }
    }

    formules.push({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image ?? null,
      available: item.available,
      components,
    });
  }

  return formules;
}

/* ─── saveFormule ─── */
export async function saveFormule(data: {
  formuleId?: string;
  categoryId: string;
  name: string;
  price: number;
  image?: string;
  components: Array<{ menuItemId: string; componentType: string }>;
}): Promise<{ success: boolean; formuleId?: string; error?: string }> {
  const supabase = createServerClient();

  let formuleId = data.formuleId;

  if (formuleId) {
    // UPDATE existing
    const { error: updateErr } = await supabase
      .from("menu_items")
      .update({
        name: data.name,
        price: data.price,
        ...(data.image !== undefined ? { image: data.image } : {}),
      })
      .eq("id", formuleId);

    if (updateErr) return { success: false, error: updateErr.message };

    // Remove old components
    const { error: delErr } = await supabase
      .from("formule_components")
      .delete()
      .eq("formule_id", formuleId);

    if (delErr) return { success: false, error: delErr.message };
  } else {
    // INSERT new menu_item
    const { data: inserted, error: insertErr } = await supabase
      .from("menu_items")
      .insert({
        category_id: data.categoryId,
        name: data.name,
        price: data.price,
        image: data.image || null,
        available: true,
      })
      .select("id")
      .single();

    if (insertErr || !inserted) return { success: false, error: insertErr?.message || "Insert failed" };
    formuleId = inserted.id;
  }

  // INSERT components
  if (data.components.length > 0) {
    const rows = data.components.map((c, i) => ({
      formule_id: formuleId as string,
      menu_item_id: c.menuItemId,
      component_type: c.componentType,
      display_order: i,
    }));

    const { error: compErr } = await supabase.from("formule_components").insert(rows);
    if (compErr) return { success: false, error: compErr.message };
  }

  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true, formuleId };
}

/* ─── deleteFormule ─── */
export async function deleteFormule(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

/* ─── toggleFormuleAvailable ─── */
export async function toggleFormuleAvailable(id: string, available: boolean): Promise<{ success: boolean }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").update({ available }).eq("id", id);
  if (error) return { success: false };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

/* ─── updateFormuleImage ─── */
export async function updateFormuleImage(formuleId: string, imageUrl: string): Promise<{ success: boolean }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").update({ image: imageUrl }).eq("id", formuleId);
  if (error) return { success: false };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}
