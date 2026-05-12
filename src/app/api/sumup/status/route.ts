/**
 * SumUp config healthcheck — protégé par un token simple.
 *
 * Usage:
 *   GET /api/sumup/status?token=<ADMIN_HEALTHCHECK_TOKEN>
 *
 * Retourne un diagnostic JSON sans jamais leak la clé API.
 */

import { NextResponse } from "next/server";
import { isSumUpConfigured } from "@/lib/sumup";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function maskKey(k: string | undefined): string {
  if (!k) return "(absent)";
  if (k.length < 12) return "(trop court)";
  return `${k.slice(0, 8)}…${k.slice(-4)}`;
}

export async function GET(req: Request) {
  /* Token requis ; pas de fallback hardcodé. Si l'env n'est pas défini,
   * l'endpoint est désactivé en prod. */
  const expectedToken = process.env.ADMIN_HEALTHCHECK_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "Healthcheck désactivé (ADMIN_HEALTHCHECK_TOKEN absent)" },
      { status: 503 }
    );
  }
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (token !== expectedToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SUMUP_API_KEY;
  const merchantCode = process.env.SUMUP_MERCHANT_CODE;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  const env = {
    SUMUP_API_KEY: apiKey ? maskKey(apiKey) : "❌ MANQUANT",
    SUMUP_MERCHANT_CODE: merchantCode ?? "❌ MANQUANT",
    NEXT_PUBLIC_SITE_URL: siteUrl ?? "(absent — utilisera VERCEL_URL ou domaine par défaut)",
    isSumUpConfigured: isSumUpConfigured(),
  };

  /* Test live: tente d'appeler l'API SumUp avec /me pour valider la clé */
  let liveCheck: { ok: boolean; status?: number; error?: string; merchant?: string } = { ok: false };
  if (apiKey) {
    try {
      const res = await fetch("https://api.sumup.com/v0.1/me", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json() as { merchant_profile?: { merchant_code?: string; company_name?: string } };
        liveCheck = {
          ok: true,
          status: res.status,
          merchant: data?.merchant_profile?.merchant_code ?? data?.merchant_profile?.company_name ?? "(unknown)",
        };
      } else {
        const text = await res.text();
        liveCheck = { ok: false, status: res.status, error: text.slice(0, 200) };
      }
    } catch (e) {
      liveCheck = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    liveCheck = { ok: false, error: "SUMUP_API_KEY non défini" };
  }

  /* Test fonctionnel : créer un checkout réel (le plus fiable).
   * En sandbox SumUp, l'API key peut être associée au compte principal
   * mais autorisée à créer des checkouts pour un merchant sandbox distinct.
   * Donc ne pas se baser uniquement sur l'égalité /me.merchant === merchant_code. */
  let checkoutCheck: { ok: boolean; error?: string; mode?: string } = { ok: false };
  if (apiKey && merchantCode) {
    try {
      const r = await fetch("https://api.sumup.com/v0.1/checkouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkout_reference: `healthcheck-${Date.now()}`,
          amount: 1.00,
          currency: "EUR",
          merchant_code: merchantCode,
          description: "Healthcheck Chez Maman Jolie",
          return_url: `${siteUrl ?? "https://chezmamanjolie.com"}/admin`,
        }),
        cache: "no-store",
      });
      if (r.ok) {
        const data = await r.json() as { id?: string; status?: string };
        checkoutCheck = {
          ok: true,
          mode: liveCheck.merchant === merchantCode ? "production" : "sandbox",
        };
        /* On laisse le checkout expirer naturellement — pas de DELETE endpoint
           sur les checkouts SumUp. id présent pour info: */
        void data.id;
      } else {
        const text = await r.text();
        checkoutCheck = { ok: false, error: text.slice(0, 200) };
      }
    } catch (e) {
      checkoutCheck = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  /* Diagnostic global — le ready se base sur la création de checkout */
  const ready = env.isSumUpConfigured && liveCheck.ok && checkoutCheck.ok;

  return NextResponse.json({
    ready,
    mode: checkoutCheck.mode,
    env,
    liveCheck,
    checkoutCheck,
    notes:
      ready
        ? `✅ SumUp prêt — mode ${checkoutCheck.mode}`
        : !env.isSumUpConfigured
          ? "❌ Variables d'environnement manquantes"
          : !liveCheck.ok
            ? "❌ La clé API n'est pas valide"
            : !checkoutCheck.ok
              ? `❌ Création de checkout impossible : ${checkoutCheck.error ?? "erreur inconnue"}`
              : "?",
  });
}
