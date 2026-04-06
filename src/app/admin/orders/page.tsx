import { getOrders } from "@/lib/actions/admin-orders";
import OrdersTable from "./OrdersTable";

export default async function AdminOrdersPage() {
  const result = await getOrders();
  const orders = result.data || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Commandes</h1>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
