"use server";

import {
  createSumUpCheckout,
  getSumUpCheckout,
  getHostedCheckoutUrl,
  isSumUpConfigured,
} from "@/lib/sumup";
import { createServerClient } from "@/lib/supabase/server";

/* ─── Récupère l'URL de base du site (Vercel ou variable env) ─── */
function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "https://chezmamanjolie.com";
  return url.startsWith("http") ? url : `https://${url}`;
}

/* ─── Crée un checkout SumUp pour une commande existante ───
 *  Le checkout_id et le checkout_reference sont sauvegardés dans la table
 *  orders (colonnes sumup_checkout_id / sumup_reference) si elles existent.
 */
export async function createSumUpCheckoutForOrder(
  orderId: string,
  orderNumber: number,
  amount: number
): Promise<{ success: boolean; checkoutUrl?: string; error?: string }> {
  if (!isSumUpConfigured()) {
    return {
      success: false,
      error: "Paiement par carte indisponible — contactez le restaurant.",
    };
  }

  try {
    const reference = `order-${orderNumber}-${Date.now()}`;
    const returnUrl = `${getBaseUrl()}/commande/${orderId}?source=sumup`;

    const checkout = await createSumUpCheckout({
      reference,
      amount,
      description: `Commande #${orderNumber} — Chez Maman Jolie`,
      returnUrl,
    });

    /* Persist sumup_checkout_id on the order (best-effort) */
    try {
      const supabase = createServerClient();
      await supabase
        .from("orders")
        .update({
          sumup_checkout_id: checkout.id,
          sumup_reference: reference,
        })
        .eq("id", orderId);
    } catch {
      /* table may not have those columns yet; on s'en fiche pour le flow */
    }

    return { success: true, checkoutUrl: getHostedCheckoutUrl(checkout.id) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/* ─── Vérifie côté serveur le statut d'un checkout
 *  et met à jour la commande si payée.
 *  Appelé depuis la page de suivi (/commande/[id]?source=sumup).
 */
export async function verifyAndSyncSumUpPayment(
  orderId: string
): Promise<{ paid: boolean }> {
  try {
    const supabase = createServerClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, sumup_checkout_id")
      .eq("id", orderId)
      .single();

    if (!order || !order.sumup_checkout_id) return { paid: false };
    if (order.status === "paid" || order.status === "confirmed") return { paid: true };

    const checkout = await getSumUpCheckout(order.sumup_checkout_id);
    if (!checkout) return { paid: false };

    if (checkout.status === "PAID") {
      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
      return { paid: true };
    }
  } catch {
    /* swallow */
  }
  return { paid: false };
}
