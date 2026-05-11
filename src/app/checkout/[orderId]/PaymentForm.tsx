"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";

declare global {
  interface Window {
    SumUpCard?: {
      mount: (config: SumUpMountConfig) => SumUpInstance;
    };
  }
}

interface SumUpMountConfig {
  id: string;
  checkoutId: string;
  onResponse?: (type: SumUpResponseType, body: Record<string, unknown>) => void;
  showAmount?: boolean;
  locale?: string;
  country?: string;
}

interface SumUpInstance {
  unmount: () => void;
}

type SumUpResponseType =
  | "sent"
  | "invalid"
  | "auth-screen"
  | "error"
  | "success"
  | "fail";

function formatPrice(p: number) {
  return p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;
}

export default function PaymentForm({
  orderId,
  orderNumber,
  checkoutId,
  amount,
}: {
  orderId: string;
  orderNumber: number;
  checkoutId: string;
  amount: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<SumUpInstance | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "fail">("idle");
  const mountedRef = useRef(false);

  /* Mount le widget SumUp dès que le script est chargé */
  useEffect(() => {
    if (!scriptReady || !mountRef.current || mountedRef.current || !window.SumUpCard) return;
    mountedRef.current = true;

    try {
      widgetRef.current = window.SumUpCard.mount({
        id: "sumup-card-mount",
        checkoutId,
        showAmount: true,
        locale: "fr-FR",
        country: "FR",
        onResponse: (type, body) => {
          /* Types: sent | invalid | auth-screen | error | success | fail */
          if (type === "sent") {
            setStatus("processing");
            setError(null);
          } else if (type === "auth-screen") {
            setStatus("processing");
          } else if (type === "success") {
            setStatus("success");
            /* Redirige vers le suivi de commande qui re-vérifie le statut SumUp */
            setTimeout(() => {
              window.location.href = `/commande/${orderId}?source=sumup`;
            }, 800);
          } else if (type === "fail" || type === "error") {
            setStatus("fail");
            const msg =
              (typeof body?.message === "string" && body.message) ||
              "Paiement refusé. Vérifiez votre carte ou essayez une autre méthode.";
            setError(msg);
            /* Permettre une nouvelle tentative en re-mount */
            mountedRef.current = false;
          } else if (type === "invalid") {
            setError("Les informations saisies sont invalides.");
          }
        },
      });
    } catch (e) {
      setError(`Impossible de charger le formulaire SumUp: ${e instanceof Error ? e.message : String(e)}`);
    }

    return () => {
      try {
        widgetRef.current?.unmount();
      } catch {}
      mountedRef.current = false;
    };
  }, [scriptReady, checkoutId, orderId]);

  return (
    <>
      <Script
        src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Échec du chargement du module de paiement.")}
      />

      <div className="min-h-screen bg-dark text-white">
        {/* Header */}
        <header className="border-b border-white/5 px-5 py-4 sticky top-0 bg-dark/80 backdrop-blur-xl z-10">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-primary font-heading font-bold text-lg">
              Chez Maman Jolie
            </Link>
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Paiement</span>
          </div>
        </header>

        <main className="max-w-xl mx-auto px-5 py-8 space-y-6">
          {/* Hero */}
          <div className="text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Commande #{orderNumber}</p>
            <h1 className="font-heading text-4xl font-bold text-gradient mb-2">
              {formatPrice(amount)}
            </h1>
            <p className="text-white/50 text-sm">
              Paiement sécurisé par carte bancaire
            </p>
          </div>

          {/* Status banner */}
          {status === "processing" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-[5px] p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25"/>
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <div>
                <p className="text-white font-semibold text-sm">Traitement en cours…</p>
                <p className="text-white/60 text-xs mt-0.5">Votre banque vérifie la transaction.</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-[5px] p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
              <div>
                <p className="text-white font-semibold text-sm">Paiement accepté</p>
                <p className="text-white/60 text-xs mt-0.5">Redirection vers le suivi de votre commande…</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-[5px] p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <div>
                <p className="text-white font-semibold text-sm">Erreur de paiement</p>
                <p className="text-white/60 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* SumUp widget mount point */}
          <div className="glass rounded-[5px] p-5">
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">
              Vos coordonnées bancaires
            </p>
            <div
              id="sumup-card-mount"
              ref={mountRef}
              className="sumup-widget min-h-[200px] [&_iframe]:!w-full"
            >
              {!scriptReady && (
                <div className="flex items-center justify-center py-12 text-white/40 text-sm gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25"/>
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                  Chargement du formulaire sécurisé…
                </div>
              )}
            </div>
            <p className="text-[10px] text-white/30 mt-3 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              Paiement sécurisé via SumUp · 3D Secure · vos données ne transitent pas par notre site
            </p>
          </div>

          {/* Cancel link */}
          <div className="text-center">
            <Link
              href={`/commande/${orderId}`}
              className="text-white/40 hover:text-white text-xs transition-colors"
            >
              ← Annuler et revenir au suivi
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
