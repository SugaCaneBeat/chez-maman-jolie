import Image from "next/image";

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
        <div className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2 mb-10 animate-fade-in">
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
          <a
            href="https://wa.me/33744275428"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark font-bold px-8 py-4 sm:py-5 rounded-2xl text-base sm:text-lg transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Commander
          </a>
          <a
            href="#menu"
            className="group inline-flex items-center justify-center gap-2 glass hover:bg-white/10 text-white font-semibold px-8 py-4 sm:py-5 rounded-2xl text-base sm:text-lg transition-all hover:scale-105"
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
            { name: "Poulet Muamba", desc: "Pâte d'arachide & riz", price: "10 €", img: "https://images.unsplash.com/photo-1591386767153-987783380885?w=400&q=80" },
            { name: "Thiéboudiène", desc: "Riz au poisson sénégalais", price: "13 €", img: "https://images.unsplash.com/photo-1664993101841-036f189719b6?w=400&q=80" },
            { name: "Ngolo Liboké", desc: "Poisson en feuille de bananier", price: "15 €", img: "https://images.unsplash.com/photo-1611507775040-6af3f6a18656?w=400&q=80" },
          ].map((dish, i) => (
            <div
              key={dish.name}
              className={`group glass rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/10 ${i === 1 ? 'sm:-translate-y-4' : ''}`}
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
