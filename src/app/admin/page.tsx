import { getOrderStats, getOrders } from "@/lib/actions/admin-orders";
import { getCurrentUser } from "@/lib/supabase/user";
import { ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS } from "@/lib/roles";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  paid: { label: "Payée", color: "bg-emerald-100 text-emerald-800" },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  preparing: { label: "En préparation", color: "bg-orange-100 text-orange-800" },
  ready: { label: "Prête", color: "bg-green-100 text-green-800" },
  delivering: { label: "En livraison", color: "bg-purple-100 text-purple-800" },
  delivered: { label: "Livrée", color: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800" },
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  let stats = { todayOrderCount: 0, todayRevenue: 0, pendingOrders: 0, totalMenuItems: 0, unavailableItems: 0 };
  let recentOrders: { id: string; order_number: number; created_at: string; total: number; status: string; customer_name: string | null; payment_method: string | null }[] = [];

  try {
    stats = await getOrderStats();
    const result = await getOrders({ limit: 5 });
    recentOrders = (result.data || []) as typeof recentOrders;
  } catch {}

  const formatPrice = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {user && (
          <div className="text-right">
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-[5px] ${ROLE_COLORS[user.role].bg} ${ROLE_COLORS[user.role].text}`}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        )}
      </div>

      {/* Bandeau d'accès refusé */}
      {sp.denied === "1" && (
        <div className="bg-red-50 border border-red-200 rounded-[5px] p-3 mb-6 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <div>
            <p className="text-red-700 font-semibold text-sm">Accès refusé</p>
            <p className="text-red-600 text-xs mt-0.5">
              {user
                ? `Votre rôle (${ROLE_LABELS[user.role]}) ne donne pas accès à cette section. ${ROLE_DESCRIPTIONS[user.role]}.`
                : "Vous n'avez pas les permissions nécessaires."}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Commandes du jour</p>
          <p className="text-3xl font-bold text-gray-900">{stats.todayOrderCount}</p>
        </div>
        <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Chiffre du jour</p>
          <p className="text-3xl font-bold text-[#C9922A]">{formatPrice(stats.todayRevenue)}</p>
        </div>
        <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">En attente</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-[5px] p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Plats au menu</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMenuItems}</p>
          {stats.unavailableItems > 0 && (
            <p className="text-xs text-red-500 mt-1">{stats.unavailableItems} indisponible(s)</p>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-[5px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Commandes récentes</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune commande pour le moment</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <span className="font-semibold text-gray-900">#{order.order_number}</span>
                  <span className="text-gray-400 text-sm ml-3">{order.customer_name || "Client"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-[5px] text-[10px] font-bold uppercase ${statusLabels[order.status]?.color || "bg-gray-100"}`}>
                    {statusLabels[order.status]?.label || order.status}
                  </span>
                  <span className="font-bold text-[#C9922A]">{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
