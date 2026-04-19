"use client";

import AddToCartButton from "./AddToCartButton";
import type { FormulesData, Formule } from "@/lib/menu";

const COMPONENT_LABELS: Record<string, string> = {
  entree:  "Entrée",
  plat:    "Plat",
  dessert: "Dessert",
  boisson: "Boisson",
};

/* ── CSS collage when no generated image ── */
function ImageCollage({ images }: { images: string[] }) {
  const count = Math.min(images.length, 4);
  if (count === 0) return null;

  return (
    <div
      className="grid gap-0.5 h-44"
      style={{ gridTemplateColumns: count <= 1 ? "1fr" : "1fr 1fr" }}
    >
      {images.slice(0, count).map((img, i) => (
        <div
          key={i}
          className={`relative overflow-hidden ${count === 3 && i === 0 ? "row-span-2" : ""}`}
        >
          <img src={img} alt="" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

/* ── Single formule card ── */
function FormuleCard({ formule, featured }: { formule: Formule; featured: boolean }) {
  const hasRealComponents = formule.id && !formule.id.startsWith("fallback-");
  const componentImages = formule.components
    .map(c => c.item.image)
    .filter((img): img is string => Boolean(img));

  return (
    <div
      className={`glass rounded-[5px] overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 ${
        featured ? "sm:-translate-y-3 ring-2 ring-primary/30" : ""
      }`}
    >
      {/* Card image area */}
      {formule.image ? (
        <div className="h-44 overflow-hidden">
          <img
            src={formule.image}
            alt={formule.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : componentImages.length > 0 ? (
        <ImageCollage images={componentImages} />
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
        <p className="text-sm text-white/30 mt-6 text-center italic">
          * {data.conditions}
        </p>
      )}
    </div>
  );
}
