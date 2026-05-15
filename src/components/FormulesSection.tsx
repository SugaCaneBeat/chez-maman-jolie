"use client";

import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import type { FormulesData, Formule, FormuleComponent } from "@/lib/menu";

const COMPONENT_LABELS: Record<string, string> = {
  entree:         "Entrée",
  plat:           "Plat",
  accompagnement: "Accompagnement",
  dessert:        "Dessert",
  boisson:        "Boisson",
};

/* Ordre d'affichage prioritaire des composants (les plus visuels d'abord) */
const COMPONENT_PRIORITY: Record<string, number> = {
  plat:           1,
  entree:         2,
  dessert:        3,
  accompagnement: 4,
  boisson:        5,
};

interface CollageTile {
  src: string;
  alt: string;
}

/* ── Collage des photos RÉELLES des composants sélectionnés ──
 * Layouts intelligents selon le nombre de composants avec photo :
 *  1 → plein cadre
 *  2 → 1×2 horizontal
 *  3 → 1 grand + 2 petits
 *  4 → 2×2 grille classique
 *  5 → 1 grand à gauche + 4 petits 2×2 à droite (formule complète) */
function ComponentCollage({ tiles }: { tiles: CollageTile[] }) {
  const count = tiles.length;
  if (count === 0) return null;

  const baseImg = (t: CollageTile) => (
    <Image
      src={t.src}
      alt={t.alt}
      fill
      sizes="(max-width: 640px) 50vw, 200px"
      className="object-cover"
      unoptimized
    />
  );

  if (count === 1) {
    return (
      <div className="relative h-44 overflow-hidden">{baseImg(tiles[0])}</div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-2 gap-0.5 h-44">
        {tiles.map((t, i) => (
          <div key={i} className="relative overflow-hidden">{baseImg(t)}</div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-44">
        <div className="relative overflow-hidden row-span-2">{baseImg(tiles[0])}</div>
        <div className="relative overflow-hidden">{baseImg(tiles[1])}</div>
        <div className="relative overflow-hidden">{baseImg(tiles[2])}</div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-44">
        {tiles.map((t, i) => (
          <div key={i} className="relative overflow-hidden">{baseImg(t)}</div>
        ))}
      </div>
    );
  }

  /* 5 ou + : grand plat à gauche + 4 mini à droite (2x2) */
  return (
    <div className="grid grid-cols-2 gap-0.5 h-44">
      <div className="relative overflow-hidden">{baseImg(tiles[0])}</div>
      <div className="grid grid-cols-2 grid-rows-2 gap-0.5">
        {tiles.slice(1, 5).map((t, i) => (
          <div key={i} className="relative overflow-hidden">{baseImg(t)}</div>
        ))}
      </div>
    </div>
  );
}

/* ── Single formule card ── */
function FormuleCard({ formule, featured }: { formule: Formule; featured: boolean }) {
  const hasRealComponents = formule.id && !formule.id.startsWith("fallback-");

  /* Photos RÉELLES des composants sélectionnés — on n'utilise PAS formule.image
   * qui peut être un collage admin générique ne reflétant pas les vrais items. */
  const tiles: CollageTile[] = formule.components
    .slice()
    .sort((a, b) =>
      (COMPONENT_PRIORITY[a.component_type] ?? 99) -
      (COMPONENT_PRIORITY[b.component_type] ?? 99)
    )
    .filter((c): c is FormuleComponent & { item: { image: string; name: string; id: string } } =>
      Boolean(c.item?.image)
    )
    .map(c => ({ src: c.item.image as string, alt: c.item.name }));

  /* Fallback pour les formules sans aucun composant lié (anciennes données) :
   * on accepte formule.image en dernier recours uniquement. */
  const showFormuleFallback = tiles.length === 0 && Boolean(formule.image);

  return (
    <div
      className={`glass rounded-[5px] overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 ${
        featured ? "sm:-translate-y-3 ring-2 ring-primary/30" : ""
      }`}
    >
      {/* Card image area — toujours les vraies photos des items sélectionnés */}
      {tiles.length > 0 ? (
        <ComponentCollage tiles={tiles} />
      ) : showFormuleFallback ? (
        <div className="relative h-44 overflow-hidden">
          <Image
            src={formule.image as string}
            alt={formule.name}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : null}

      {/* Card body */}
      <div className="p-6 text-center">
        {featured && (
          <span className="inline-block bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-[5px] mb-3">
            Populaire
          </span>
        )}

        <div className="text-4xl sm:text-5xl font-bold text-gradient mb-2">
          {formule.price} €
        </div>
        <p className="font-semibold text-white text-sm mb-3">{formule.name}</p>

        {/* Component list */}
        {hasRealComponents && formule.components.length > 0 && (
          <ul className="text-left text-white/60 text-xs space-y-1 mb-4 border-t border-white/10 pt-3">
            {formule.components.map((comp, i) => {
              const label = COMPONENT_LABELS[comp.component_type] ?? comp.component_type;
              return (
                <li key={i} className="flex gap-1.5">
                  <span className="text-[#C9922A] font-semibold flex-shrink-0">{label} ·</span>
                  <span className="truncate">{comp.item.name}</span>
                </li>
              );
            })}
          </ul>
        )}

        <AddToCartButton
          variant="prominent"
          item={{ id: formule.id || formule.name, name: formule.name, price: formule.price }}
          className="mx-auto mt-2"
        />
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function FormulesSection({ data }: { data: FormulesData }) {
  return (
    <div className="mb-8">
      <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">
        Formules Midi
      </h3>

      <div className="grid sm:grid-cols-3 gap-5">
        {data.formules.map((f, i) => (
          <FormuleCard key={f.id || f.name} formule={f} featured={i === 1} />
        ))}
      </div>

      {data.conditions && (
        <p className="text-sm text-white/55 mt-6 text-center italic">
          * {data.conditions}
        </p>
      )}
    </div>
  );
}
