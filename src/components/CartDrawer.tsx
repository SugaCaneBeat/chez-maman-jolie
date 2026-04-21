"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/actions/orders";
import { resolveZone, type ZoneInfo, type GeocodedAddress, DEPART_LABEL } from "@/lib/geo";
import Image from "next/image";

/* ─── Payment methods ─── */
const PHONE  = "+33 7 44 27 54 28";
const DEPART = "Paris 11ème";

/* Minimum de commande */
const MIN_ORDER = 25;

type PayMethod = "carte" | "lydia" | "paylib" | "wero";

const PAY_OPTIONS: { id: PayMethod; label: string; sub: string; color: string; textColor: string }[] = [
  { id: "carte",  label: "Carte",  sub: "À la livraison", color: "bg-indigo-500/15", textColor: "text-indigo-400" },
  { id: "lydia",  label: "Lydia",  sub: "Mobile",         color: "bg-purple-500/15", textColor: "text-purple-400" },
  { id: "paylib", label: "PayLib", sub: "Mobile",         color: "bg-sky-500/15",    textColor: "text-sky-400"    },
  { id: "wero",   label: "Wero",   sub: "Mobile",         color: "bg-teal-500/15",   textColor: "text-teal-400"   },
];

/* ─── Deep-links / URLs des apps de paiement mobile ─── */
const APP_URLS: Record<"lydia" | "paylib" | "wero", string> = {
  lydia:  "https://lydia.me/",
  paylib: "https://www.paylib.fr/",
  wero:   "https://wero-wallet.eu/fr",
};


export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCart();

  const [payMethod, setPayMethod] = useState<PayMethod | null>(null);
  const [address, setAddress]     = useState("");
  const [nom, setNom]             = useState("");
  const [tel, setTel]             = useState("");
  const [copied, setCopied]       = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  /* ── Geolocation state ── */
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [geocoded, setGeocoded] = useState<GeocodedAddress | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  /* ── Flow step: "form" → "payment" → "sent" ── */
  const [step, setStep] = useState<"form" | "payment" | "sent">("form");
  const [orderRef, setOrderRef] = useState<{ id: string; number: number } | null>(null);

  /* ── Refs for scroll-to-missing-field ── */
  const nomRef     = useRef<HTMLInputElement>(null);
  const telRef     = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const payRef     = useRef<HTMLDivElement>(null);

  /* ── Validation ── */
  const subtotal      = getTotal();
  const deliveryFee   = zoneInfo && !zoneInfo.outOfRange ? zoneInfo.fee : 0;
  const grandTotal    = subtotal + deliveryFee;
  const minOrderValid = subtotal >= MIN_ORDER;
  const nomValid      = nom.trim().length >= 2;
  const telDigits     = tel.replace(/\D/g, "");
  const telValid      = telDigits.length >= 10;
  const addressValid  = address.trim().length >= 10;
  const paymentValid  = payMethod !== null;
  const zoneValid     = zoneInfo !== null && !zoneInfo.outOfRange;
  const formValid     = minOrderValid && nomValid && telValid && addressValid && zoneValid && paymentValid;

  const missing: string[] = [];
  if (!minOrderValid) missing.push(`atteindre ${MIN_ORDER} € minimum`);
  if (!nomValid)      missing.push("votre nom");
  if (!telValid)      missing.push("votre téléphone");
  if (!addressValid)  missing.push("votre adresse");
  if (!zoneValid && addressValid) missing.push("une adresse dans notre zone");
  if (!paymentValid)  missing.push("le mode de paiement");

  /* ── Géocoder l'adresse (debounced) dès qu'elle change ── */
  useEffect(() => {
    if (!addressValid) {
      setZoneInfo(null);
      setGeocoded(null);
      return;
    }
    setGeocoding(true);
    const handle = setTimeout(async () => {
      const res = await resolveZone(address);
      if (res) {
        setGeocoded(res.geo);
        setZoneInfo(res.zoneInfo);
      } else {
        setGeocoded(null);
        setZoneInfo(null);
      }
      setGeocoding(false);
    }, 700);
    return () => { clearTimeout(handle); setGeocoding(false); };
  }, [address, addressValid]);

  const formatPrice = (p: number) =>
    p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setPayMethod(null);
      setStep("form");
      setShowErrors(false);
      setOrderRef(null);
    }, 400);
  };

  /* ── Build WhatsApp message — cleanly formatted ── */
  const buildWAMessage = (method: PayMethod, paid: boolean, ref: { id: string; number: number } | null) => {
    const labels: Record<PayMethod, string> = {
      carte:  "Carte à la livraison",
      lydia:  "Lydia",
      paylib: "PayLib",
      wero:   "Wero",
    };

    const sep = "━━━━━━━━━━━━━━━━━━";
    const sub = "──────────────────";
    const subT = formatPrice(subtotal);
    const grandT = formatPrice(grandTotal);
    const lines: string[] = [];

    /* Header */
    lines.push(sep);
    lines.push("*CHEZ MAMAN JOLIE*");
    if (ref) lines.push(`_Commande #${ref.number}_`);
    lines.push(paid ? "✅ *PAIEMENT EFFECTUÉ* — _à préparer_" : "_Nouvelle commande_");
    lines.push(sep);
    lines.push("");

    /* Articles */
    lines.push("🍽️ *ARTICLES*");
    items.forEach(i => {
      lines.push(`• ${i.name}  _x${i.quantity}_  —  ${formatPrice(i.price * i.quantity)}`);
    });
    lines.push("");
    lines.push(`Sous-total :  ${subT}`);
    if (deliveryFee > 0) {
      lines.push(`Livraison (Zone ${zoneInfo?.zone}) :  ${formatPrice(deliveryFee)}`);
    } else if (zoneInfo?.zone === 1) {
      lines.push(`Livraison (Zone 1) :  _Gratuite_`);
    }
    lines.push(`*Total :*  *${grandT}*`);
    lines.push("");
    lines.push(sub);
    lines.push("");

    /* Client */
    lines.push("👤 *CLIENT*");
    lines.push(nom);
    lines.push(`📞 ${tel}`);
    lines.push("");
    lines.push("📍 *ADRESSE DE LIVRAISON*");
    address.split("\n").forEach(l => lines.push(l));
    if (zoneInfo && geocoded) {
      lines.push(`_Zone ${zoneInfo.zone} · ${zoneInfo.distanceKm.toFixed(1)} km de ${DEPART_LABEL}_`);
    }
    lines.push("");
    lines.push(sub);
    lines.push("");

    /* Paiement */
    if (paid) {
      lines.push(`💳 Payé via *${labels[method]}*  ·  ${grandT}`);
      lines.push("");
      lines.push("_Merci de préparer la commande._");
    } else {
      lines.push(`💳 *Paiement : ${labels[method]}*`);
      lines.push(`À régler au livreur par carte bancaire (TPE).`);
    }

    lines.push("");
    lines.push(sep);
    if (ref) {
      const trackUrl = `https://chezmamanjolie.com/commande/${ref.id}`;
      lines.push("");
      lines.push(`🔗 Suivi client : ${trackUrl}`);
    }

    return encodeURIComponent(lines.join("\n"));
  };

  const isMobilePay = payMethod === "lydia" || payMethod === "paylib" || payMethod === "wero";

  const handleOrder = async () => {
    /* Validate required fields */
    if (!formValid) {
      setShowErrors(true);
      if (!nomValid) {
        nomRef.current?.focus();
        nomRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (!telValid) {
        telRef.current?.focus();
        telRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (!addressValid) {
        addressRef.current?.focus();
        addressRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (!paymentValid) {
        payRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    /* Mobile payment (Lydia/PayLib/Wero): show payment interstitial first */
    if (isMobilePay) {
      setStep("payment");
      return;
    }

    /* Espèces ou Carte → envoi direct */
    await doSendOrder(false);
  };

  /* Appelé depuis "Envoyer" (carte) ou "J'ai payé" (Wero etc.) */
  const doSendOrder = async (paid: boolean) => {
    if (!payMethod) return;
    setSaving(true);
    let ref: { id: string; number: number } | null = null;
    try {
      const res = await createOrder({
        items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        customerName: nom,
        customerPhone: tel,
        customerAddress: address,
        paymentMethod: payMethod,
        paid,
        total: grandTotal,
      });
      if (res.success && res.orderId && res.orderNumber) {
        ref = { id: res.orderId, number: res.orderNumber };
        setOrderRef(ref);
      }
    } catch {}
    setSaving(false);
    window.open(`https://wa.me/33744275428?text=${buildWAMessage(payMethod, paid, ref)}`, "_blank");
    /* clear cart once the order is placed */
    clearCart();
    setStep("sent");
  };

  const appName = payMethod === "lydia" ? "Lydia" : payMethod === "paylib" ? "PayLib" : payMethod === "wero" ? "Wero" : "";

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
            <h2 className="font-heading text-xl font-bold text-white">Mon Panier</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {getCount()} {getCount() > 1 ? "articles" : "article"}
            </p>
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

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Items */}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <svg className="w-16 h-16 text-white/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p className="text-white/40 text-sm">Votre panier est vide</p>
              <p className="text-white/20 text-xs mt-1">Ajoutez des plats depuis la carte</p>
            </div>
          ) : (
            <>
              {/* ── Items list ── */}
              <div className="space-y-3">
                {items.map((item) => (
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
                ))}
              </div>

              {/* ── Minimum order progress ── */}
              {(() => {
                const total = getTotal();
                const remaining = Math.max(0, MIN_ORDER - total);
                const progress = Math.min(100, (total / MIN_ORDER) * 100);
                const reached = remaining === 0;

                return (
                  <div
                    className={`rounded-[5px] p-4 border transition-colors ${
                      reached
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-amber-500/10 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {reached ? (
                          <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                        )}
                        <p className={`text-xs font-semibold truncate ${reached ? "text-emerald-300" : "text-amber-200"}`}>
                          {reached
                            ? "Minimum de commande atteint"
                            : <>Il manque <span className="text-amber-300">{formatPrice(remaining)}</span> pour commander</>
                          }
                        </p>
                      </div>
                      <span className={`text-[10px] flex-shrink-0 font-mono ${reached ? "text-emerald-400/70" : "text-amber-400/70"}`}>
                        {formatPrice(total)} / {MIN_ORDER} €
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-white/5 rounded-[5px] overflow-hidden">
                      <div
                        className={`h-full rounded-[5px] transition-all duration-500 ${
                          reached
                            ? "bg-gradient-to-r from-emerald-400 to-emerald-300"
                            : "bg-gradient-to-r from-amber-500 to-amber-300"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-[10px] text-white/40 leading-snug flex-1">
                        {reached
                          ? "Livraison gratuite en Zone 1 (< 3 km)"
                          : `Commande minimum ${MIN_ORDER} € · livraison gratuite dès ce montant en Zone 1`
                        }
                      </p>
                      {!reached && (
                        <button
                          onClick={() => {
                            setDrawerOpen(false);
                            setTimeout(() => {
                              document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                            }, 300);
                          }}
                          className="text-[10px] text-primary hover:text-primary-light font-semibold whitespace-nowrap transition-colors underline underline-offset-2"
                        >
                          Ajouter un plat
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── Customer info ── */}
              <div className="glass rounded-[5px] p-4 space-y-3">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  Vos informations
                </h4>
                <div>
                  <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                    Nom complet <span className="text-primary">*</span>
                  </label>
                  <input
                    ref={nomRef}
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Prénom Nom"
                    className={`w-full bg-white/5 rounded-[5px] px-3 py-2 text-white text-sm focus:outline-none border placeholder:text-white/20 transition-colors ${
                      showErrors && !nomValid
                        ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                        : "border-white/5 focus:border-primary/50"
                    }`}
                  />
                  {showErrors && !nomValid && (
                    <p className="text-[10px] text-red-400 mt-1">Indiquez au moins 2 caractères</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                    Téléphone <span className="text-primary">*</span>
                  </label>
                  <input
                    ref={telRef}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={tel}
                    onChange={(e) => setTel(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className={`w-full bg-white/5 rounded-[5px] px-3 py-2 text-white text-sm focus:outline-none border placeholder:text-white/20 transition-colors ${
                      showErrors && !telValid
                        ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                        : "border-white/5 focus:border-primary/50"
                    }`}
                  />
                  {showErrors && !telValid && (
                    <p className="text-[10px] text-red-400 mt-1">Numéro valide requis (au moins 10 chiffres)</p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                    Adresse de livraison <span className="text-primary">*</span>
                  </label>
                  <textarea
                    ref={addressRef}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="15 rue du Temple, 75011 Paris&#10;Code d'accès, étage…"
                    rows={2}
                    className={`w-full bg-white/5 rounded-[5px] px-3 py-2 text-white text-sm focus:outline-none border placeholder:text-white/20 resize-none transition-colors ${
                      showErrors && !addressValid
                        ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                        : "border-white/5 focus:border-primary/50"
                    }`}
                  />
                  {showErrors && !addressValid && (
                    <p className="text-[10px] text-red-400 mt-1">Adresse complète requise (rue, ville, code postal)</p>
                  )}

                  {/* Indicateur de zone après géocodage */}
                  {addressValid && (
                    <div className="mt-2">
                      {geocoding && (
                        <p className="text-[10px] text-white/40 flex items-center gap-1.5">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-25"/>
                            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                          Vérification de votre zone…
                        </p>
                      )}
                      {!geocoding && zoneInfo && !zoneInfo.outOfRange && (
                        <div className={`text-[10px] rounded-[5px] px-2 py-1.5 flex items-center gap-1.5 ${
                          zoneInfo.zone === 1 ? "bg-emerald-500/10 text-emerald-300" :
                          zoneInfo.zone === 2 ? "bg-sky-500/10 text-sky-300" :
                                                 "bg-amber-500/10 text-amber-300"
                        }`}>
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                          </svg>
                          <span className="flex-1">
                            Zone {zoneInfo.zone} · {zoneInfo.distanceKm.toFixed(1)} km de {DEPART} ·
                            {" "}<span className="font-semibold">Livraison {zoneInfo.feeLabel.toLowerCase() === "gratuit" ? "gratuite" : zoneInfo.feeLabel}</span>
                          </span>
                        </div>
                      )}
                      {!geocoding && zoneInfo && zoneInfo.outOfRange && (
                        <div className="text-[10px] rounded-[5px] px-2 py-1.5 bg-red-500/10 text-red-300 flex items-center gap-1.5">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                          Hors zone de livraison ({zoneInfo.distanceKm.toFixed(1)} km — maximum 10 km)
                        </div>
                      )}
                      {!geocoding && !zoneInfo && (
                        <p className="text-[10px] text-white/40 mt-1">
                          Adresse introuvable — vérifiez l&apos;orthographe ou ajoutez le code postal.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-[10px] text-white/30 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Livraison depuis {DEPART} &middot; distance calculée automatiquement
                  </p>
                </div>
              </div>

              {/* ── Payment method ── */}
              <div ref={payRef} className={`rounded-[5px] transition-all ${showErrors && !paymentValid ? "ring-1 ring-red-500/60 bg-red-500/5 p-3 -m-3" : ""}`}>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-bold flex items-center gap-1">
                  Mode de paiement <span className="text-primary">*</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5">
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
                      <span className={`block text-[9px] mt-0.5 leading-tight ${payMethod === opt.id ? "opacity-80" : "opacity-40"}`}>
                        {opt.sub}
                      </span>
                    </button>
                  ))}
                </div>
                {showErrors && !paymentValid && (
                  <p className="text-[10px] text-red-400 mt-2">Choisissez un mode de paiement</p>
                )}
              </div>

              {/* ── Note paiement sélectionné ── */}
              {isMobilePay && (
                <p className="text-[11px] text-white/50 -mt-2 px-1">
                  → Après clic, vous pourrez ouvrir {appName} pour effectuer le paiement avant d&apos;envoyer la commande.
                </p>
              )}
              {payMethod === "carte" && (
                <p className="text-[11px] text-white/50 -mt-2 px-1">
                  → Vous réglerez par carte bancaire au livreur (TPE).
                </p>
              )}
            </>
          )}
        </div>

        {/* ── Footer / CTA ── */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/5 space-y-3">
            {/* Total avec livraison */}
            <div className="space-y-0.5">
              {deliveryFee > 0 && zoneInfo?.zone && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Sous-total</span>
                  <span className="text-white/60">{formatPrice(subtotal)}</span>
                </div>
              )}
              {zoneInfo && !zoneInfo.outOfRange && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Livraison (Zone {zoneInfo.zone})</span>
                  <span className={deliveryFee === 0 ? "text-emerald-400" : "text-white/60"}>
                    {deliveryFee === 0 ? "Gratuite" : formatPrice(deliveryFee)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-white/60 text-sm">Total</span>
                <span className="text-2xl font-bold text-gradient">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            {step === "payment" ? (
              /* ── Étape paiement mobile (Lydia / PayLib / Wero) ── */
              <div className="space-y-3">
                <div className={`rounded-[5px] p-4 border ${
                  payMethod === "wero"  ? "bg-teal-500/10 border-teal-500/30" :
                  payMethod === "lydia" ? "bg-purple-500/10 border-purple-500/30" :
                                           "bg-sky-500/10 border-sky-500/30"
                }`}>
                  <p className="text-white font-bold text-sm mb-1">Paiement {appName}</p>
                  <p className="text-white/60 text-xs mb-3">
                    Envoyez <span className="text-primary font-bold">{formatPrice(grandTotal)}</span> au numéro :
                  </p>
                  <div className="flex items-center justify-between bg-white/5 rounded-[5px] px-3 py-2 mb-3">
                    <span className="text-white text-sm font-mono">{PHONE}</span>
                    <button
                      onClick={() => handleCopy(PHONE.replace(/\s/g, ""), "phone-pay")}
                      className="text-white/40 hover:text-primary transition-colors"
                    >
                      {copied === "phone-pay"
                        ? <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      }
                    </button>
                  </div>
                  <a
                    href={APP_URLS[payMethod as "lydia" | "paylib" | "wero"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-white/10 hover:bg-white/15 text-white font-semibold py-3 rounded-[5px] text-sm transition-all"
                  >
                    Ouvrir {appName} →
                  </a>
                </div>
                <button
                  onClick={() => doSendOrder(true)}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-4 rounded-[5px] text-sm transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/20 disabled:opacity-40"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                  </svg>
                  {saving ? "Envoi..." : `J'ai payé · Confirmer la commande`}
                </button>
                <button onClick={() => setStep("form")} className="w-full text-white/40 hover:text-white text-xs py-2 transition-colors">
                  ← Revenir au panier
                </button>
              </div>
            ) : step === "sent" ? (
              /* ── Commande envoyée : confirmation client ── */
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-emerald-500/10 to-primary/5 border border-emerald-500/30 rounded-[5px] p-4 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p className="font-heading text-white font-bold text-lg mb-1">
                    Commande prise en compte
                  </p>
                  {orderRef && (
                    <p className="text-primary font-bold text-xl mb-2">
                      #{orderRef.number}
                    </p>
                  )}
                  <p className="text-white/60 text-xs leading-relaxed">
                    Votre commande a bien été transmise au restaurant.
                    {payMethod === "carte"
                      ? ` Vous réglerez ${formatPrice(grandTotal)} au livreur par carte.`
                      : " Le paiement est confirmé, nous préparons vos plats."}
                  </p>
                </div>

                {orderRef && (
                  <a
                    href={`/commande/${orderRef.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-light text-dark font-bold py-3 rounded-[5px] text-sm transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                    </svg>
                    Suivre ma commande
                  </a>
                )}

                <button onClick={handleClose} className="w-full text-white/50 hover:text-white text-xs py-2 transition-colors">
                  Fermer
                </button>
              </div>
            ) : (
              <>
                {/* Validation banner above the button */}
                {showErrors && !formValid && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-[5px] px-3 py-2 flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    <p className="text-red-300 text-xs leading-snug">
                      Merci d&apos;indiquer {missing.slice(0, -1).join(", ")}{missing.length > 1 ? " et " : ""}{missing[missing.length - 1]} avant de commander.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleOrder}
                  disabled={saving}
                  className={`group flex items-center justify-center gap-3 w-full font-bold py-4 rounded-[5px] text-sm transition-all shadow-lg disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${
                    formValid
                      ? "bg-[#25D366] hover:bg-[#20BD5A] text-white hover:scale-[1.02] shadow-[#25D366]/20"
                      : "bg-white/10 hover:bg-white/15 text-white/80 shadow-black/10"
                  }`}
                >
                  {formValid ? (
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  )}
                  {saving
                    ? "Envoi..."
                    : formValid
                      ? (isMobilePay ? `Payer avec ${appName}` : "Envoyer sur WhatsApp")
                      : !minOrderValid
                        ? `Minimum ${MIN_ORDER} € pour commander`
                        : !zoneValid && addressValid
                          ? "Adresse hors zone"
                          : "Complétez vos informations"}
                </button>
                <button onClick={clearCart} className="w-full text-white/30 hover:text-accent text-xs text-center py-1 transition-colors">
                  Vider le panier
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
