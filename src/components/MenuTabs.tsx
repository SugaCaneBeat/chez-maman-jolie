"use client";

import { useState } from "react";
import MenuSection from "./MenuSection";
import FormulesSection from "./FormulesSection";
import BoissonsSection from "./BoissonsSection";
import type { Category } from "@/lib/menu";

interface MenuTabsProps {
  categories: Category[];
}

export default function MenuTabs({ categories }: MenuTabsProps) {
  const [activeTab, setActiveTab] = useState(categories[0]?.slug || "entrees");

  const activeCat = categories.find((c) => c.slug === activeTab);

  // For "legumes" tab, also find "accompagnements" category
  const accompagnementsCat = categories.find((c) => c.slug === "accompagnements");

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-2 pb-6 mb-10 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
        {categories
          .filter((c) => c.slug !== "accompagnements") // accompagnements shown with legumes
          .map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setActiveTab(cat.slug)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 flex-shrink-0 flex items-center gap-2 ${
                activeTab === cat.slug
                  ? "bg-gradient-to-r from-primary to-primary-light text-dark shadow-lg shadow-primary/20 scale-105"
                  : "glass text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeCat && activeCat.type === "formules" && activeCat.formulesData && (
          <FormulesSection data={activeCat.formulesData} />
        )}
        {activeCat && activeCat.type === "boissons" && activeCat.boissonsData && (
          <BoissonsSection data={activeCat.boissonsData} />
        )}
        {activeCat && activeCat.type === "standard" && (
          <>
            <MenuSection
              title={activeCat.name}
              items={activeCat.items}
              showAccompagnement={activeCat.slug === "specialites"}
            />
            {activeCat.slug === "legumes" && accompagnementsCat && (
              <MenuSection title="Accompagnements" items={accompagnementsCat.items} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
