"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";

const ORDERS_ROLES = ["admin", "caissier"] as const;

/* Polling client : ne renvoie que les changements récents */
export async function getActiveOrders() {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) return { success: false, error: "Accès refusé", data: [] };

  const supabase = createServerClient();
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); /* 48h */
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .gte("created_at", cutoff.toISOString())
    .order("created_at", { ascending: false });
  if (error) {
    console.warn("[admin-orders] getActiveOrders failed:", error.message);
    return { success: false, error: "Lecture impossible", data: [] };
  }
  return { success: true, data: data || [] };
}

export async function getOrders(filters?: { status?: string; limit?: number }) {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) return { success: false, error: "Accès refusé", data: [] };

  const supabase = createServerClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  /* Limite par défaut pour éviter de scanner toute la table */
  const limit = Math.min(filters?.limit ?? 200, 500);
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.warn("[admin-orders] getOrders failed:", error.message);
    return { success: false, error: "Lecture impossible", data: [] };
  }
  return { success: true, data: data || [] };
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  /* Cascade : order_items est supprimé via ON DELETE CASCADE en DB */
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) {
    console.warn("[admin-orders] deleteOrder failed:", error.message);
    return { success: false, error: "Suppression impossible" };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function bulkDeleteOrders(orderIds: string[]): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) return { success: false, deletedCount: 0, error: "Accès refusé" };

  if (!orderIds.length) return { success: true, deletedCount: 0 };
  /* Sécurité : limiter la taille du batch */
  if (orderIds.length > 100) {
    return { success: false, deletedCount: 0, error: "Trop d'éléments (max 100)" };
  }

  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("orders")
    .delete({ count: "exact" })
    .in("id", orderIds);
  if (error) {
    console.warn("[admin-orders] bulkDeleteOrders failed:", error.message);
    return { success: false, deletedCount: 0, error: "Suppression en lot impossible" };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true, deletedCount: count ?? orderIds.length };
}

export async function bulkUpdateOrdersStatus(
  orderIds: string[],
  status: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) return auth.error;

  if (!orderIds.length) return { success: true };
  if (orderIds.length > 100) {
    return { success: false, error: "Trop d'éléments (max 100)" };
  }

  const supabase = createServerClient();
  const patch: Record<string, unknown> = { status };
  if (status === "delivered" || status === "cancelled") {
    patch.estimated_delivery_at = null;
  }
  const { error } = await supabase.from("orders").update(patch).in("id", orderIds);
  if (error) {
    console.warn("[admin-orders] bulkUpdateOrdersStatus failed:", error.message);
    return { success: false, error: "Mise à jour impossible" };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  etaMinutes?: number
) {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) return auth.error;

  const supabase = createServerClient();
  const patch: Record<string, unknown> = { status };
  /* Si on passe en livraison et qu'on a un ETA en minutes, on calcule la date */
  if (status === "delivering" && typeof etaMinutes === "number" && etaMinutes > 0) {
    patch.estimated_delivery_at = new Date(Date.now() + etaMinutes * 60_000).toISOString();
  }
  /* Si on passe en livrée, on efface l'ETA */
  if (status === "delivered" || status === "cancelled") {
    patch.estimated_delivery_at = null;
  }
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);
  if (error) {
    console.warn("[admin-orders] updateOrderStatus failed:", error.message);
    return { success: false, error: "Mise à jour impossible" };
  }
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { success: true };
}

export async function getOrderStats() {
  const auth = await requireRole([...ORDERS_ROLES]);
  if (!auth.ok) {
    return {
      todayOrderCount: 0,
      todayRevenue: 0,
      todayAOV: 0,
      yesterdayRevenue: 0,
      yesterdayCount: 0,
      revenueDelta: 0,
      countDelta: 0,
      weekRevenue: 0,
      pendingOrders: 0,
      statusBreakdown: {} as Record<string, number>,
      dailyRevenue: [] as { day: string; date: string; revenue: number; count: number }[],
      paymentBreakdown: [] as { method: string; count: number; revenue: number }[],
      totalMenuItems: 0,
      unavailableItems: 0,
    };
  }

  const supabase = createServerClient();
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);

  /* All orders for the last 7 days (for stats + chart) */
  const { data: weekOrders } = await supabase
    .from("orders")
    .select("total, tip, status, payment_method, created_at")
    .gte("created_at", weekAgo.toISOString());

  const { count: totalItems } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true });

  const { count: unavailableItems } = await supabase
    .from("menu_items")
    .select("*", { count: "exact", head: true })
    .eq("available", false);

  const all = (weekOrders || []).filter((o) => o.status !== "cancelled");

  /* Today */
  const todayOrders  = all.filter((o) => new Date(o.created_at) >= today);
  const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const todayCount   = todayOrders.length;
  const todayAOV     = todayCount > 0 ? todayRevenue / todayCount : 0;

  /* Yesterday (for comparison) */
  const yOrders  = all.filter((o) => {
    const d = new Date(o.created_at);
    return d >= yesterday && d < today;
  });
  const yRevenue = yOrders.reduce((s, o) => s + Number(o.total), 0);
  const yCount   = yOrders.length;

  /* This week */
  const weekRevenue = all.reduce((s, o) => s + Number(o.total), 0);

  /* Active orders by status (today only) */
  const activeStatuses = ["pending", "paid", "confirmed", "preparing", "ready", "delivering"];
  const todayAll = (weekOrders || []).filter((o) => new Date(o.created_at) >= today);
  const statusBreakdown: Record<string, number> = {};
  for (const s of activeStatuses) {
    statusBreakdown[s] = todayAll.filter((o) => o.status === s).length;
  }

  /* 7-day chart: revenue per day */
  const dailyRevenue: { day: string; date: string; revenue: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const nextD = new Date(d); nextD.setDate(nextD.getDate() + 1);
    const dayOrders = all.filter((o) => {
      const od = new Date(o.created_at);
      return od >= d && od < nextD;
    });
    const dayLabel = d.toLocaleDateString("fr-FR", { weekday: "short" });
    const dateLabel = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    dailyRevenue.push({
      day: dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3),
      date: dateLabel,
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
      count: dayOrders.length,
    });
  }

  /* Payment method breakdown (today) — seule la carte est active */
  const payMethods = ["carte"];
  const paymentBreakdown: { method: string; count: number; revenue: number }[] = payMethods.map((m) => ({
    method: m,
    count: todayOrders.filter((o) => o.payment_method === m).length,
    revenue: todayOrders.filter((o) => o.payment_method === m).reduce((s, o) => s + Number(o.total), 0),
  }));

  /* Comparaison vs hier en % */
  const revenueDelta = yRevenue > 0 ? ((todayRevenue - yRevenue) / yRevenue) * 100 : (todayRevenue > 0 ? 100 : 0);
  const countDelta   = yCount > 0 ? ((todayCount - yCount) / yCount) * 100 : (todayCount > 0 ? 100 : 0);

  return {
    todayOrderCount: todayCount,
    todayRevenue,
    todayAOV,
    yesterdayRevenue: yRevenue,
    yesterdayCount: yCount,
    revenueDelta,
    countDelta,
    weekRevenue,
    pendingOrders: statusBreakdown.pending || 0,
    statusBreakdown,
    dailyRevenue,
    paymentBreakdown,
    totalMenuItems: totalItems || 0,
    unavailableItems: unavailableItems || 0,
  };
}
