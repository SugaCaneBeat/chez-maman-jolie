import { getOrders } from "@/lib/actions/admin-orders";
import OrdersTable from "./OrdersTable";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const result = await getOrders();
  const orders = result.data || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Commandes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Toutes les commandes en cours et historique récent
        </p>
      </div>
      <OrdersTable initialOrders={orders} initialFilter={sp.status ?? "all"} />
    </div>
  );
}
