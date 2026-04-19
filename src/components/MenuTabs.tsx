"use client";

import { useState } from "react";
import MenuSection from "./MenuSection";
import FormulesSection from "./FormulesSection";
import BoissonsSection from "./BoissonsSection";
import type { Category } from "@/lib/menu";

/* ─────────────────────────────────────────────────────────
   Scénario restaurant : Entrées → Plats → Desserts → Boissons
   ───────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: "entrees",  label: "Entrées",  emoji: "🥗", slugs: ["entrees"] },
  { id: "plats",    label: "Plats",    emoji: "🍽️", slugs: ["formules","specialites","viandes","poissons","mijotes","legumes","accompagnements"] },
  { id: "desserts", label: "Desserts", emoji: "🍮", slugs: ["desserts"] },
  { id: "boissons", label: "Boissons", emoji: "🥤", slugs: ["boissons"] },
] as const;

export default function MenuTabs({ categories }: { categories: Category[] }) {
  const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));

  const [activeSection, setActiveSection] = useState("entrees");
  const [activeSub, setActiveSub]         = useState("formules");

  const section  = SECTIONS.find(s => s.id === activeSection)!;
  const subCats  = section.slugs.map(sl => catBySlug[sl]).filter(Boolean) as Category[];
  const isMulti  = subCats.length > 1;
  const displayCat = isMulti
    ? (subCats.find(c => c.slug === activeSub) ?? subCats[0])
    : subCats[0];
  const accompsCat = catBySlug["accompagnements"];

  const switchSection = (id: string) => {
    setActiveSection(id);
    const sec = SECTIONS.find(s => s.id === id)!;
    const first = sec.slugs.find(sl => catBySlug[sl]);
    if (first) setActiveSub(first);
  };

  return (
    <div>

      {/* ══════════════════════════════════════════
          NAVIGATION PRINCIPALE
          • Scroll horizontal sur mobile (44px touch target)
          • Centré sur desktop
          ══════════════════════════════════════════ */}
      <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1 mb-6 -mx-5 px-5 sm:mx-0 sm:px-0 sm:justify-center sm:flex-wrap">
        {SECTIONS.map(sec => {
          const available = sec.slugs.some(sl => catBySlug[sl]);
          if (!available) return null;
          const active = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => switchSection(sec.id)}
              className={`
                flex-shrink-0 flex items-center gap-2
                min-h-[44px] px-4 sm:px-6 py-2 sm:py-3
                rounded-full text-sm sm:text-base font-semibold
                transition-all duration-200
                ${active
                  ? "bg-gradient-to-r from-primary to-primary-light text-dark shadow-lg shadow-primary/20"
                  : "glass text-white/60 hover:text-white hover:bg-white/10 active:scale-95"}
              `}
            >
              <span className="text-lg">{sec.emoji}</span>
              <span className="whitespace-nowrap">{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          SOUS-NAVIGATION — style iOS filter chips
          • Capsules blanches sur fond translucide
          • Actif = blanc + ombre (iOS selected state)
          • Fade droit pour indiquer le scroll
          ══════════════════════════════════════════ */}
      {isMulti && (
        <div className="relative mb-8 -mx-5 sm:mx-0">
          {/* Fade droit (scroll hint) */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-dark to-transparent z-10 sm:hidden" />

          <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1 px-5 sm:px-0 sm:justify-center sm:flex-wrap">
            {subCats.map(cat => {
              const active = activeSub === cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveSub(cat.slug)}
                  className={`
                    flex-shrink-0 flex items-center gap-1.5
                    h-9 px-4
                    rounded-full text-xs font-semibold
                    transition-all duration-200 ease-out
                    ${active
                      ? "bg-white text-[#111008] shadow-md shadow-black/25 scale-[1.03]"
                      : "bg-white/10 text-white/55 hover:bg-white/15 hover:text-white/80 active:scale-95"}
                  `}
                >
                  <span className="text-sm leading-none">{cat.icon}</span>
                  <span className="whitespace-nowrap">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CONTENU
          ══════════════════════════════════════════ */}
      <div className="min-h-[400px]">
        {displayCat?.type === "formules" && displayCat.formulesData && (
          <FormulesSection data={displayCat.formulesData} />
        )}
        {displayCat?.type === "boissons" && displayCat.boissonsData && (
          <BoissonsSection data={displayCat.boissonsData} />
        )}
        {displayCat?.type === "standard" && (
          <>
            <MenuSection
              title={displayCat.name}
              items={displayCat.items}
              showAccompagnement={["specialites","viandes","poissons","mijotes"].includes(displayCat.slug)}
            />
            {displayCat.slug === "legumes" && accompsCat && (
              <MenuSection title="Accompagnements" items={accompsCat.items} />
            )}
          </>
        )}
        {!displayCat && (
          <p className="text-white/30 text-center py-20">Aucun plat disponible</p>
        )}
      </div>
    </div>
  );
}
