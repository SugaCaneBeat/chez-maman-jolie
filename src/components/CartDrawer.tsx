"use client";

import { useState, useRef, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { createOrder } from "@/lib/actions/orders";
import { createSumUpCheckoutForOrder } from "@/lib/actions/sumup-checkout";
import { resolveZone, type ZoneInfo, type GeocodedAddress, DEPART_LABEL } from "@/lib/geo";
import Image from "next/image";

/* ─── Constantes ─── */
const DEPART = "Paris 11ème";

/* Minimum de commande */
const MIN_ORDER = 25;

/* Un seul mode de paiement: carte bancaire via SumUp (online checkout) */
type PayMethod = "carte";


export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCart();

  /* Carte est le seul moyen de paiement — pré-sélectionné */
  const payMethod: PayMethod = "carte";

  /* ── Customer info: split fields ── */
  const [prenom, setPrenom]         = useState("");
  const [nom, setNom]               = useState("");
  const [tel, setTel]               = useState("");
  const [numRue, setNumRue]         = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille]           = useState("");
  const [complement, setComplement] = useState("");
  const [tip, setTip]               = useState(0);

  const [saving, setSaving]       = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  /* ── Geolocation state ── */
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [geocoded, setGeocoded] = useState<GeocodedAddress | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  /* ── Flow step: "form" → "payment" → "sent" ── */
  /* Plus de step "sent" : SumUp redirige directement vers /commande/[id] */

  /* ── Refs for scroll-to-missing-field ── */
  const prenomRef = useRef<HTMLInputElement>(null);
  const nomRef    = useRef<HTMLInputElement>(null);
  const telRef    = useRef<HTMLInputElement>(null);
  const rueRef    = useRef<HTMLInputElement>(null);
  const cpRef     = useRef<HTMLInputElement>(null);
  const villeRef  = useRef<HTMLInputElement>(null);

  /* ── Adresse complète reconstruite à partir des champs ── */
  const fullAddress =
    numRue.trim() && codePostal.trim()
      ? `${numRue.trim()}, ${codePostal.trim()} ${ville.trim()}`.trim()
      : "";

  /* ── Validation ── */
  const subtotal       = getTotal();
  const deliveryFee    = zoneInfo && !zoneInfo.outOfRange ? zoneInfo.fee : 0;
  const grandTotal     = subtotal + deliveryFee + tip;
  const minOrderValid  = subtotal >= MIN_ORDER;
  const prenomValid    = prenom.trim().length >= 2;
  const nomValid       = nom.trim().length >= 2;
  const telDigits      = tel.replace(/\D/g, "");
  const telValid       = telDigits.length >= 10;
  const numRueValid    = numRue.trim().length >= 4;
  const codePostalValid = /^\d{5}$/.test(codePostal.trim());
  const villeValid     = ville.trim().length >= 2;
  const addressValid   = numRueValid && codePostalValid && villeValid;
  const zoneValid      = zoneInfo !== null && !zoneInfo.outOfRange;
  const formValid      = minOrderValid && prenomValid && nomValid && telValid && addressValid && zoneValid;

  const missing: string[] = [];
  if (!minOrderValid)    missing.push(`atteindre ${MIN_ORDER} € minimum`);
  if (!prenomValid)      missing.push("votre prénom");
  if (!nomValid)         missing.push("votre nom");
  if (!telValid)         missing.push("votre téléphone");
  if (!numRueValid)      missing.push("votre numéro et rue");
  if (!codePostalValid)  missing.push("un code postal valide");
  if (!villeValid)       missing.push("votre ville");
  if (!zoneValid && addressValid) missing.push("une adresse dans notre zone");

  /* ── Body scroll lock quand le drawer est ouvert (iOS Safari fix) ── */
  useEffect(() => {
    if (!isDrawerOpen) return;
    const scrollY = window.scrollY;
    const prevBody = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prevBody.overflow;
      document.body.style.position = prevBody.position;
      document.body.style.top = prevBody.top;
      document.body.style.width = prevBody.width;
      window.scrollTo(0, scrollY);
    };
  }, [isDrawerOpen]);

  /* ── Scroll vers l'input focus pour qu'il ne soit pas caché par le clavier iOS ── */
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300); /* attend que le clavier iOS s'affiche */
      }
    };
    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, [isDrawerOpen]);

  /* ── Géocoder l'adresse (debounced) dès qu'elle change ── */
  useEffect(() => {
    if (!addressValid) {
      setZoneInfo(null);
      setGeocoded(null);
      return;
    }
    setGeocoding(true);
    const handle = setTimeout(async () => {
      const res = await resolveZone(fullAddress);
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
  }, [fullAddress, addressValid]);

  const formatPrice = (p: number) =>
    p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;

  const handleClose = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setShowErrors(false);
      setTip(0);
    }, 400);
  };

  const handleOrder = async () => {
    /* Validate required fields */
    if (!formValid) {
      setShowErrors(true);
      const scroll = (el: HTMLElement | null) => {
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      };
      if (!prenomValid)          scroll(prenomRef.current);
      else if (!nomValid)        scroll(nomRef.current);
      else if (!telValid)        scroll(telRef.current);
      else if (!numRueValid)     scroll(rueRef.current);
      else if (!codePostalValid) scroll(cpRef.current);
      else if (!villeValid)      scroll(villeRef.current);
      return;
    }

    /* Carte → SumUp online checkout */
    await doCardCheckout();
  };

  /* ── Carte bancaire en ligne via SumUp ─── */
  const doCardCheckout = async () => {
    setSaving(true);
    try {
      /* 1) Créer la commande en "pending" */
      const orderRes = await createOrder({
        items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
        customerName: `${prenom} ${nom}`.trim(),
        customerPhone: tel,
        customerAddress: complement.trim()
          ? `${numRue}\n${codePostal} ${ville}\n${complement.trim()}`
          : `${numRue}\n${codePostal} ${ville}`,
        paymentMethod: "carte",
        paid: false,
        total: grandTotal,
        tip,
      });
      if (!orderRes.success || !orderRes.orderId || !orderRes.orderNumber) {
        setSaving(false);
        alert(orderRes.error ?? "Erreur lors de la création de la commande");
        return;
      }

      /* 2) Créer le checkout SumUp côté serveur */
      const checkoutRes = await createSumUpCheckoutForOrder(
        orderRes.orderId,
        orderRes.orderNumber,
        grandTotal
      );
      if (!checkoutRes.success || !checkoutRes.checkoutId) {
        setSaving(false);
        alert(
          checkoutRes.error ??
            "Paiement par carte indisponible pour le moment — réessayez plus tard."
        );
        return;
      }

      /* 3) Vider le panier puis afficher notre page de paiement
         (widget SumUp embarqué sur notre site) */
      clearCart();
      window.location.href = `/checkout/${orderRes.orderId}`;
    } catch (e) {
      setSaving(false);
      alert(e instanceof Error ? e.message : "Erreur");
    }
  };

  /* Appelé depuis "Envoyer" (carte) ou "J'ai payé" (Wero etc.) */
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Drawer — iOS-friendly: 100dvh (s'adapte au clavier), safe-area en footer, tap-highlight off */}
      <div
        className={`fixed top-0 right-0 z-[80] w-full max-w-md bg-dark-light border-l border-white/5 shadow-2xl transition-transform duration-500 ease-out flex flex-col h-[100dvh] [-webkit-tap-highlight-color:transparent] ${
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

              {/* ── Pourboire optionnel ── */}
              <div className="glass rounded-[5px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                    Pourboire pour le livreur
                  </h4>
                  <span className="text-[9px] text-white/30 normal-case">optionnel</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((amount) => {
                    const active = tip === amount;
                    return (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setTip(amount)}
                        className={`py-3 min-h-[44px] rounded-[5px] text-sm font-bold transition-all border ${
                          active
                            ? "bg-primary/15 text-primary border-primary/40 scale-[1.02]"
                            : "bg-white/5 text-white/50 border-white/5 hover:bg-white/8"
                        }`}
                      >
                        {amount === 0 ? "Aucun" : `${amount} €`}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-white/30 mt-2 leading-snug">
                  {tip === 0
                    ? "Vous pouvez aussi donner un pourboire en main propre au livreur."
                    : `Merci ! ${tip} € seront ajoutés au total et reversés au livreur.`}
                </p>
              </div>

              {/* ── Customer info ── */}
              <div className="glass rounded-[5px] p-4 space-y-3">
                <h4 className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                  Vos informations
                </h4>

                {/* Prénom + Nom sur la même ligne */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      Prénom <span className="text-primary">*</span>
                    </label>
                    <input
                      ref={prenomRef}
                      type="text"
                      autoComplete="given-name"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      placeholder="Jean"
                      className={`w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border placeholder:text-white/20 transition-colors ${
                        showErrors && !prenomValid
                          ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                          : "border-white/5 focus:border-primary/50"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      Nom <span className="text-primary">*</span>
                    </label>
                    <input
                      ref={nomRef}
                      type="text"
                      autoComplete="family-name"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      placeholder="Dupont"
                      className={`w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border placeholder:text-white/20 transition-colors ${
                        showErrors && !nomValid
                          ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                          : "border-white/5 focus:border-primary/50"
                      }`}
                    />
                  </div>
                </div>

                {/* Téléphone */}
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
                    className={`w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border placeholder:text-white/20 transition-colors ${
                      showErrors && !telValid
                        ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                        : "border-white/5 focus:border-primary/50"
                    }`}
                  />
                  {showErrors && !telValid && (
                    <p className="text-[10px] text-red-400 mt-1">Numéro valide requis (au moins 10 chiffres)</p>
                  )}
                </div>

                {/* Numéro et rue */}
                <div>
                  <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                    Numéro et rue <span className="text-primary">*</span>
                  </label>
                  <input
                    ref={rueRef}
                    type="text"
                    autoComplete="street-address"
                    value={numRue}
                    onChange={(e) => setNumRue(e.target.value)}
                    placeholder="15 rue du Temple"
                    className={`w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border placeholder:text-white/20 transition-colors ${
                      showErrors && !numRueValid
                        ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                        : "border-white/5 focus:border-primary/50"
                    }`}
                  />
                </div>

                {/* Code postal + Ville sur la même ligne */}
                <div className="grid grid-cols-[1fr_2fr] gap-2">
                  <div>
                    <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      Code postal <span className="text-primary">*</span>
                    </label>
                    <input
                      ref={cpRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                      value={codePostal}
                      onChange={(e) => setCodePostal(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      placeholder="75011"
                      className={`w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border placeholder:text-white/20 transition-colors ${
                        showErrors && !codePostalValid
                          ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                          : "border-white/5 focus:border-primary/50"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                      Ville <span className="text-primary">*</span>
                    </label>
                    <input
                      ref={villeRef}
                      type="text"
                      autoComplete="address-level2"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      placeholder="Paris"
                      className={`w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border placeholder:text-white/20 transition-colors ${
                        showErrors && !villeValid
                          ? "border-red-500/60 bg-red-500/5 focus:border-red-400"
                          : "border-white/5 focus:border-primary/50"
                      }`}
                    />
                  </div>
                </div>

                {/* Complément optionnel */}
                <div>
                  <label className="flex items-center gap-1 text-[10px] text-white/30 uppercase tracking-wider mb-1">
                    Complément <span className="text-white/30 normal-case font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Code d'accès, étage, escalier…"
                    className="w-full bg-white/5 rounded-[5px] px-3 py-3 text-white text-base focus:outline-none border border-white/5 focus:border-primary/50 placeholder:text-white/20 transition-colors"
                  />
                </div>

                {showErrors && !addressValid && (
                  <p className="text-[10px] text-red-400">
                    Adresse complète requise (numéro + rue, code postal 5 chiffres, ville)
                  </p>
                )}

                {/* Indicateur de zone après géocodage */}
                {addressValid && (
                  <div className="mt-1">
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
                        Adresse introuvable — vérifiez l&apos;orthographe ou le code postal.
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

              {/* ── Paiement carte bancaire (seul mode disponible) ── */}
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-[5px] p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-[5px] bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">Paiement par carte bancaire</p>
                  <p className="text-white/50 text-xs mt-0.5 leading-relaxed">
                    Vous serez redirigé vers la page de paiement sécurisée SumUp (3D&nbsp;Secure). Retour automatique vers le suivi de commande après paiement.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer / CTA ── iOS-friendly: safe-area inset + sticky */}
        {items.length > 0 && (
          <div
            className="px-6 pt-4 border-t border-white/5 space-y-3 bg-dark-light"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            {/* Total avec livraison + pourboire */}
            <div className="space-y-0.5">
              {(deliveryFee > 0 || tip > 0) && (
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
              {tip > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Pourboire</span>
                  <span className="text-white/60">{formatPrice(tip)}</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-white/60 text-sm">Total</span>
                <span className="text-2xl font-bold text-gradient">{formatPrice(grandTotal)}</span>
              </div>
            </div>

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
                  className={`group flex items-center justify-center gap-3 w-full font-bold py-4 rounded-[5px] text-base min-h-[52px] transition-all shadow-lg disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed ${
                    formValid
                      ? "bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark hover:scale-[1.02] shadow-primary/30"
                      : "bg-white/10 hover:bg-white/15 text-white/80 shadow-black/10"
                  }`}
                >
                  {formValid ? (
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  )}
                  {saving
                    ? "Redirection…"
                    : formValid
                      ? `Payer ${formatPrice(grandTotal)} par carte`
                      : !minOrderValid
                        ? `Minimum ${MIN_ORDER} € pour commander`
                        : !zoneValid && addressValid
                          ? "Adresse hors zone"
                          : "Complétez vos informations"}
                </button>
            <button onClick={clearCart} className="w-full text-white/30 hover:text-accent text-xs text-center py-1 transition-colors">
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}
