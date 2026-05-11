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
  /* Token minimum pour ne pas exposer publiquement la check */
  const expectedToken = process.env.ADMIN_HEALTHCHECK_TOKEN ?? "jolie-check-2026";
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

  /* Diagnostic global */
  const ready =
    env.isSumUpConfigured &&
    liveCheck.ok &&
    liveCheck.merchant === merchantCode;

  return NextResponse.json({
    ready,
    env,
    liveCheck,
    notes:
      ready
        ? "✅ SumUp prêt pour la production"
        : !env.isSumUpConfigured
          ? "❌ Variables d'environnement manquantes — ajoute-les sur Vercel puis redeploy"
          : !liveCheck.ok
            ? "❌ La clé API n'est pas valide (vérifier /v0.1/me ci-dessus)"
            : liveCheck.merchant !== merchantCode
              ? `⚠️ Le SUMUP_MERCHANT_CODE (${merchantCode}) ne correspond pas au compte associé à la clé (${liveCheck.merchant})`
              : "?",
  });
}
