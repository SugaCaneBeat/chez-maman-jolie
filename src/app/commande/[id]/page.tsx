import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicOrder } from "@/lib/actions/orders";
import OrderStatusView from "./OrderStatusView";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  return <OrderStatusView initialOrder={order} />;
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
