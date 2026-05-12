import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuTabs from "@/components/MenuTabs";
import FormulesSection from "@/components/FormulesSection";
import InstagramSection from "@/components/InstagramSection";
import Livraison from "@/components/Livraison";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import InstagramButton from "@/components/InstagramButton";
import MobileTabBar from "@/components/MobileTabBar";
import ScrollAnimation from "@/components/ScrollAnimation";
import JsonLd from "@/components/JsonLd";
import { getMenuData } from "@/lib/menu";

import livraisonData from "@/data/livraison.json";

// Refetch at most every 10 seconds so admin changes are reflected quickly
export const revalidate = 10;

export default async function Home() {
  const categories = await getMenuData();

  /* ── Pick 3 featured items for the Hero ── */
  /* Priority: items with image, from standard categories (plats, entrées…) */
  const allItems = categories
    .filter((c) => c.type === "standard")
    .flatMap((c) => c.items || []);
  const withImages = allItems.filter((i) => i.id && i.image);
  const featured = withImages.slice(0, 3);

  /* ── Section dédiée aux formules (en dehors de la carte) ── */
  const formulesCat = categories.find((c) => c.type === "formules");
  const formulesData = formulesCat?.formulesData;

  /* ── Items pour la section Instagram : on prend les plus appétissants
   * (avec image, hors fallbacks). Priorité aux specialités si dispo. */
  const igItems = (() => {
    const withImg = allItems.filter((i) => i.id && i.image);
    /* Mélange déterministe pour ne pas toujours montrer les mêmes :
     * on prend 9 items répartis dans la liste. */
    if (withImg.length <= 9) return withImg;
    const step = Math.floor(withImg.length / 9);
    return Array.from({ length: 9 }, (_, k) => withImg[k * step]).filter(Boolean);
  })();

  return (
    <CartProvider>
      <JsonLd />
      <Header />
      <main className="bg-dark">
        <Hero featured={featured} />

        {/* Section dédiée aux Formules — séparée de la carte */}
        {formulesData && formulesData.formules.length > 0 && (
          <section id="formules" className="py-20 sm:py-32 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/4 rounded-full blur-3xl" />
            <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
              <ScrollAnimation>
                <div className="text-center mb-14">
                  <span className="inline-block text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">
                    Offre du midi
                  </span>
                  <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                    {formulesCat?.name ?? "Nos Formules"}
                  </h2>
                  <p className="text-white/60 max-w-lg mx-auto">
                    Des combinaisons compl&egrave;tes &agrave; petits prix &mdash; entr&eacute;e, plat, accompagnement, dessert et boisson.
                  </p>
                </div>
              </ScrollAnimation>
              <FormulesSection data={formulesData} />
            </div>
          </section>
        )}

        {/* Menu */}
        <section id="menu" className="py-20 sm:py-32 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />

          <div className="max-w-5xl mx-auto px-5 sm:px-8 relative z-10">
            <ScrollAnimation>
              <div className="text-center mb-14">
                <span className="inline-block text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">
                  La carte
                </span>
                <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
                  Notre Carte
                </h2>
                <p className="text-white/60 max-w-lg mx-auto">
                  Des plats authentiques pr&eacute;par&eacute;s avec des ingr&eacute;dients frais,
                  dans le respect des traditions culinaires africaines.
                </p>
              </div>
            </ScrollAnimation>
            <MenuTabs categories={categories} />
          </div>
        </section>

        {/* Showcase Instagram — produits + CTA follow */}
        <InstagramSection items={igItems} />

        <Livraison data={livraisonData} />
        <Contact />
      </main>
      <Footer />
      {/* FABs — WhatsApp à droite, Instagram à gauche.
       *  Desktop uniquement : la MobileTabBar prend déjà ces actions sur mobile. */}
      <div className="hidden md:block">
        <WhatsAppButton />
        <InstagramButton />
      </div>
      <MobileTabBar />
      <CartDrawer />
      <Toast />
    </CartProvider>
  );
}
