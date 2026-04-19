"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createMenuItem(data: {
  categoryId: string;
  name: string;
  price: number;
  image?: string;
  accompagnement?: string;
  badge?: string;
  boissonSubcategoryId?: string;
}) {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").insert({
    category_id: data.categoryId,
    name: data.name,
    price: data.price,
    image: data.image || null,
    accompagnement: data.accompagnement || null,
    badge: data.badge || null,
    boisson_subcategory_id: data.boissonSubcategoryId || null,
  });
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function toggleIsSpecialite(id: string, is_specialite: boolean) {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").update({ is_specialite }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function updateMenuItem(id: string, data: {
  name?: string;
  price?: number;
  image?: string;
  accompagnement?: string;
  badge?: string;
  available?: boolean;
  categoryId?: string;
}) {
  const supabase = createServerClient();
  const payload: Record<string, unknown> = { ...data };
  if (data.categoryId !== undefined) {
    payload.category_id = data.categoryId;
    delete payload.categoryId;
  }
  const { error } = await supabase.from("menu_items").update(payload).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function toggleItemAvailability(id: string, available: boolean) {
  return updateMenuItem(id, { available });
}

export async function createCategory(data: {
  name: string;
  icon?: string;
  type?: "standard" | "formules" | "boissons";
}) {
  const supabase = createServerClient();
  const slug = data.name.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `cat-${Date.now()}`;

  const { data: maxRow } = await supabase
    .from("categories")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const display_order = (maxRow?.display_order ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("categories")
    .insert({
      slug,
      name: data.name,
      icon: data.icon || "",
      type: data.type || "standard",
      active: true,
      display_order,
    })
    .select()
    .single();
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true, category: inserted };
}

export async function updateCategory(id: string, data: {
  name?: string;
  icon?: string;
  active?: boolean;
}) {
  const supabase = createServerClient();
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function toggleCategoryActive(id: string, active: boolean) {
  return updateCategory(id, { active });
}

export async function deleteCategory(id: string) {
  const supabase = createServerClient();
  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    return { success: false, error: "Categorie non vide : supprime d'abord les articles." };
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function uploadMenuImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  const itemName = (formData.get("itemName") as string) || "item";

  if (!file) return { success: false, error: "Aucun fichier" };
  if (!file.type.startsWith("image/")) return { success: false, error: "Fichier non image" };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "Image trop lourde (max 5MB)" };

  const supabase = createServerClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = itemName.toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "item";
  const fileName = `${safeName}-${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();

  const { error: uploadErr } = await supabase.storage
    .from("menu-images")
    .upload(fileName, bytes, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadErr) return { success: false, error: uploadErr.message };

  const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
  return { success: true, url: data.publicUrl };
}
