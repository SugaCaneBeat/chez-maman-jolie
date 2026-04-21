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
    id: "commander",
    label: "Commander",
    href: null,
    action: "commander" as const,
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 11V7a4 4 0 00-8 0v4"/>
        <path d="M5 9h14l1 12H4L5 9z"/>
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
    } else if (tab.action === "commander") {
      /* Smart: panier ouvert si articles, sinon scroll vers la carte */
      if (count > 0) {
        setDrawerOpen(true);
      } else {
        document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
      }
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

            const isCommander = tab.id === "commander";

            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab)}
                className={`
                  relative flex-1 flex flex-col items-center justify-center
                  gap-1 py-2.5 min-h-[56px]
                  transition-all duration-200 active:scale-90
                  ${isCommander
                    ? "text-primary"
                    : isActive
                      ? "text-primary"
                      : "text-white/40"}
                `}
                aria-label={tab.label}
              >
                {/* Indicateur actif — barre dorée en haut */}
                {isActive && !isCommander && (
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
