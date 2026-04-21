"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/* ─── Types ─── */
export interface BoissonItemAdmin {
  id: string;
  name: string;
  price: number;
  image: string | null;
  available: boolean;
  display_order: number;
}

export interface BoissonSubcategoryAdmin {
  id: string;
  name: string;
  image: string | null;
  display_order: number;
  items: BoissonItemAdmin[];
}

/* ─── List all subcategories + their items for a given boissons category ─── */
export async function listBoissonSubcategories(
  categoryId: string
): Promise<BoissonSubcategoryAdmin[]> {
  const supabase = createServerClient();

  const { data: subs, error } = await supabase
    .from("boisson_subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("display_order");

  if (error || !subs) return [];

  const result: BoissonSubcategoryAdmin[] = [];
  for (const sub of subs) {
    const { data: items } = await supabase
      .from("menu_items")
      .select("id, name, price, image, available, display_order")
      .eq("boisson_subcategory_id", sub.id)
      .order("display_order");

    result.push({
      id: sub.id,
      name: sub.name,
      image: sub.image ?? null,
      display_order: sub.display_order ?? 0,
      items: (items || []).map(i => ({
        id: i.id,
        name: i.name,
        price: Number(i.price),
        image: i.image ?? null,
        available: i.available,
        display_order: i.display_order ?? 0,
      })),
    });
  }
  return result;
}

/* ─── Subcategory CRUD ─── */
export async function createBoissonSubcategory(
  categoryId: string,
  name: string,
  image?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!name.trim()) return { success: false, error: "Nom requis" };
  const supabase = createServerClient();

  /* Place new subcategory at the end */
  const { data: existing } = await supabase
    .from("boisson_subcategories")
    .select("display_order")
    .eq("category_id", categoryId)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = existing?.[0]?.display_order != null ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from("boisson_subcategories")
    .insert({
      category_id: categoryId,
      name: name.trim(),
      image: image || null,
      display_order: nextOrder,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message || "Erreur" };

  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateBoissonSubcategory(
  id: string,
  data: { name?: string; image?: string | null }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined)  patch.name = data.name.trim();
  if (data.image !== undefined) patch.image = data.image || null;

  const { error } = await supabase
    .from("boisson_subcategories")
    .update(patch)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBoissonSubcategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  /* Les items seront supprimés via ON DELETE CASCADE si la FK est configurée,
     sinon on les supprime manuellement d'abord */
  await supabase.from("menu_items").delete().eq("boisson_subcategory_id", id);
  const { error } = await supabase
    .from("boisson_subcategories")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

/* ─── Item CRUD ─── */
export async function createBoissonItem(
  subcategoryId: string,
  categoryId: string,
  name: string,
  price: number,
  image?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!name.trim()) return { success: false, error: "Nom requis" };
  if (!(price > 0)) return { success: false, error: "Prix invalide" };

  const supabase = createServerClient();

  const { data: existing } = await supabase
    .from("menu_items")
    .select("display_order")
    .eq("boisson_subcategory_id", subcategoryId)
    .order("display_order", { ascending: false })
    .limit(1);
  const nextOrder = existing?.[0]?.display_order != null ? existing[0].display_order + 1 : 0;

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      category_id: categoryId,
      boisson_subcategory_id: subcategoryId,
      name: name.trim(),
      price,
      image: image || null,
      available: true,
      display_order: nextOrder,
    })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message || "Erreur" };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true, id: data.id };
}

export async function updateBoissonItem(
  id: string,
  data: { name?: string; price?: number; image?: string | null }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const patch: Record<string, unknown> = {};
  if (data.name !== undefined)  patch.name = data.name.trim();
  if (data.price !== undefined) patch.price = data.price;
  if (data.image !== undefined) patch.image = data.image || null;

  const { error } = await supabase.from("menu_items").update(patch).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBoissonItem(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function toggleBoissonItemAvailable(
  id: string,
  available: boolean
): Promise<{ success: boolean }> {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").update({ available }).eq("id", id);
  if (error) return { success: false };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}
