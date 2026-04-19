"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

const TABS = [
  {
    id: "accueil",
    label: "Accueil",
    href: "#accueil",
    action: "scroll" as const,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    id: "menu",
    label: "Carte",
    href: "#menu",
    action: "scroll" as const,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
        <path d="M7 2v20"/>
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/>
        <path d="M21 15v7"/>
      </svg>
    ),
  },
  {
    id: "cart",
    label: "Panier",
    href: null,
    action: "cart" as const,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    id: "whatsapp",
    label: "Commander",
    href: "https://wa.me/33744275428",
    action: "external" as const,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
] as const;

export default function MobileTabBar() {
  const { getCount, setDrawerOpen } = useCart();
  const count = getCount();
  const [activeSection, setActiveSection] = useState("accueil");

  /* ── Intersection Observer pour détecter la section active ── */
  useEffect(() => {
    const sections = ["accueil", "menu", "livraison", "contact"];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.3 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const handleTab = (tab: typeof TABS[number]) => {
    if (tab.action === "cart") {
      setDrawerOpen(true);
    } else if (tab.action === "external" && tab.href) {
      window.open(tab.href, "_blank");
    } else if (tab.action === "scroll" && tab.href) {
      const id = tab.href.replace("#", "");
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    /* Visible uniquement sur mobile */
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Glassmorphism bar */}
      <div className="bg-dark/80 backdrop-blur-2xl border-t border-white/8">
        <div className="flex items-stretch">
          {TABS.map((tab) => {
            /* Active si section correspondante est visible, ou si c'est le panier avec articles */
            const isActive =
              tab.id === "cart"
                ? count > 0
                : tab.action === "scroll" && activeSection === tab.id;

            const isWhatsApp = tab.id === "whatsapp";

            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab)}
                className={`
                  relative flex-1 flex flex-col items-center justify-center
                  gap-1 py-2.5 min-h-[56px]
                  transition-all duration-200 active:scale-90
                  ${isWhatsApp
                    ? "text-[#25D366]"
                    : isActive
                      ? "text-primary"
                      : "text-white/40"}
                `}
                aria-label={tab.label}
              >
                {/* Indicateur actif — barre dorée en haut */}
                {isActive && !isWhatsApp && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-b-[2px]" />
                )}

                {/* Badge panier */}
                {tab.id === "cart" && count > 0 && (
                  <span className="absolute top-2 right-[calc(50%-14px)] w-4 h-4 bg-primary text-dark text-[9px] font-bold rounded-[3px] flex items-center justify-center leading-none">
                    {count > 9 ? "9+" : count}
                  </span>
                )}

                {/* Icône */}
                <span className={`transition-transform duration-200 ${isActive ? "scale-110" : ""}`}>
                  {tab.icon}
                </span>

                {/* Label */}
                <span className="text-[10px] font-medium leading-none tracking-wide">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
