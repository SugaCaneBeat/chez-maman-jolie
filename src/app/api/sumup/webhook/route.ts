/**
 * Webhook SumUp — notifie les changements de statut d'un checkout.
 *
 * Configure ce endpoint dans le dashboard SumUp :
 *   https://chezmamanjolie.com/api/sumup/webhook
 *
 * SumUp envoie un POST JSON avec au minimum :
 *   {
 *     "id": "checkout-id",
 *     "event_type": "checkout.payment.successful" | "checkout.payment.failed" | ...,
 *     "payload": { "checkout_reference": "...", "status": "PAID", ... }
 *   }
 *
 * On retrouve la commande via sumup_checkout_id puis on met à jour le statut.
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getSumUpCheckout } from "@/lib/sumup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface WebhookPayload {
  id?: string;
  event_type?: string;
  checkout_id?: string;
  payload?: {
    checkout_id?: string;
    checkout_reference?: string;
    status?: string;
  };
}

export async function POST(req: Request) {
  let body: WebhookPayload = {};
  try {
    body = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  /* SumUp peut envoyer le checkout id dans plusieurs champs selon la version */
  const checkoutId =
    body.payload?.checkout_id ?? body.checkout_id ?? body.id ?? null;
  if (!checkoutId) {
    return NextResponse.json({ error: "missing checkout id" }, { status: 400 });
  }

  /* Verify with SumUp API (source of truth) */
  const checkout = await getSumUpCheckout(checkoutId);
  if (!checkout) {
    return NextResponse.json({ error: "checkout not found" }, { status: 404 });
  }

  const supabase = createServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("sumup_checkout_id", checkoutId)
    .single();

  if (!order) {
    return NextResponse.json({ ok: true, note: "order not linked" });
  }

  if (checkout.status === "PAID" && order.status === "pending") {
    await supabase.from("orders").update({ status: "paid" }).eq("id", order.id);
  } else if (checkout.status === "FAILED" || checkout.status === "EXPIRED") {
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
  }

  return NextResponse.json({ ok: true, status: checkout.status });
}

/* health check */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "sumup-webhook" });
}
