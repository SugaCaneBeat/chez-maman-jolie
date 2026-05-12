import Link from "next/link";
import { getOrderCheckoutId } from "@/lib/actions/sumup-checkout";
import PaymentForm from "./PaymentForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const { checkoutId, status, amount, orderNumber } = await getOrderCheckoutId(orderId);

  /* Pas de commande ou pas de checkout id → erreur */
  if (!checkoutId || !orderNumber) {
    return (
      <main className="min-h-screen bg-dark text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-3xl font-bold mb-3">Commande introuvable</h1>
        <p className="text-white/50 text-sm mb-6">
          Le lien est invalide ou la commande n&apos;a pas de paiement en cours.
        </p>
        <Link href="/" className="bg-primary text-dark font-bold px-6 py-3 rounded-[5px]">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  /* Déjà payée → redirige direct vers le suivi */
  if (status === "paid" || status === "confirmed" || status === "preparing") {
    return (
      <main className="min-h-screen bg-dark text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">Commande déjà payée</h1>
        <p className="text-white/50 text-sm mb-6">La commande #{orderNumber} est déjà confirmée.</p>
        <Link
          href={`/commande/${orderId}`}
          className="bg-primary text-dark font-bold px-6 py-3 rounded-[5px]"
        >
          Voir le suivi
        </Link>
      </main>
    );
  }

  return (
    <PaymentForm
      orderId={orderId}
      orderNumber={orderNumber}
      checkoutId={checkoutId}
      amount={amount}
    />
  );
}

export const metadata = {
  title: "Paiement · Chez Maman Jolie",
};
