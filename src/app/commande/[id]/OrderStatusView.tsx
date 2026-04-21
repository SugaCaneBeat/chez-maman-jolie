"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PublicOrder } from "@/lib/actions/orders";
import { getPublicOrder } from "@/lib/actions/orders";

/* ─── Étapes canoniques de suivi ─── */
const STAGES = [
  { key: "paid",       label: "Payée",         hint: "Paiement reçu" },
  { key: "pending",    label: "Reçue",         hint: "Commande à confirmer" },
  { key: "confirmed",  label: "Confirmée",     hint: "Nous avons validé le délai" },
  { key: "preparing",  label: "En préparation", hint: "Cuisine en cours" },
  { key: "ready",      label: "Prête",         hint: "Prête à être livrée" },
  { key: "delivering", label: "En livraison",  hint: "En route" },
  { key: "delivered",  label: "Livrée",        hint: "Bon appétit !" },
];

/* Pour le rendu : ordre linéaire et position "active" */
const LINEAR_FLOW: string[] = ["paid", "confirmed", "preparing", "ready", "delivering", "delivered"];

function formatPrice(p: number) {
  return p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function OrderStatusView({ initialOrder }: { initialOrder: PublicOrder }) {
  const [order, setOrder] = useState(initialOrder);

  /* ── Polling toutes les 20 secondes ── */
  useEffect(() => {
    if (order.status === "delivered" || order.status === "cancelled") return;
    const tick = async () => {
      const fresh = await getPublicOrder(order.id);
      if (fresh) setOrder(fresh);
    };
    const id = setInterval(tick, 20000);
    return () => clearInterval(id);
  }, [order.id, order.status]);

  const cancelled = order.status === "cancelled";
  /* "paid" et "pending" sont des statuts de départ — on map vers "paid" dans la timeline */
  const currentKey = order.status === "pending" ? "paid" : order.status;
  const currentIdx = Math.max(0, LINEAR_FLOW.indexOf(currentKey));
  const currentStage = STAGES.find(s => s.key === order.status) ?? STAGES[0];

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Header */}
      <header className="border-b border-white/5 px-5 py-4 sticky top-0 bg-dark/80 backdrop-blur-xl z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-primary font-heading font-bold text-lg">
            Chez Maman Jolie
          </Link>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">Suivi</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-8 space-y-6">
        {/* Hero */}
        <div className="text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Commande</p>
          <h1 className="font-heading text-5xl font-bold text-gradient mb-1">
            #{order.order_number}
          </h1>
          <p className="text-white/50 text-sm">
            {order.customer_name ?? "Client"} · {formatDate(order.created_at)}
          </p>
        </div>

        {/* Statut actuel (grand) */}
        <div
          className={`rounded-[5px] p-6 text-center border ${
            cancelled
              ? "bg-red-500/10 border-red-500/30"
              : currentKey === "delivered"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : "bg-primary/10 border-primary/30"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {cancelled ? (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : currentKey === "delivered" ? (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
            )}
            <p className="font-heading text-xl font-bold">
              {cancelled ? "Commande annulée" : currentStage.label}
            </p>
          </div>
          <p className="text-white/50 text-sm">{cancelled ? "Contactez-nous sur WhatsApp" : currentStage.hint}</p>
        </div>

        {/* Timeline verticale */}
        {!cancelled && (
          <div className="glass rounded-[5px] p-5">
            <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-4">
              Progression
            </h3>
            <ol className="space-y-0">
              {LINEAR_FLOW.map((key, idx) => {
                const stage = STAGES.find(s => s.key === key)!;
                const done = idx <= currentIdx;
                const active = idx === currentIdx;
                return (
                  <li key={key} className="flex gap-3 relative">
                    {/* Trait vertical */}
                    {idx < LINEAR_FLOW.length - 1 && (
                      <span
                        className={`absolute left-[11px] top-6 w-[2px] h-full ${
                          done && idx < currentIdx ? "bg-primary" : "bg-white/10"
                        }`}
                      />
                    )}
                    {/* Cercle */}
                    <span
                      className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        active
                          ? "bg-primary text-dark shadow-lg shadow-primary/30 animate-pulse"
                          : done
                            ? "bg-primary text-dark"
                            : "bg-white/10 text-white/30"
                      }`}
                    >
                      {done ? (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    {/* Texte */}
                    <div className="pb-6 min-w-0">
                      <p className={`text-sm font-semibold ${done ? "text-white" : "text-white/40"}`}>
                        {stage.label}
                      </p>
                      <p className="text-xs text-white/40">{stage.hint}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Récap articles */}
        <div className="glass rounded-[5px] p-5">
          <h3 className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">
            Récapitulatif
          </h3>
          <ul className="space-y-2 mb-3">
            {order.items.map((it, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-white/70">{it.name} <span className="text-white/30">x{it.quantity}</span></span>
                <span className="text-white/50">{formatPrice(it.price * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between pt-3 border-t border-white/5">
            <span className="text-white text-sm font-semibold">Total</span>
            <span className="text-primary font-bold">{formatPrice(order.total)}</span>
          </div>
          {order.customer_address && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Adresse</p>
              <p className="text-white/70 text-xs leading-relaxed whitespace-pre-line">{order.customer_address}</p>
            </div>
          )}
        </div>

        {/* CTA WhatsApp */}
        <a
          href="https://wa.me/33744275428"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-semibold py-3 rounded-[5px] text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Une question ? Nous contacter
        </a>

        <p className="text-center text-white/20 text-[10px]">
          Cette page se met à jour automatiquement toutes les 20 secondes.
        </p>
      </main>
    </div>
  );
}
