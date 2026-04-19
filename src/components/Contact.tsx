import ScrollAnimation from "./ScrollAnimation";

export default function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">Nous contacter</span>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Contact
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              Une question, une commande sp&eacute;ciale ou un &eacute;v&eacute;nement &agrave; organiser ?
            </p>
          </div>
        </ScrollAnimation>

        {/* Bento grid */}
        <ScrollAnimation delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {/* Phone — tall card */}
            <div className="col-span-2 sm:col-span-1 sm:row-span-2 glass rounded-[5px] p-6 sm:p-8 flex flex-col justify-between hover:bg-white/8 transition-all group">
              <div className="w-14 h-14 glass rounded-[5px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading font-bold text-white text-lg mb-2">T&eacute;l&eacute;phone</h3>
                <a href="tel:+33744275428" className="text-primary font-semibold text-lg hover:text-primary-light transition-colors">
                  07 44 27 54 28
                </a>
              </div>
            </div>

            {/* WhatsApp — wide card */}
            <div className="col-span-2 sm:col-span-3 glass rounded-[5px] p-6 sm:p-8 hover:bg-white/8 transition-all group bg-gradient-to-br from-[#25D366]/10 to-transparent">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#25D366]/15 rounded-[5px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg mb-1">WhatsApp</h3>
                  <p className="text-white/40 text-sm mb-2">Le moyen le plus rapide de commander</p>
                  <a
                    href="https://wa.me/33744275428"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#25D366] font-semibold text-sm hover:text-[#20BD5A] transition-colors"
                  >
                    Envoyer un message
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Horaires */}
            <div className="glass rounded-[5px] p-6 hover:bg-white/8 transition-all group">
              <div className="w-10 h-10 glass rounded-[5px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-sm mb-2">Horaires</h3>
              <p className="text-white/40 text-xs leading-relaxed">
                Lun-Ven : 11h &ndash; 21h30
                <br />
                Sam-Dim : 11h &ndash; 22h30
              </p>
            </div>

            {/* Services */}
            <div className="glass rounded-[5px] p-6 hover:bg-white/8 transition-all group">
              <div className="w-10 h-10 glass rounded-[5px] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-white text-sm mb-2">Services</h3>
              <p className="text-white/40 text-xs leading-relaxed">
                Sur place &middot; Emporter
                <br />
                Livraison &middot; Traiteur
              </p>
            </div>

            {/* Traiteur — wide */}
            <div className="col-span-2 glass rounded-[5px] p-6 sm:p-8 hover:bg-white/8 transition-all group bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary/10 rounded-[5px] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-lg mb-1">Traiteur &Eacute;v&eacute;nementiel</h3>
                  <p className="text-white/40 text-sm">
                    Mariages, anniversaires, repas d&apos;entreprise... Contactez-nous pour un devis personnalis&eacute;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
