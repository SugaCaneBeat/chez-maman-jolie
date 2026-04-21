"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import MenuSection from "./MenuSection";
import FormulesSection from "./FormulesSection";
import BoissonsSection from "./BoissonsSection";
import type { Category } from "@/lib/menu";

/* ─── Icônes 2D plates pour les sections ─── */
const ICONS: Record<string, ReactNode> = {
  tous: (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3"  width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  entrees: (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  plats: (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z"/>
      <path d="M21 15v7"/>
    </svg>
  ),
  desserts: (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/>
      <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/>
      <path d="M2 21h20"/>
      <path d="M7 8v2M12 8v2M17 8v2"/>
      <path d="M7 4h.01M12 4h.01M17 4h.01"/>
    </svg>
  ),
  boissons: (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h8M7 10h10M12 15v7"/>
      <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H4c-1.5 4-2 6-2 8a5 5 0 0 0 5 5z"/>
    </svg>
  ),
};

/* ─── Sections restaurant ─── */
const SECTIONS = [
  { id: "tous",     label: "Tous",     slugs: [] },
  { id: "entrees",  label: "Entrées",  slugs: ["entrees"] },
  { id: "plats",    label: "Plats",    slugs: ["formules","specialites","viandes","poissons","mijotes","legumes","accompagnements"] },
  { id: "desserts", label: "Desserts", slugs: ["desserts"] },
  { id: "boissons", label: "Boissons", slugs: ["boissons"] },
] as const;

/* Ordre d'affichage de toutes les catégories en mode "Tous" */
const ALL_ORDER = [
  "entrees",
  "formules",
  "specialites",
  "viandes",
  "poissons",
  "mijotes",
  "legumes",
  "accompagnements",
  "desserts",
  "boissons",
];

export default function MenuTabs({ categories }: { categories: Category[] }) {
  const catBySlug = Object.fromEntries(categories.map(c => [c.slug, c]));

  const [activeSection, setActiveSection] = useState("tous");
  const [activeSub, setActiveSub]         = useState("formules");

  const section  = SECTIONS.find(s => s.id === activeSection)!;
  const isTous   = activeSection === "tous";
  const subCats  = section.slugs.map(sl => catBySlug[sl]).filter(Boolean) as Category[];
  const isMulti  = subCats.length > 1;
  const displayCat = isMulti
    ? (subCats.find(c => c.slug === activeSub) ?? subCats[0])
    : subCats[0];
  const accompsCat = catBySlug["accompagnements"];

  /* Toutes les catégories pour le mode "Tous" — dans l'ordre défini */
  const allCats: Category[] = isTous
    ? ALL_ORDER.map(slug => catBySlug[slug]).filter(Boolean) as Category[]
    : [];

  const switchSection = (id: string) => {
    setActiveSection(id);
    const sec = SECTIONS.find(s => s.id === id)!;
    const first = sec.slugs.find(sl => catBySlug[sl]);
    if (first) setActiveSub(first);
  };

  return (
    <div>

      {/* ══════════════════════════════════════════
          NAVIGATION PRINCIPALE — icônes 2D, angles 5px
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
                rounded-[5px] text-sm sm:text-base font-semibold
                transition-all duration-200
                ${active
                  ? "bg-gradient-to-r from-primary to-primary-light text-dark shadow-lg shadow-primary/20"
                  : "glass text-white/60 hover:text-white hover:bg-white/10 active:scale-95"}
              `}
            >
              {ICONS[sec.id]}
              <span className="whitespace-nowrap">{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════
          SOUS-NAVIGATION — iOS filter chips, angles 5px
          ══════════════════════════════════════════ */}
      {isMulti && !isTous && (
        <div className="relative mb-8 -mx-5 sm:mx-0">
          {/* Fade droit scroll hint */}
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
                    rounded-[5px] text-xs font-semibold
                    transition-all duration-200 ease-out
                    ${active
                      ? "bg-white text-[#111008] shadow-md shadow-black/25 scale-[1.03]"
                      : "bg-white/10 text-white/55 hover:bg-white/15 hover:text-white/80 active:scale-95"}
                  `}
                >
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
        {isTous ? (
          /* Mode "Tous" — affiche chaque catégorie empilée */
          <div className="space-y-14">
            {allCats.length === 0 && (
              <p className="text-white/30 text-center py-20">Aucun plat disponible</p>
            )}
            {allCats.map((cat) => (
              <div key={cat.slug}>
                {cat.type === "formules" && cat.formulesData && (
                  <FormulesSection data={cat.formulesData} />
                )}
                {cat.type === "boissons" && cat.boissonsData && (
                  <BoissonsSection data={cat.boissonsData} />
                )}
                {cat.type === "standard" && (
                  <MenuSection
                    title={cat.name}
                    items={cat.items}
                    showAccompagnement={["specialites","viandes","poissons","mijotes"].includes(cat.slug)}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
