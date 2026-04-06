"use client";

import AddToCartButton from "./AddToCartButton";

interface Formule {
  name: string;
  price: number;
}

interface FormulesData {
  formules: Formule[];
  conditions: string;
}

export default function FormulesSection({ data }: { data: FormulesData }) {
  return (
    <div className="mb-8">
      <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">
        Formules Midi
      </h3>
      <div className="grid sm:grid-cols-3 gap-5">
        {data.formules.map((f, i) => (
          <div
            key={f.name}
            className={`glass rounded-3xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 ${i === 1 ? 'sm:-translate-y-3 ring-2 ring-primary/30' : ''}`}
          >
            {i === 1 && (
              <span className="inline-block bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                Populaire
              </span>
            )}
            <div className="text-4xl sm:text-5xl font-bold text-gradient mb-3">{f.price} €</div>
            <p className="font-medium text-white/80 text-sm leading-relaxed">{f.name}</p>
            <AddToCartButton
              item={{ id: f.name, name: f.name, price: f.price }}
              className="mx-auto mt-4"
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-white/30 mt-6 text-center italic">* {data.conditions}</p>
    </div>
  );
}
