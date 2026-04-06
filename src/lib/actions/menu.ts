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

export async function updateMenuItem(id: string, data: {
  name?: string;
  price?: number;
  image?: string;
  accompagnement?: string;
  badge?: string;
  available?: boolean;
}) {
  const supabase = createServerClient();
  const { error } = await supabase.from("menu_items").update(data).eq("id", id);
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
