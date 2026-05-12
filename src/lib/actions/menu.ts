"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";

const MENU_ROLES = ["admin", "tech"] as const;

/* Whitelist d'extensions d'image acceptées en upload */
const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function createMenuItem(data: {
  categoryId: string;
  name: string;
  price: number;
  image?: string;
  accompagnement?: string;
  badge?: string;
  boissonSubcategoryId?: string;
}) {
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const { data: created, error } = await supabase
    .from("menu_items")
    .insert({
      category_id: data.categoryId,
      name: data.name,
      price: data.price,
      image: data.image || null,
      accompagnement: data.accompagnement || null,
      badge: data.badge || null,
      boisson_subcategory_id: data.boissonSubcategoryId || null,
    })
    .select()
    .single();
  if (error) {
    console.warn("[menu] createMenuItem:", error.message);
    return { success: false, error: "Création impossible" };
  }
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true, item: created };
}

export async function toggleIsSpecialite(id: string, is_specialite: boolean) {
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").update({ is_specialite }).eq("id", id);
  if (error) {
    console.warn("[menu] toggleIsSpecialite:", error.message);
    return { success: false, error: "Mise à jour impossible" };
  }
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
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const payload: Record<string, unknown> = { ...data };
  if (data.categoryId !== undefined) {
    payload.category_id = data.categoryId;
    delete payload.categoryId;
  }
  const { error } = await supabase.from("menu_items").update(payload).eq("id", id);
  if (error) {
    console.warn("[menu] updateMenuItem:", error.message);
    return { success: false, error: "Mise à jour impossible" };
  }
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMenuItem(id: string) {
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) {
    console.warn("[menu] deleteMenuItem:", error.message);
    return { success: false, error: "Suppression impossible" };
  }
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
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const slug = data.name.toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
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
  if (error) {
    console.warn("[menu] createCategory:", error.message);
    return { success: false, error: "Création de catégorie impossible" };
  }
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true, category: inserted };
}

export async function updateCategory(id: string, data: {
  name?: string;
  icon?: string;
  active?: boolean;
}) {
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const { error } = await supabase.from("categories").update(data).eq("id", id);
  if (error) {
    console.warn("[menu] updateCategory:", error.message);
    return { success: false, error: "Mise à jour impossible" };
  }
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function toggleCategoryActive(id: string, active: boolean) {
  return updateCategory(id, { active });
}

export async function deleteCategory(id: string) {
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const { count } = await supabase
    .from("menu_items")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    return { success: false, error: "Categorie non vide : supprime d'abord les articles." };
  }
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.warn("[menu] deleteCategory:", error.message);
    return { success: false, error: "Suppression impossible" };
  }
  revalidatePath("/admin/menu");
  revalidatePath("/");
  return { success: true };
}

export async function uploadMenuImage(formData: FormData) {
  const auth = await requireRole([...MENU_ROLES]);
  if (!auth.ok) return auth.error;

  const file = formData.get("file") as File | null;
  const itemName = (formData.get("itemName") as string) || "item";

  if (!file) return { success: false, error: "Aucun fichier" };

  /* Validation : MIME ET extension contre une whitelist (les deux peuvent être
   * usurpés indépendamment côté client, on impose la cohérence des deux). */
  if (!ALLOWED_IMAGE_MIME.has(file.type)) {
    return { success: false, error: "Format non supporté (JPG, PNG, WebP, GIF)" };
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_IMAGE_EXT.has(ext)) {
    return { success: false, error: "Extension non supportée" };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, error: "Image trop lourde (max 5MB)" };
  }

  const supabase = createServerClient();

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

  if (uploadErr) {
    console.warn("[menu] uploadMenuImage:", uploadErr.message);
    return { success: false, error: "Upload impossible" };
  }

  const { data } = supabase.storage.from("menu-images").getPublicUrl(fileName);
  return { success: true, url: data.publicUrl };
}
