/**
 * Webhook SumUp — notifie les changements de statut d'un checkout.
 *
 * Configure ce endpoint dans le dashboard SumUp :
 *   https://chezmamanjolie.com/api/sumup/webhook
 *
 * Sécurité :
 *   - Si SUMUP_WEBHOOK_SECRET est défini, on vérifie la signature HMAC SHA-256
 *     dans l'en-tête X-Payload-Signature (format "sha256=<hex>") avant de
 *     traiter le payload.
 *   - On revalide ENSUITE le checkout via getSumUpCheckout() — source of truth.
 *   - Transitions d'état atomiques : on ne passe à "paid" que si l'ordre est
 *     encore "pending" (CAS via .eq("status", "pending")).
 *   - Réponse toujours 200 sur les checkouts non liés pour éviter
 *     l'énumération.
 */

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
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

function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice(7)
    : signatureHeader;
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  /* Toujours lire le brut pour la vérification HMAC */
  const raw = await req.text();

  const secret = process.env.SUMUP_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers.get("x-payload-signature") ?? req.headers.get("x-sumup-signature");
    if (!verifySignature(raw, sig, secret)) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  }

  let body: WebhookPayload = {};
  try {
    body = JSON.parse(raw) as WebhookPayload;
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const checkoutId =
    body.payload?.checkout_id ?? body.checkout_id ?? body.id ?? null;
  if (!checkoutId) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  /* Source of truth : on revalide auprès de SumUp */
  const checkout = await getSumUpCheckout(checkoutId);
  if (!checkout) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = createServerClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("sumup_checkout_id", checkoutId)
    .single();

  if (!order) {
    /* Toujours 200 — pas d'oracle d'énumération */
    return NextResponse.json({ ok: true });
  }

  /* CAS atomique : on ne passe à "paid" que si l'ordre est encore "pending".
   * Empêche un webhook tardif d'écraser un statut "preparing" / "delivered". */
  if (checkout.status === "PAID") {
    await supabase
      .from("orders")
      .update({ status: "paid" })
      .eq("id", order.id)
      .eq("status", "pending");
  } else if (checkout.status === "FAILED" || checkout.status === "EXPIRED") {
    await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id)
      .eq("status", "pending");
  }

  return NextResponse.json({ ok: true });
}

/* health check */
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "sumup-webhook" });
}
