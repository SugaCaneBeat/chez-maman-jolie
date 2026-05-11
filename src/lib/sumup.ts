/**
 * SumUp Online Payments API client.
 *
 * Documentation: https://developer.sumup.com/online-payments
 *
 * Requires the following environment variables:
 *   SUMUP_API_KEY        — personal access token / API key (server-side only)
 *   SUMUP_MERCHANT_CODE  — your SumUp merchant code (visible in dashboard)
 *
 * Optional:
 *   SUMUP_API_BASE       — override base URL (default: https://api.sumup.com)
 */

const API_BASE = process.env.SUMUP_API_BASE ?? "https://api.sumup.com";

export type SumUpCheckoutStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface SumUpCheckout {
  id: string;
  checkout_reference: string;
  amount: number;
  currency: string;
  merchant_code: string;
  description?: string;
  status: SumUpCheckoutStatus;
  date?: string;
  valid_until?: string;
  return_url?: string;
}

export interface CreateCheckoutInput {
  reference: string;        // unique reference for this checkout (e.g. order id + timestamp)
  amount: number;           // total in EUR (decimal allowed: 25.50)
  description: string;      // short description shown to customer
  returnUrl: string;        // where SumUp sends customer after payment
}

export function isSumUpConfigured(): boolean {
  return Boolean(process.env.SUMUP_API_KEY && process.env.SUMUP_MERCHANT_CODE);
}

/* Convert any FR-style price (with comma) to a fixed 2-decimal number */
function toAmount(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ─── Create a checkout ─── */
export async function createSumUpCheckout(
  input: CreateCheckoutInput
): Promise<SumUpCheckout> {
  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  if (!apiKey || !merchantCode) {
    throw new Error("SumUp non configuré (SUMUP_API_KEY + SUMUP_MERCHANT_CODE manquants)");
  }

  const body = {
    checkout_reference: input.reference,
    amount: toAmount(input.amount),
    currency: "EUR",
    merchant_code: merchantCode,
    description: input.description,
    return_url: input.returnUrl,
  };

  const res = await fetch(`${API_BASE}/v0.1/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SumUp create checkout failed (${res.status}): ${text}`);
  }
  return (await res.json()) as SumUpCheckout;
}

/* ─── Fetch a checkout by id (to verify status) ─── */
export async function getSumUpCheckout(id: string): Promise<SumUpCheckout | null> {
  const apiKey = process.env.SUMUP_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(`${API_BASE}/v0.1/checkouts/${id}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as SumUpCheckout;
}

/* SumUp ne propose pas de page hébergée publique pour les checkouts B2C.
 * Le flow correct: créer un checkout côté serveur, récupérer le checkout_id,
 * puis monter le widget JS SumUp (gateway.sumup.com/.../sdk.js) côté client
 * sur une page de notre site (/checkout/[orderId]). */
