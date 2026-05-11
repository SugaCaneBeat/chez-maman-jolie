import Link from "next/link";
import { getOrderStats, getOrders } from "@/lib/actions/admin-orders";
import { getCurrentUser } from "@/lib/supabase/user";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/roles";

const fmtPrice = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);

const STATUS_META: Record<string, { label: string; tone: string; emoji: string }> = {
  pending:    { label: "En attente",     tone: "bg-yellow-100 text-yellow-800",   emoji: "🕐" },
  paid:       { label: "Payée",          tone: "bg-emerald-100 text-emerald-800", emoji: "💳" },
  confirmed:  { label: "Confirmée",      tone: "bg-blue-100 text-blue-800",       emoji: "✓" },
  preparing:  { label: "En préparation", tone: "bg-orange-100 text-orange-800",   emoji: "🍲" },
  ready:      { label: "Prête",          tone: "bg-green-100 text-green-800",     emoji: "📦" },
  delivering: { label: "En livraison",   tone: "bg-purple-100 text-purple-800",   emoji: "🛵" },
};

interface RecentOrder {
  id: string;
  order_number: number;
  created_at: string;
  total: number;
  status: string;
  customer_name: string | null;
  payment_method: string | null;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  let stats = {
    todayOrderCount: 0, todayRevenue: 0, todayAOV: 0,
    yesterdayRevenue: 0, yesterdayCount: 0,
    revenueDelta: 0, countDelta: 0,
    weekRevenue: 0, pendingOrders: 0,
    statusBreakdown: {} as Record<string, number>,
    dailyRevenue: [] as { day: string; date: string; revenue: number; count: number }[],
    paymentBreakdown: [] as { method: string; count: number; revenue: number }[],
    totalMenuItems: 0, unavailableItems: 0,
  };
  let recentOrders: RecentOrder[] = [];

  try {
    stats = await getOrderStats();
    const result = await getOrders({ limit: 5 });
    recentOrders = (result.data || []) as RecentOrder[];
  } catch {}

  const maxRevenue = Math.max(1, ...stats.dailyRevenue.map((d) => d.revenue));
  const activeKanban = ["paid", "confirmed", "preparing", "ready", "delivering"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bonjour {user?.email.split("@")[0] ?? "👋"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Voici l&apos;activité du jour pour <span className="font-semibold text-gray-700">Chez Maman Jolie</span>.
          </p>
        </div>
      </div>

      {/* Accès refusé */}
      {sp.denied === "1" && (
        <div className="bg-red-50 border border-red-200 rounded-[5px] p-4 flex items-start gap-3">
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

      {/* ═══ KPIs ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard
          label="Commandes aujourd'hui"
          value={String(stats.todayOrderCount)}
          delta={stats.countDelta}
          subtitle={`vs ${stats.yesterdayCount} hier`}
        />
        <KpiCard
          label="Chiffre d'affaires"
          value={fmtPrice(stats.todayRevenue)}
          delta={stats.revenueDelta}
          subtitle={`vs ${fmtPrice(stats.yesterdayRevenue)} hier`}
          accent
        />
        <KpiCard
          label="Panier moyen"
          value={fmtPrice(Math.round(stats.todayAOV * 100) / 100)}
          subtitle="par commande"
        />
        <KpiCard
          label="CA 7 derniers jours"
          value={fmtPrice(stats.weekRevenue)}
          subtitle="cumul semaine"
        />
      </div>

      {/* ═══ 7-day revenue chart + payment methods ═══ */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-[5px] border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Chiffre d&apos;affaires — 7 derniers jours</h2>
              <p className="text-xs text-gray-400">Total : {fmtPrice(stats.weekRevenue)}</p>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 h-44">
            {stats.dailyRevenue.map((d, i) => {
              const height = (d.revenue / maxRevenue) * 100;
              const isToday = i === stats.dailyRevenue.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {d.revenue > 0 ? Math.round(d.revenue) + "€" : ""}
                  </span>
                  <div className="w-full bg-gray-50 rounded-[5px] flex-1 flex items-end relative overflow-hidden">
                    <div
                      className={`w-full rounded-[5px] transition-all ${
                        isToday ? "bg-gradient-to-t from-[#C9922A] to-[#E0AD4A]" : "bg-gray-200"
                      }`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-[#C9922A]" : "text-gray-400"}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment methods today */}
        <div className="bg-white rounded-[5px] border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm mb-1">Paiements du jour</h2>
          <p className="text-xs text-gray-400 mb-4">Répartition par méthode</p>
          {stats.paymentBreakdown.every((p) => p.count === 0) ? (
            <p className="text-gray-300 text-xs text-center py-8">Aucune commande aujourd&apos;hui</p>
          ) : (
            <div className="space-y-3">
              {stats.paymentBreakdown.filter((p) => p.count > 0).map((p) => {
                const total = stats.paymentBreakdown.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? (p.count / total) * 100 : 0;
                const colors: Record<string, string> = {
                  carte: "bg-indigo-500", lydia: "bg-purple-500",
                  paylib: "bg-sky-500", wero: "bg-teal-500",
                };
                const labels: Record<string, string> = {
                  carte: "Carte", lydia: "Lydia", paylib: "PayLib", wero: "Wero",
                };
                return (
                  <div key={p.method}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-semibold">{labels[p.method]}</span>
                      <span className="text-gray-500">{p.count} · {fmtPrice(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-[5px] overflow-hidden">
                      <div className={`h-full ${colors[p.method]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Kanban Commandes actives ═══ */}
      <div className="bg-white rounded-[5px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">Commandes en cours</h2>
            <p className="text-xs text-gray-400">
              {activeKanban.reduce((s, k) => s + (stats.statusBreakdown[k] || 0), 0)} commande(s) active(s) aujourd&apos;hui
            </p>
          </div>
          <Link href="/admin/orders" className="text-xs text-[#C9922A] hover:underline font-semibold">
            Voir toutes →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-gray-100">
          {activeKanban.map((status) => {
            const m = STATUS_META[status];
            const count = stats.statusBreakdown[status] || 0;
            return (
              <Link
                key={status}
                href={`/admin/orders?status=${status}`}
                className="bg-white px-4 py-4 hover:bg-gray-50 transition-colors text-center"
              >
                <div className="text-2xl mb-1">{m.emoji}</div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 inline-block px-2 py-0.5 rounded-[5px] ${m.tone}`}>
                  {m.label}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══ Recent orders ═══ */}
      <div className="bg-white rounded-[5px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm">Dernières commandes</h2>
          <Link href="/admin/orders" className="text-xs text-[#C9922A] hover:underline font-semibold">
            Toutes →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-300 text-sm">Aucune commande pour le moment</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map((order) => {
              const m = STATUS_META[order.status] ?? { label: order.status, tone: "bg-gray-100 text-gray-600", emoji: "•" };
              const time = new Date(order.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">#{order.order_number}</span>
                      <span className="text-gray-300 text-xs">·</span>
                      <span className="text-gray-500 text-sm truncate">{order.customer_name || "Client"}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{time}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase ${m.tone}`}>
                      {m.label}
                    </span>
                    <span className="font-bold text-[#C9922A] text-sm">{fmtPrice(Number(order.total))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ═══ Footer: menu health ═══ */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="bg-white rounded-[5px] border border-gray-100 p-4">
          <p className="text-gray-400 uppercase tracking-wider mb-1">Plats au menu</p>
          <p className="text-xl font-bold text-gray-900">{stats.totalMenuItems}</p>
        </div>
        <div className="bg-white rounded-[5px] border border-gray-100 p-4">
          <p className="text-gray-400 uppercase tracking-wider mb-1">Plats indisponibles</p>
          <p className={`text-xl font-bold ${stats.unavailableItems > 0 ? "text-red-500" : "text-gray-900"}`}>
            {stats.unavailableItems}
          </p>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  subtitle,
  delta,
  accent,
}: {
  label: string;
  value: string;
  subtitle?: string;
  delta?: number;
  accent?: boolean;
}) {
  const deltaSign = delta != null && delta !== 0 ? (delta > 0 ? "+" : "") : "";
  const deltaColor = delta == null
    ? "text-gray-400"
    : delta > 0
      ? "text-emerald-600"
      : delta < 0
        ? "text-red-500"
        : "text-gray-400";

  return (
    <div className={`bg-white rounded-[5px] p-4 lg:p-5 shadow-sm border ${accent ? "border-[#C9922A]/30" : "border-gray-100"}`}>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 font-bold">{label}</p>
      <p className={`text-2xl lg:text-3xl font-bold tracking-tight ${accent ? "text-[#C9922A]" : "text-gray-900"}`}>
        {value}
      </p>
      {(delta != null || subtitle) && (
        <div className="flex items-center gap-2 mt-2">
          {delta != null && (
            <span className={`text-xs font-bold ${deltaColor}`}>
              {deltaSign}{Math.round(delta)}%
            </span>
          )}
          {subtitle && <span className="text-[10px] text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
