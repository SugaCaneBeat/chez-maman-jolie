"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const navItems = [
  {
    label: "Accueil",
    href: "#accueil",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Carte",
    href: "#menu",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    label: "Livraison",
    href: "#livraison",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m0 0h10m4 0h1a1 1 0 001-1v-3.65a1 1 0 00-.22-.624l-3.48-4.35A1 1 0 0014.52 6H13" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "#contact",
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { getCount, setDrawerOpen } = useCart();
  const count = getCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Body scroll lock when mobile menu is open ── */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ── ESC key closes menu ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
          scrolled || isOpen
            ? "bg-dark/90 backdrop-blur-2xl shadow-2xl shadow-black/20 border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-18 sm:h-22">
            <a href="#accueil" onClick={() => setIsOpen(false)} className="group hover:opacity-80 transition-opacity">
              <Image
                src="/logo.svg"
                alt="Chez Maman Jolie"
                width={180}
                height={54}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="relative flex items-center gap-1.5 text-white/60 hover:text-white transition-all text-sm font-medium tracking-wide px-4 py-2 rounded-[5px] hover:bg-white/5"
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
              <button
                onClick={() => setDrawerOpen(true)}
                className="relative text-white/60 hover:text-white transition-all p-2 rounded-[5px] hover:bg-white/5"
                aria-label="Panier"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-dark text-[10px] font-bold rounded-[5px] flex items-center justify-center">
                    {count}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  if (count > 0) {
                    setDrawerOpen(true);
                  } else {
                    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="relative ml-4 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark font-bold px-6 py-2.5 rounded-[5px] text-sm transition-all hover:shadow-lg hover:shadow-primary/25 hover:scale-105 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 ? `Commander (${count})` : "Commander"}
              </button>
            </nav>

            {/* Mobile hamburger / close */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-white/90 p-2 hover:bg-white/5 rounded-[5px] transition-colors"
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────
           MOBILE MENU — full overlay under header
         ────────────────────────────────────────────── */}
      <div
        className={`md:hidden fixed inset-0 z-[55] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Solid opaque background covering the whole viewport */}
        <div className="absolute inset-0 bg-dark" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

        {/* Decorative blur blobs */}
        <div className="absolute top-40 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />

        {/* Content — padded to clear the fixed header */}
        <div
          className="relative h-full flex flex-col overflow-y-auto"
          style={{ paddingTop: "calc(4.5rem + env(safe-area-inset-top))" }}
        >
          <nav className="px-5 pt-6 space-y-1.5">
            {navItems.map((item, i) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 py-4 px-4 text-white hover:bg-white/5 rounded-[5px] transition-all text-base font-medium border border-white/5 hover:border-primary/20"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="w-8 h-8 flex items-center justify-center text-primary bg-primary/10 rounded-[5px] flex-shrink-0">
                  <span className="[&>svg]:w-4 [&>svg]:h-4">{item.icon}</span>
                </span>
                <span className="flex-1">{item.label}</span>
                <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ))}

            {/* Panier */}
            <button
              onClick={() => { setDrawerOpen(true); setIsOpen(false); }}
              className="flex items-center gap-4 py-4 px-4 text-white hover:bg-white/5 rounded-[5px] transition-all text-base font-medium w-full border border-white/5 hover:border-primary/20"
            >
              <span className="w-8 h-8 flex items-center justify-center text-primary bg-primary/10 rounded-[5px] flex-shrink-0 relative">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-primary text-dark text-[10px] font-bold rounded-[5px] flex items-center justify-center px-1">
                    {count}
                  </span>
                )}
              </span>
              <span className="flex-1 text-left">Panier</span>
              <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>

          {/* Spacer pushes CTA to bottom */}
          <div className="flex-1" />

          {/* Bottom CTA + contact */}
          <div className="px-5 pb-8 pt-4 space-y-3" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
            <a
              href="https://wa.me/33744275428"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-6 py-4 rounded-[5px] text-sm transition-all shadow-lg shadow-[#25D366]/20"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp direct
            </a>

            <button
              onClick={() => {
                setIsOpen(false);
                if (count > 0) {
                  setDrawerOpen(true);
                } else {
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="block w-full bg-gradient-to-r from-primary to-primary-light text-dark font-bold px-6 py-4 rounded-[5px] text-sm text-center transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              {count > 0 ? `Commander (${count} article${count > 1 ? "s" : ""})` : "Découvrir la carte"}
            </button>

            <p className="text-center text-white/30 text-xs pt-2">
              07 44 27 54 28 &middot; Lun-Dim 11h&ndash;22h
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
