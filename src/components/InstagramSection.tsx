/**
 * Section Instagram — mise en valeur du compte + showcase produits.
 *
 *  • Header gradient Instagram avec le handle
 *  • Grille 1:1 (style feed) avec les plats vedettes + photos
 *  • Hover overlay style IG (like / comment)
 *  • CTA principal "Suivre @chezmamanjolie"
 *  • Microcopy : nouvelles photos, coulisses, offres exclusives
 */

import Image from "next/image";
import ScrollAnimation from "./ScrollAnimation";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/contact";
import type { MenuItem } from "@/lib/menu";

interface Props {
  items: MenuItem[];
}

export default function InstagramSection({ items }: Props) {
  /* On veut 6 tuiles minimum, 9 idéalement. */
  const tiles = items.slice(0, 9);
  if (tiles.length === 0) return null;

  /* "Aléatoires" stables : pseudo-likes basés sur l'index pour donner vie sans mentir */
  const fakeLikes = (i: number) => 40 + ((i * 17) % 80); /* 40-119, déterministe */
  const fakeComments = (i: number) => 3 + ((i * 5) % 12);

  return (
    <section
      id="instagram"
      className="py-20 sm:py-28 relative overflow-hidden"
      aria-labelledby="instagram-heading"
    >
      {/* Halos décoratifs aux couleurs Instagram */}
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-pink-500/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-3xl" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-12">
            {/* Pill avec icône IG en gradient */}
            <div className="inline-flex items-center gap-2.5 glass rounded-full pl-2 pr-4 py-1.5 mb-6">
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
                }}
                aria-hidden="true"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </span>
              <span className="text-white/85 text-xs sm:text-sm font-semibold tracking-wide">
                Sur Instagram
              </span>
            </div>

            <h2
              id="instagram-heading"
              className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4"
            >
              Le feed de la maison
            </h2>
            <p className="text-white/65 max-w-xl mx-auto leading-relaxed">
              Nouveaux plats, coulisses de la cuisine, offres exclusives.
              Toute la vie de <strong className="font-semibold text-white">{INSTAGRAM_HANDLE}</strong> en images.
            </p>
          </div>
        </ScrollAnimation>

        {/* Grille style feed Instagram */}
        <ScrollAnimation delay={100}>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-10 max-w-3xl mx-auto">
            {tiles.map((item, i) => (
              <a
                key={item.id ?? `ig-${i}`}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Voir ${item.name} sur Instagram`}
                className="group relative aspect-square overflow-hidden rounded-[3px] bg-white/5"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 33vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized={item.image.startsWith("http")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white/30 text-xs">
                    {item.name}
                  </div>
                )}

                {/* Overlay au hover : likes + comments (style IG) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center gap-5 text-white font-bold text-sm sm:text-base">
                    <span className="flex items-center gap-1.5">
                      <svg aria-hidden="true" className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {fakeLikes(i)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg aria-hidden="true" className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                      </svg>
                      {fakeComments(i)}
                    </span>
                  </div>
                </div>

                {/* Nom du plat (subtil, en bas) */}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] sm:text-xs font-medium truncate">
                    {item.name}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </ScrollAnimation>

        {/* CTA principal */}
        <ScrollAnimation delay={200}>
          <div className="text-center">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-white font-bold px-8 py-4 rounded-[5px] text-base transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background:
                  "linear-gradient(45deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)",
              }}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Suivre {INSTAGRAM_HANDLE}
              <svg aria-hidden="true" className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <p className="text-white/55 text-xs sm:text-sm mt-5 max-w-md mx-auto">
              📸 Nouvelles photos chaque semaine
              <span className="mx-2 text-white/30">·</span>
              👨‍🍳 Coulisses cuisine
              <span className="mx-2 text-white/30">·</span>
              🎁 Offres exclusives
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
