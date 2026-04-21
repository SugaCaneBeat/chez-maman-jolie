import Image from "next/image";
import CommanderButton from "./CommanderButton";

export default function Hero() {
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
        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 glass rounded-[5px] px-5 py-2 mb-10 animate-fade-in">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="text-white/80 text-xs sm:text-sm font-medium tracking-wider uppercase">
            Livraison 7j/7 &middot; Traiteur
          </span>
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
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            Commander
          </CommanderButton>
          <a
            href="#menu"
            className="group inline-flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-semibold px-8 py-4 sm:py-5 rounded-[5px] text-base sm:text-lg transition-all hover:scale-105"
          >
            D&eacute;couvrir la carte
            <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>

        {/* Featured dishes with real images */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 max-w-4xl mx-auto animate-fade-in-up animation-delay-500">
          {[
            { name: "Poulet Muamba", desc: "Pâte d'arachide & riz", price: "10 €", img: "https://images.unsplash.com/photo-1658713064971-5fcef7dfe417?w=400&q=80" },
            { name: "Thiéboudiène", desc: "Riz au poisson sénégalais", price: "13 €", img: "https://images.unsplash.com/photo-1665332195309-9d75071138f0?w=400&q=80" },
            { name: "Ngolo Liboké", desc: "Poisson en feuille de bananier", price: "15 €", img: "https://images.unsplash.com/photo-1652065085956-d0138801fee9?w=400&q=80" },
          ].map((dish, i) => (
            <div
              key={dish.name}
              className={`group glass rounded-[5px] overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 ${i === 1 ? 'sm:-translate-y-4' : ''}`}
            >
              <div className="relative h-44 sm:h-48 img-zoom">
                <Image src={dish.img} alt={dish.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                <span className="absolute bottom-3 right-3 text-primary font-bold text-xl">{dish.price}</span>
              </div>
              <div className="p-5">
                <h3 className="font-heading text-white font-bold text-lg mb-1">{dish.name}</h3>
                <p className="text-white/40 text-sm">{dish.desc}</p>
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
