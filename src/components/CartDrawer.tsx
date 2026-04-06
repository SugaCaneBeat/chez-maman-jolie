"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function CartDrawer() {
  const { items, isDrawerOpen, setDrawerOpen, updateQuantity, removeItem, clearCart, getTotal, getCount } = useCart();

  const formatPrice = (price: number) => {
    return price % 1 === 0 ? `${price} €` : `${price.toFixed(2).replace('.', ',')} €`;
  };

  const generateWhatsAppMessage = () => {
    let msg = "🛒 *Commande Chez Maman Jolie*\n\n";
    items.forEach((item) => {
      const subtotal = item.price * item.quantity;
      msg += `• ${item.name} x${item.quantity} — ${formatPrice(subtotal)}\n`;
    });
    msg += `\n💰 *Total : ${formatPrice(getTotal())}*\n`;
    msg += "\n📍 Merci de confirmer l'adresse de livraison.";
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/33744275428?text=${generateWhatsAppMessage()}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-dark-light border-l border-white/5 shadow-2xl transition-transform duration-500 ease-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="font-heading text-xl font-bold text-white">Mon Panier</h2>
            <p className="text-white/40 text-xs mt-0.5">
              {getCount()} {getCount() > 1 ? "articles" : "article"}
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Fermer le panier"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">🛒</div>
              <p className="text-white/40 text-sm">Votre panier est vide</p>
              <p className="text-white/20 text-xs mt-1">Ajoutez des plats depuis la carte</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-4 flex gap-4">
                {item.image && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-semibold truncate">{item.name}</h4>
                  <p className="text-primary text-sm font-bold mt-0.5">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-white font-bold text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto w-7 h-7 rounded-lg hover:bg-accent/20 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="text-white/60 text-sm font-bold self-start">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/60 text-sm">Total</span>
              <span className="text-2xl font-bold text-gradient">{formatPrice(getTotal())}</span>
            </div>

            {/* Two order buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-[#25D366]/20"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>

              <a
                href={`https://wa.me/33744275428?text=${encodeURIComponent(
                  `🛒 *Commande Chez Maman Jolie*\n\n${items.map(i => `• ${i.name} x${i.quantity} — ${formatPrice(i.price * i.quantity)}`).join('\n')}\n\n💰 *Total : ${formatPrice(getTotal())}*\n\n💳 *Paiement par virement / Lydia / PayLib*\n📍 Merci de confirmer l'adresse de livraison.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary text-dark font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Virement / Lydia
              </a>
            </div>

            <button
              onClick={clearCart}
              className="w-full text-white/30 hover:text-accent text-xs text-center py-2 transition-colors"
            >
              Vider le panier
            </button>
          </div>
        )}
      </div>
    </>
  );
}
