import Image from "next/image";
import CommanderButton from "./CommanderButton";
import AddToCartButton from "./AddToCartButton";
import type { MenuItem } from "@/lib/menu";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/contact";

type FeaturedItem = MenuItem & { desc?: string };

/* ── Fallback demo items (used if DB is empty) ── */
const FALLBACK: FeaturedItem[] = [
  {
    id: "fallback-1",
    name: "Poulet Muamba",
    price: 10,
    image: "https://images.unsplash.com/photo-1658713064971-5fcef7dfe417?w=400&q=80",
    desc: "Pâte d'arachide & riz",
  },
  {
    id: "fallback-2",
    name: "Thiéboudiène",
    price: 13,
    image: "https://images.unsplash.com/photo-1665332195309-9d75071138f0?w=400&q=80",
    desc: "Riz au poisson sénégalais",
  },
  {
    id: "fallback-3",
    name: "Ngolo Liboké",
    price: 15,
    image: "https://images.unsplash.com/photo-1652065085956-d0138801fee9?w=400&q=80",
    desc: "Poisson en feuille de bananier",
  },
];

export default function Hero({ featured }: { featured?: MenuItem[] }) {
  /* Use DB items if at least 3 are available with images, else fallback */
  const items: FeaturedItem[] =
    featured && featured.length >= 3
      ? featured.slice(0, 3)
      : FALLBACK;

  const formatPrice = (p: number) =>
    p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;

  return (
    <section id="accueil" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=85"
        alt="Cuisine africaine"
        fill
        className="object-cover"
        priority
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/50 to-dark" />
      <div className="absolute inset-0 bg-gradient-to-r from-dark/40 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 text-center pt-24 pb-16">
        {/* Badges : livraison + Instagram */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2.5 glass rounded-[5px] px-5 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-white/80 text-xs sm:text-sm font-medium tracking-wider uppercase">
              Livraison 6j/7 &middot; Traiteur
            </span>
          </div>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[5px] px-4 py-2 text-white text-xs sm:text-sm font-semibold tracking-wide transition-transform hover:scale-105"
            style={{
              background:
                "linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
            }}
            aria-label={`Suivre ${INSTAGRAM_HANDLE} sur Instagram`}
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {INSTAGRAM_HANDLE}
          </a>
        </div>

        {/* Main title */}
        <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-6 leading-[0.9] tracking-tight animate-fade-in-up">
          <span className="text-white">Cuisine</span>
          <br />
          <span className="text-gradient">Africaine</span>
        </h1>

        <p className="text-white/50 text-base sm:text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed font-light animate-fade-in-up animation-delay-200">
          Saveurs du Congo, du S&eacute;n&eacute;gal et d&apos;Afrique de l&apos;Ouest.
          Pr&eacute;par&eacute;es avec amour, servies avec g&eacute;n&eacute;rosit&eacute;.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up animation-delay-300">
          <CommanderButton className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark font-bold px-8 py-4 sm:py-5 rounded-[5px] text-base sm:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30">
            <svg aria-hidden="true" className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Commander
          </CommanderButton>
          <a
            href="#menu"
            className="group inline-flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-semibold px-8 py-4 sm:py-5 rounded-[5px] text-base sm:text-lg transition-all hover:scale-105"
          >
            D&eacute;couvrir la carte
            <svg aria-hidden="true" className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Featured dishes — commandables */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto animate-fade-in-up animation-delay-500">
          {items.map((dish, i) => (
            <div
              key={dish.id || dish.name}
              className={`group glass rounded-[5px] overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 ${i === 1 ? 'sm:-translate-y-4' : ''}`}
            >
              {/* Image + Add-to-cart overlay */}
              <div className="relative h-44 sm:h-48 img-zoom">
                {dish.image && (
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized={dish.image.startsWith("http")}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                <span className="absolute bottom-3 right-3 text-primary font-bold text-xl drop-shadow-lg">
                  {formatPrice(dish.price)}
                </span>

                {/* Add-to-cart button — top-right of the card */}
                <div className="absolute top-3 right-3 z-10">
                  <AddToCartButton
                    item={{
                      id: dish.id || `hero-${i}`,
                      name: dish.name,
                      price: dish.price,
                      image: dish.image,
                    }}
                  />
                </div>
              </div>

              {/* Body */}
              <div className="p-5 text-left">
                <h3 className="font-heading text-white font-bold text-lg mb-1 truncate">{dish.name}</h3>
                {(dish.desc || dish.accompagnement) && (
                  <p className="text-white/60 text-sm truncate">
                    {dish.desc || dish.accompagnement}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent" />
    </section>
  );
}
