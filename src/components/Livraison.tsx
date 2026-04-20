import ScrollAnimation from "./ScrollAnimation";

/* ── 2D step icons ── */
const STEP_ICONS = [
  /* cart */
  <svg key="cart" className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>,
  /* chat bubble */
  <svg key="chat" className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>,
  /* check circle */
  <svg key="check" className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  /* delivery truck */
  <svg key="truck" className="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m0 0h10m4 0h1a1 1 0 001-1v-3.65a1 1 0 00-.22-.624l-3.48-4.35A1 1 0 0014.52 6H13" />
  </svg>,
];

interface Zone {
  name: string;
  frais: string;
  delai: string;
}

interface TunnelStep {
  step: number;
  title: string;
  description: string;
}

interface LivraisonData {
  zones: Zone[];
  minimum: string;
  paiement: string[];
  horaires: {
    semaine: { jours: string; heures: string };
    weekend: { jours: string; heures: string };
  };
  tunnel: TunnelStep[];
}

export default function Livraison({ data }: { data: LivraisonData }) {

  return (
    <section id="livraison" className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <span className="inline-block text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">Comment commander</span>
            <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Livraison
            </h2>
            <p className="text-white/40 max-w-md mx-auto">
              Commandez via WhatsApp et recevez vos plats chez vous.
            </p>
          </div>
        </ScrollAnimation>

        {/* Tunnel */}
        <ScrollAnimation delay={100}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-20">
            {data.tunnel.map((s, i) => (
              <div key={s.step} className="text-center group">
                <div className="w-18 h-18 sm:w-22 sm:h-22 glass rounded-[5px] flex items-center justify-center mx-auto mb-4 group-hover:bg-white/10 group-hover:scale-110 transition-all duration-500">
                  {STEP_ICONS[i]}
                </div>
                <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">
                  &Eacute;tape {s.step}
                </div>
                <h4 className="font-heading font-bold text-white text-sm sm:text-base mb-1">{s.title}</h4>
                <p className="text-[11px] sm:text-xs text-white/30 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </ScrollAnimation>

        {/* Zones */}
        <ScrollAnimation delay={200}>
          <div className="glass rounded-[5px] overflow-hidden mb-8">
            <div className="px-6 sm:px-8 py-5 border-b border-white/5">
              <h3 className="font-heading text-primary text-lg font-bold">Zones de livraison</h3>
            </div>
            <div className="divide-y divide-white/5">
              {data.zones.map((zone) => (
                <div key={zone.name} className="flex flex-col sm:flex-row sm:items-center justify-between px-6 sm:px-8 py-5 hover:bg-white/3 transition-colors">
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base">{zone.name}</h4>
                    <p className="text-xs sm:text-sm text-white/30">{zone.frais}</p>
                  </div>
                  <span className="text-primary font-bold mt-1 sm:mt-0 text-sm">{zone.delai}</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>

        {/* Info cards */}
        <ScrollAnimation delay={300}>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-[5px] p-6 text-center hover:bg-white/8 transition-all">
              <div className="flex justify-center mb-3">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Minimum</h4>
              <p className="text-primary font-bold text-2xl">{data.minimum}</p>
            </div>
            <div className="glass rounded-[5px] p-6 text-center hover:bg-white/8 transition-all">
              <div className="flex justify-center mb-3">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Paiement</h4>
              <div className="flex flex-wrap justify-center gap-1.5 mt-1">
                {data.paiement.map((p) => (
                  <span key={p} className="text-[10px] font-semibold text-white/50 border border-white/10 px-2 py-0.5 rounded-[5px]">{p}</span>
                ))}
              </div>
            </div>
            <div className="glass rounded-[5px] p-6 text-center hover:bg-white/8 transition-all">
              <div className="flex justify-center mb-3">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Horaires</h4>
              <p className="text-white/60 text-xs leading-relaxed">
                {data.horaires.semaine.jours} : {data.horaires.semaine.heures}
                <br />
                {data.horaires.weekend.jours} : {data.horaires.weekend.heures}
              </p>
            </div>
          </div>
        </ScrollAnimation>

        {/* CTA */}
        <ScrollAnimation delay={400}>
          <div className="text-center mt-12">
            <a
              href="https://wa.me/33744275428"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold px-10 py-5 rounded-[5px] text-lg transition-all hover:scale-105 shadow-2xl shadow-[#25D366]/20"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Commander maintenant
            </a>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
