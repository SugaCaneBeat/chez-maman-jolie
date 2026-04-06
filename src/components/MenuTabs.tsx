"use client";

import { useState } from "react";
import MenuSection from "./MenuSection";
import FormulesSection from "./FormulesSection";
import BoissonsSection from "./BoissonsSection";

import entrees from "@/data/entrees.json";
import specialites from "@/data/specialites.json";
import viandes from "@/data/viandes.json";
import poissons from "@/data/poissons.json";
import mijotes from "@/data/mijotes.json";
import legumes from "@/data/legumes.json";
import accompagnements from "@/data/accompagnements.json";
import desserts from "@/data/desserts.json";
import formules from "@/data/formules.json";
import boissons from "@/data/boissons.json";

const tabs = [
  { id: "entrees", label: "Entrées", icon: "🥗" },
  { id: "specialites", label: "Spécialités", icon: "⭐" },
  { id: "viandes", label: "Viandes", icon: "🥩" },
  { id: "poissons", label: "Poissons", icon: "🐟" },
  { id: "mijotes", label: "Mijotés", icon: "🍲" },
  { id: "legumes", label: "Légumes", icon: "🥬" },
  { id: "desserts", label: "Desserts", icon: "🍮" },
  { id: "formules", label: "Formules", icon: "📋" },
  { id: "boissons", label: "Boissons", icon: "🥤" },
];

export default function MenuTabs() {
  const [activeTab, setActiveTab] = useState("entrees");

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex overflow-x-auto gap-2 pb-6 mb-10 scrollbar-hide -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 flex-shrink-0 flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-primary to-primary-light text-dark shadow-lg shadow-primary/20 scale-105"
                : "glass text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "entrees" && <MenuSection title="Entrées" items={entrees} />}
        {activeTab === "specialites" && <MenuSection title="Spécialités Maison" items={specialites} showAccompagnement />}
        {activeTab === "viandes" && <MenuSection title="Viandes" items={viandes} />}
        {activeTab === "poissons" && <MenuSection title="Poissons" items={poissons} />}
        {activeTab === "mijotes" && <MenuSection title="Cuisine Mijotée" items={mijotes} />}
        {activeTab === "legumes" && (
          <>
            <MenuSection title="Légumes" items={legumes} />
            <MenuSection title="Accompagnements" items={accompagnements} />
          </>
        )}
        {activeTab === "desserts" && <MenuSection title="Desserts" items={desserts} />}
        {activeTab === "formules" && <FormulesSection data={formules} />}
        {activeTab === "boissons" && <BoissonsSection data={boissons} />}
      </div>
    </div>
  );
}
