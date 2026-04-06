"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getOrders(filters?: { status?: string; limit?: number }) {
  const supabase = createServerClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createServerClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function getOrderStats() {
  const supabase = createServerClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayOrders } = await supabase
    .from("orders")
    .select("total, status")
    .gte("created_at", today.toISOString());

  const { count: totalItems } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true });

  const { count: unavailableItems } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("available", false);

  const todayRevenue = (todayOrders || [])
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return {
    todayOrderCount: todayOrders?.length || 0,
    todayRevenue,
    pendingOrders: (todayOrders || []).filter(o => o.status === "pending").length,
    totalMenuItems: totalItems || 0,
    unavailableItems: unavailableItems || 0,
  };
}
