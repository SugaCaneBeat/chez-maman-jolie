import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicOrder, buildOrderWhatsAppNotification } from "@/lib/actions/orders";
import { verifyAndSyncSumUpPayment } from "@/lib/actions/sumup-checkout";
import OrderStatusView from "./OrderStatusView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderTrackingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ source?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  /* Retour SumUp : vérifie le checkout et passe la commande en "paid" si besoin */
  const justPaid = sp.source === "sumup";
  if (justPaid) {
    await verifyAndSyncSumUpPayment(id);
  }

  const order = await getPublicOrder(id);

  if (!order) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="font-heading text-3xl font-bold mb-3">Commande introuvable</h1>
        <p className="text-white/50 text-sm mb-6">Le lien est peut-être expiré ou incorrect.</p>
        <Link href="/" className="bg-primary text-dark font-bold px-6 py-3 rounded-[5px]">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  /* Pré-calcule l'URL de notification WhatsApp (utilisée en auto-pop côté client) */
  const whatsappNotifyUrl = buildOrderWhatsAppNotification(order);

  return (
    <OrderStatusView
      initialOrder={order}
      justPaid={justPaid}
      whatsappNotifyUrl={whatsappNotifyUrl}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getPublicOrder(id);
  if (!order) return { title: "Commande · Chez Maman Jolie" };
  return { title: `Commande #${order.order_number} · Chez Maman Jolie` };
}

// notFound used conditionally above to satisfy the type-check
void notFound;
