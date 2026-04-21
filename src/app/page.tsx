import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Toast from "@/components/Toast";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import MenuTabs from "@/components/MenuTabs";
import Livraison from "@/components/Livraison";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileTabBar from "@/components/MobileTabBar";
import ScrollAnimation from "@/components/ScrollAnimation";
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

  return (
    <CartProvider>
      <Header />
      <main className="bg-dark">
        <Hero featured={featured} />

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
                <p className="text-white/40 max-w-lg mx-auto">
                  Des plats authentiques pr&eacute;par&eacute;s avec des ingr&eacute;dients frais,
                  dans le respect des traditions culinaires africaines.
                </p>
              </div>
            </ScrollAnimation>
            <MenuTabs categories={categories} />
          </div>
        </section>

        <Livraison data={livraisonData} />
        <Contact />
      </main>
      <Footer />
      {/* WhatsApp FAB — desktop uniquement */}
      <div className="hidden md:block">
        <WhatsAppButton />
      </div>
      <MobileTabBar />
      <CartDrawer />
      <Toast />
    </CartProvider>
  );
}
