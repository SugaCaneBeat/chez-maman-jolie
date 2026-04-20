"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/actions/orders";
import Image from "next/image";

/* ─── Payment methods ─── */
const PHONE = "+33 7 44 27 54 28";
const IBAN  = "FR76 XXXX XXXX XXXX XXXX XXXX XXX";
const BIC   = "XXXXXXXX";
const OWNER = "Chez Maman Jolie";

type PayMethod = "especes" | "virement" | "lydia" | "paylib" | "wero";

const PAY_OPTIONS: { id: PayMethod; label: string; sub: string; color: string; textColor: string }[] = [
  { id: "especes", label: "Espèces",  sub: "À la livraison",  color: "bg-emerald-500/15", textColor: "text-emerald-400" },
  { id: "virement",label: "Virement", sub: "IBAN bancaire",   color: "bg-blue-500/15",    textColor: "text-blue-400"    },
  { id: "lydia",   label: "Lydia",    sub: PHONE,             color: "bg-purple-500/15",  textColor: "text-purple-400"  },
  { id: "paylib",  label: "PayLib",   sub: PHONE,             color: "bg-sky-500/15",     textColor: "text-sky-400"     },
  { id: "wero",    label: "Wero",     sub: PHONE,             color: "bg-teal-500/15",    textColor: "text-teal-400"    },
];

/* ─── Copy button ─── */
function CopyBtn({ value, label, copied, onCopy }: {
  value: string; label: string; copied: string | null; onCopy: (v: string, l: string) => void;
}) {
  const ok = copied === label;
  return (
    <button onClick={() => onCopy(value, label)} className="text-white/40 hover:text-primary transition-colors flex-shrink-0">
      {ok
        ? <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
      }
    </button>
  );
}

/* ─── Copy row ─── */
function CopyRow({ label, value, mono, copied, onCopy }: {
  label: string; value: string; mono?: boolean; copied: string | null; onCopy: (v: string, l: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between bg-white/5 rounded-[5px] px-3 py-2 gap-3">
        <span className={`text-white text-sm truncate ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
        <CopyBtn value={value.replace(/\s/g, "")} label={label} copied={copied} onCopy={onCopy} />
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCart();

  /* ── Step: "cart" → "pay-details" ── */
  const [step, setStep] = useState<"cart" | "pay-details">("cart");
  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);

  const formatPrice = (p: number) =>
    p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setTimeout(() => { setStep("cart"); setPayMethod(null); }, 400);
  };

  /* ── Build WhatsApp order message ── */
  const buildWAMessage = (method: PayMethod) => {
    const methodLabels: Record<PayMethod, string> = {
      especes:  "Espèces à la livraison",
      virement: "Virement bancaire",
      lydia:    "Lydia",
      paylib:   "PayLib",
      wero:     "Wero",
    };
    let msg = "🛒 *Commande Chez Maman Jolie*\n\n";
    items.forEach(i => {
      msg += `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}\n`;
    });
    msg += `\n💰 *Total : ${formatPrice(getTotal())}*`;
    msg += `\n💳 Paiement : ${methodLabels[method]}`;
    msg += "\n\n📍 Merci de confirmer l'adresse de livraison.";
    return encodeURIComponent(msg);
  };

  /* ── Order via WhatsApp then go to payment details ── */
  const handleOrder = async () => {
    if (!payMethod) return;
    setSaving(true);
    try {
      await createOrder({
        items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        paymentMethod: payMethod,
        total: getTotal(),
      });
    } catch {}
    setSaving(false);
    window.open(`https://wa.me/33744275428?text=${buildWAMessage(payMethod)}`, "_blank");
    if (payMethod !== "especes") setStep("pay-details");
  };

  const isMobilePay = payMethod === "lydia" || payMethod === "paylib" || payMethod === "wero";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-dark-light border-l border-white/5 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            {step === "pay-details" ? (
              <button
                onClick={() => setStep("cart")}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                </svg>
                <span className="text-sm">Retour au panier</span>
              </button>
            ) : (
              <>
                <h2 className="font-heading text-xl font-bold text-white">Mon Panier</h2>
                <p className="text-white/40 text-xs mt-0.5">
                  {getCount()} {getCount() > 1 ? "articles" : "article"}
                </p>
              </>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-[5px] glass flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ══════════════════════════════════════════
            STEP 1 — CART + payment method selection
            ══════════════════════════════════════════ */}
        {step === "cart" && (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <p className="text-white/40 text-sm">Votre panier est vide</p>
                  <p className="text-white/20 text-xs mt-1">Ajoutez des plats depuis la carte</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="glass rounded-[5px] p-4 flex gap-4">
                    {item.image && (
                      <div className="relative w-16 h-16 rounded-[5px] overflow-hidden flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-semibold truncate">{item.name}</h4>
                      <p className="text-primary text-sm font-bold mt-0.5">{formatPrice(item.price)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-[5px] bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"/></svg>
                        </button>
                        <span className="text-white font-bold text-sm w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-[5px] bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                        </button>
                        <button onClick={() => removeItem(item.id)} className="ml-auto w-7 h-7 rounded-[5px] hover:bg-accent/20 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="text-white/60 text-sm font-bold self-start">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/5 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">Total</span>
                  <span className="text-2xl font-bold text-gradient">{formatPrice(getTotal())}</span>
                </div>

                {/* Payment method selection */}
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">Mode de paiement</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {PAY_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setPayMethod(opt.id)}
                        className={`rounded-[5px] px-2 py-2.5 text-center transition-all border ${
                          payMethod === opt.id
                            ? `${opt.color} ${opt.textColor} border-current/40 scale-[1.02]`
                            : "bg-white/5 text-white/50 border-white/5 hover:bg-white/8"
                        }`}
                      >
                        <span className="block text-xs font-bold leading-tight">{opt.label}</span>
                        <span className={`block text-[9px] mt-0.5 leading-tight ${payMethod === opt.id ? "opacity-70" : "opacity-40"}`}>
                          {opt.id === "especes" ? "À la livraison" : opt.id === "virement" ? "IBAN" : "Tél."}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Commander via WhatsApp */}
                <button
                  onClick={handleOrder}
                  disabled={saving || !payMethod}
                  className="group flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 rounded-[5px] text-sm transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/20 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {saving ? "Envoi..." : payMethod ? "Commander via WhatsApp" : "Choisir un paiement"}
                </button>

                <button onClick={clearCart} className="w-full text-white/30 hover:text-accent text-xs text-center py-1 transition-colors">
                  Vider le panier
                </button>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — PAYMENT DETAILS
            (shown after WhatsApp is opened, if not cash)
            ══════════════════════════════════════════ */}
        {step === "pay-details" && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Status banner */}
            <div className="glass rounded-[5px] p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-[5px] bg-[#25D366]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Commande envoyée sur WhatsApp</p>
                <p className="text-white/40 text-xs mt-0.5">Il reste à effectuer votre paiement ci-dessous.</p>
              </div>
            </div>

            {/* Amount due */}
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Montant à régler</p>
              <p className="text-3xl font-bold text-gradient">{formatPrice(getTotal())}</p>
            </div>

            {/* ── Virement bancaire ── */}
            {payMethod === "virement" && (
              <div className="glass rounded-[5px] p-5 space-y-3">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 bg-blue-500/15 rounded-[5px] flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                  <h4 className="font-bold text-white text-sm">Virement bancaire</h4>
                </div>
                <CopyRow label="Titulaire" value={OWNER}        copied={copied} onCopy={handleCopy}/>
                <CopyRow label="IBAN"      value={IBAN}   mono  copied={copied} onCopy={handleCopy}/>
                <CopyRow label="BIC"       value={BIC}    mono  copied={copied} onCopy={handleCopy}/>
                <p className="text-white/20 text-[10px]">Mentionnez votre nom en référence du virement</p>
              </div>
            )}

            {/* ── Lydia / PayLib / Wero ── */}
            {isMobilePay && (
              <div className="glass rounded-[5px] p-5 space-y-3">
                {/* Active app badge */}
                <div className="flex items-center gap-3 mb-1">
                  {payMethod === "lydia" && (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-purple-500/15 rounded-[5px] flex items-center justify-center">
                        <span className="text-purple-400 font-black text-base">L</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">Lydia</h4>
                    </div>
                  )}
                  {payMethod === "paylib" && (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-sky-500/15 rounded-[5px] flex items-center justify-center">
                        <span className="text-sky-400 font-black text-base">P</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">PayLib</h4>
                    </div>
                  )}
                  {payMethod === "wero" && (
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-teal-500/15 rounded-[5px] flex items-center justify-center">
                        <span className="text-teal-400 font-black text-base">W</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">Wero</h4>
                    </div>
                  )}
                </div>
                <CopyRow label="Numéro associé" value={PHONE} copied={copied} onCopy={handleCopy}/>
                <p className="text-white/20 text-[10px]">
                  Ouvrez {payMethod === "lydia" ? "Lydia" : payMethod === "paylib" ? "PayLib" : "Wero"} et envoyez{" "}
                  <span className="text-primary font-semibold">{formatPrice(getTotal())}</span> au numéro ci-dessus
                </p>
              </div>
            )}

            {/* Confirm on WhatsApp once paid */}
            <a
              href={`https://wa.me/33744275428?text=${encodeURIComponent(
                `✅ *Paiement effectué — Chez Maman Jolie*\n\n` +
                items.map(i => `• ${i.name} x${i.quantity}`).join("\n") +
                `\n\n💰 ${formatPrice(getTotal())} — réglé par ${
                  payMethod === "virement" ? "virement bancaire" :
                  payMethod === "lydia"    ? "Lydia" :
                  payMethod === "paylib"   ? "PayLib" : "Wero"
                }\n\n📍 Merci de confirmer la livraison.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 rounded-[5px] text-sm transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/20"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Confirmer le paiement sur WhatsApp
            </a>
          </div>
        )}
      </div>
    </>
  );
}
