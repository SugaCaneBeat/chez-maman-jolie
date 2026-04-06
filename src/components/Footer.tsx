export default function Footer() {
  return (
    <footer className="relative bg-dark border-t border-white/5">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-gradient text-2xl font-bold mb-3">
              Chez Maman Jolie
            </h3>
            <p className="text-white/30 text-sm leading-relaxed">
              Cuisine Africaine Authentique
              <br />
              Congo &middot; S&eacute;n&eacute;gal &middot; Afrique de l&apos;Ouest
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Navigation</h4>
            <div className="space-y-2">
              {["Accueil", "Notre Carte", "Livraison", "Contact"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/\s/g, '')}`} className="block text-white/40 hover:text-primary transition-colors text-sm">
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Contact</h4>
            <div className="space-y-2">
              <a href="tel:+33744275428" className="block text-white/40 hover:text-primary transition-colors text-sm">
                07 44 27 54 28
              </a>
              <a href="https://wa.me/33744275428" target="_blank" rel="noopener noreferrer" className="block text-white/40 hover:text-[#25D366] transition-colors text-sm">
                WhatsApp
              </a>
              <p className="text-white/30 text-sm">
                Lun-Ven : 11h &ndash; 21h30
                <br />
                Sam-Dim : 11h &ndash; 22h30
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            &copy; {new Date().getFullYear()} Chez Maman Jolie. Tous droits r&eacute;serv&eacute;s.
          </p>
          <p className="text-white/10 text-xs">
            Fait avec passion
          </p>
        </div>
      </div>
    </footer>
  );
}
