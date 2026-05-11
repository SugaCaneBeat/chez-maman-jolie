"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  updateOrderStatus,
  getActiveOrders,
  bulkDeleteOrders,
  bulkUpdateOrdersStatus,
} from "@/lib/actions/admin-orders";
import { useToast } from "../components/Toast";

const STATUS_META: Record<string, { label: string; tone: string; emoji: string }> = {
  pending:    { label: "En attente",     tone: "bg-yellow-100 text-yellow-800",   emoji: "🕐" },
  paid:       { label: "Payée",          tone: "bg-emerald-100 text-emerald-800", emoji: "💳" },
  confirmed:  { label: "Confirmée",      tone: "bg-blue-100 text-blue-800",       emoji: "✓" },
  preparing:  { label: "En préparation", tone: "bg-orange-100 text-orange-800",   emoji: "🍲" },
  ready:      { label: "Prête",          tone: "bg-green-100 text-green-800",     emoji: "📦" },
  delivering: { label: "En livraison",   tone: "bg-purple-100 text-purple-800",   emoji: "🛵" },
  delivered:  { label: "Livrée",         tone: "bg-gray-100 text-gray-600",       emoji: "✓" },
  cancelled:  { label: "Annulée",        tone: "bg-red-100 text-red-800",         emoji: "✗" },
};

const FILTER_TABS = [
  { value: "all",        label: "Toutes" },
  { value: "active",     label: "Actives" },
  { value: "pending",    label: "En attente" },
  { value: "paid",       label: "Payées" },
  { value: "preparing",  label: "Préparation" },
  { value: "delivering", label: "En livraison" },
  { value: "delivered",  label: "Livrées" },
];

const ACTIVE_STATUSES = ["pending", "paid", "confirmed", "preparing", "ready", "delivering"];

/* Suggestion du prochain statut logique */
const NEXT_STATUS: Record<string, { next: string; label: string; tone: string }> = {
  pending:    { next: "confirmed",  label: "→ Confirmer",      tone: "bg-blue-500 hover:bg-blue-600 text-white" },
  paid:       { next: "preparing",  label: "→ Préparation",    tone: "bg-orange-500 hover:bg-orange-600 text-white" },
  confirmed:  { next: "preparing",  label: "→ Préparation",    tone: "bg-orange-500 hover:bg-orange-600 text-white" },
  preparing:  { next: "ready",      label: "→ Prête",          tone: "bg-green-500 hover:bg-green-600 text-white" },
  ready:      { next: "delivering", label: "→ En livraison",   tone: "bg-purple-500 hover:bg-purple-600 text-white" },
  delivering: { next: "delivered",  label: "→ Livrée",         tone: "bg-emerald-500 hover:bg-emerald-600 text-white" },
};

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: number;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  status: string;
  total: number;
  tip?: number;
  payment_method: string | null;
  created_at: string;
  estimated_delivery_at?: string | null;
  order_items: OrderItem[];
}

const fmtPrice = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);
const fmtTime = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

const fmtPhone = (raw: string | null) => {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return raw;
  const country = digits.length > 10 ? digits.slice(0, 2) : "";
  const local = digits.slice(country ? 2 : 0);
  const first = local[0];
  const rest = local.slice(1).match(/.{1,2}/g)?.join(" ") ?? "";
  return country ? `+${country} ${first} ${rest}`.trim() : `${first} ${rest}`.trim();
};

export default function OrdersTable({
  initialOrders,
  initialFilter,
}: {
  initialOrders: Order[];
  initialFilter?: string;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState(initialFilter ?? "all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const toast = useToast();
  const lastCountRef = useRef(initialOrders.length);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Live polling (toutes les 15s) avec son sur nouvelle commande ── */
  useEffect(() => {
    const poll = async () => {
      const res = await getActiveOrders();
      if (res.success) {
        const next = res.data as Order[];
        /* Détection nouvelle commande */
        const newest = next.length;
        if (newest > lastCountRef.current && lastCountRef.current > 0) {
          const diff = newest - lastCountRef.current;
          toast.success(
            diff > 1 ? `${diff} nouvelles commandes` : "Nouvelle commande",
            "Vérifiez la liste"
          );
          /* Petit beep */
          audioRef.current?.play().catch(() => {});
        }
        lastCountRef.current = newest;
        setOrders(next);
      }
    };
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, [toast]);

  /* ── Filtrage ── */
  const filtered = useMemo(() => {
    let res = orders;
    if (filter === "active") {
      res = res.filter((o) => ACTIVE_STATUSES.includes(o.status));
    } else if (filter !== "all") {
      res = res.filter((o) => o.status === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      res = res.filter((o) =>
        String(o.order_number).includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q) ||
        (o.customer_phone ?? "").replace(/\D/g, "").includes(q.replace(/\D/g, "")) ||
        (o.customer_address ?? "").toLowerCase().includes(q)
      );
    }
    return res;
  }, [orders, filter, search]);

  const handleStatusChange = async (orderId: string, newStatus: string, askEta = true) => {
    let etaMinutes: number | undefined;
    if (newStatus === "delivering" && askEta) {
      const raw = window.prompt("Délai estimé de livraison (en minutes) ?", "20");
      if (raw === null) return;
      const n = parseInt(raw, 10);
      if (!Number.isFinite(n) || n <= 0) return;
      etaMinutes = n;
    }
    /* optimistic */
    setOrders((prev) => prev.map((o) => o.id === orderId ? {
      ...o,
      status: newStatus,
      estimated_delivery_at: etaMinutes
        ? new Date(Date.now() + etaMinutes * 60000).toISOString()
        : (newStatus === "delivered" || newStatus === "cancelled" ? null : o.estimated_delivery_at),
    } : o));
    if (detail?.id === orderId) {
      setDetail((d) => d ? { ...d, status: newStatus } : d);
    }
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus, etaMinutes);
      if (res.success) {
        toast.success(`Statut mis à jour`, STATUS_META[newStatus]?.label ?? newStatus);
      } else {
        toast.error("Erreur", res.error ?? "Échec de la mise à jour");
      }
    });
  };

  const handleCancel = (orderId: string, orderNumber: number) => {
    if (!confirm(`Annuler la commande #${orderNumber} ?`)) return;
    handleStatusChange(orderId, "cancelled", false);
  };

  /* ── Bulk selection ── */
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };
  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    const n = ids.length;
    if (!confirm(`Supprimer définitivement ${n} commande${n > 1 ? "s" : ""} ?\n\nLes articles associés seront aussi supprimés. Cette action est irréversible.`)) return;
    /* optimistic */
    setOrders((prev) => prev.filter((o) => !selectedIds.has(o.id)));
    clearSelection();
    startTransition(async () => {
      const res = await bulkDeleteOrders(ids);
      if (res.success) {
        toast.success(`${res.deletedCount} commande${res.deletedCount > 1 ? "s" : ""} supprimée${res.deletedCount > 1 ? "s" : ""}`);
      } else {
        toast.error("Erreur", res.error ?? "Suppression échouée");
      }
    });
  };

  const handleBulkStatus = async (status: string) => {
    const ids = Array.from(selectedIds);
    const n = ids.length;
    if (status === "cancelled") {
      if (!confirm(`Annuler ${n} commande${n > 1 ? "s" : ""} ?`)) return;
    }
    /* optimistic */
    setOrders((prev) => prev.map((o) => selectedIds.has(o.id) ? { ...o, status } : o));
    clearSelection();
    startTransition(async () => {
      const res = await bulkUpdateOrdersStatus(ids, status);
      if (res.success) {
        toast.success(`${n} commande${n > 1 ? "s" : ""} mise${n > 1 ? "s" : ""} à jour`, STATUS_META[status]?.label ?? status);
      } else {
        toast.error("Erreur", res.error ?? "Échec");
      }
    });
  };

  return (
    <>
      {/* Audio invisible pour notif nouvelle commande */}
      <audio ref={audioRef} preload="auto" src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="/>

      {/* Toolbar — search + filtres */}
      <div className="mb-5 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par #, nom, téléphone, adresse…"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-[5px] text-sm focus:outline-none focus:border-[#C9922A] focus:ring-2 focus:ring-[#C9922A]/10"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.value;
            const count = tab.value === "all"
              ? orders.length
              : tab.value === "active"
                ? orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length
                : orders.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1.5 rounded-[5px] text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#C9922A] text-[#111008] shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-[5px] text-[9px] ${
                    isActive ? "bg-black/10" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-20 mb-3 flex items-center gap-2 bg-[#C9922A] text-[#111008] rounded-[5px] px-4 py-2.5 shadow-md flex-wrap">
          <span className="text-xs font-bold">
            {selectedIds.size} commande{selectedIds.size > 1 ? "s" : ""} sélectionnée{selectedIds.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={selectAll}
            className="text-[10px] underline underline-offset-2 hover:no-underline"
          >
            {selectedIds.size === filtered.length ? "Tout désélectionner" : "Tout sélectionner"}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => handleBulkStatus("delivered")}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-[5px]"
          >
            Marquer livrées
          </button>
          <button
            onClick={() => handleBulkStatus("cancelled")}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-[5px]"
          >
            Annuler
          </button>
          <button
            onClick={handleBulkDelete}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-[5px]"
          >
            Supprimer
          </button>
          <button
            onClick={clearSelection}
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider hover:bg-black/10 rounded-[5px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Liste commandes */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-[5px] border border-gray-100 py-12 text-center">
          <svg className="w-12 h-12 mx-auto text-gray-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <p className="text-gray-400 text-sm">
            {search ? "Aucune commande ne correspond à votre recherche" : "Aucune commande"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const meta = STATUS_META[o.status] ?? { label: o.status, tone: "bg-gray-100 text-gray-600", emoji: "•" };
            const isToday = new Date(o.created_at).toDateString() === new Date().toDateString();
            const next = NEXT_STATUS[o.status];

            const isSel = selectedIds.has(o.id);
            return (
              <div
                key={o.id}
                className={`bg-white rounded-[5px] border transition-all overflow-hidden ${
                  isSel
                    ? "border-[#C9922A] ring-2 ring-[#C9922A]/20 shadow-md"
                    : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
                }`}
              >
                <div className="p-4 flex items-center gap-3 flex-wrap">
                  {/* Checkbox de sélection */}
                  <label className="flex-shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(o.id); }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-[#C9922A] cursor-pointer"
                    />
                  </label>

                  {/* Numéro + horaire */}
                  <div className="flex-shrink-0">
                    <p className="text-xl font-bold text-gray-900 leading-none">#{o.order_number}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {isToday ? fmtTime(o.created_at) : `${fmtDate(o.created_at)} · ${fmtTime(o.created_at)}`}
                    </p>
                  </div>

                  {/* Client + adresse */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {o.customer_name || "Client"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {o.customer_address?.split("\n")[0]}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold text-[#C9922A]">{fmtPrice(Number(o.total))}</p>
                    {o.payment_method && (
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{o.payment_method}</p>
                    )}
                  </div>

                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-[5px] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${meta.tone}`}>
                    {meta.label}
                  </span>

                  {/* Action rapide : prochain statut */}
                  {next && (
                    <button
                      onClick={() => handleStatusChange(o.id, next.next)}
                      className={`px-3 py-1.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${next.tone}`}
                    >
                      {next.label}
                    </button>
                  )}

                  {/* Bouton détail */}
                  <button
                    onClick={() => setDetail(o)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-[5px]"
                    aria-label="Détails"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DÉTAIL */}
      {detail && (
        <OrderDetailModal
          order={detail}
          onClose={() => setDetail(null)}
          onStatusChange={(s) => handleStatusChange(detail.id, s)}
          onCancel={() => handleCancel(detail.id, detail.order_number)}
          onDelete={async () => {
            if (!confirm(`Supprimer définitivement la commande #${detail.order_number} ?\n\nLes articles associés seront aussi supprimés. Cette action est irréversible.`)) return;
            setOrders((prev) => prev.filter((o) => o.id !== detail.id));
            setDetail(null);
            startTransition(async () => {
              const { deleteOrder } = await import("@/lib/actions/admin-orders");
              const res = await deleteOrder(detail.id);
              if (res.success) toast.success("Commande supprimée", `#${detail.order_number}`);
              else toast.error("Erreur", res.error ?? "Suppression échouée");
            });
          }}
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   MODAL DÉTAIL COMMANDE
   ───────────────────────────────────────── */
function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onCancel,
  onDelete,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const meta = STATUS_META[order.status] ?? { label: order.status, tone: "bg-gray-100 text-gray-600", emoji: "•" };
  const next = NEXT_STATUS[order.status];
  const phone = order.customer_phone ?? "";
  const phoneDigits = phone.replace(/\D/g, "");
  const waLink = phoneDigits ? `https://wa.me/${phoneDigits}` : null;
  const telLink = phoneDigits ? `tel:${phone}` : null;
  const mapsLink = order.customer_address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer_address.replace(/\n/g, ", "))}`
    : null;

  const subtotal = order.order_items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const tip = Number(order.tip ?? 0);
  const deliveryFee = Math.max(0, Number(order.total) - subtotal - tip);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[5px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-gray-900 text-lg">Commande #{order.order_number}</h2>
              <span className={`px-2 py-0.5 rounded-[5px] text-[10px] font-bold uppercase tracking-wider ${meta.tone}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-[5px] hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Client */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Client</h3>
            <p className="font-semibold text-gray-900">{order.customer_name || "Anonyme"}</p>
            {phone && (
              <p className="text-sm text-gray-600 mt-0.5 font-mono">{fmtPhone(phone)}</p>
            )}
            <div className="flex gap-2 mt-3">
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold rounded-[5px] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg>
                  WhatsApp
                </a>
              )}
              {telLink && (
                <a
                  href={telLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-[5px] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  Appeler
                </a>
              )}
            </div>
          </section>

          {/* Adresse */}
          {order.customer_address && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Adresse de livraison</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line">{order.customer_address}</p>
              {mapsLink && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-[5px] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Ouvrir l&apos;itinéraire
                </a>
              )}
              {order.estimated_delivery_at && order.status === "delivering" && (
                <p className="text-xs text-gray-500 mt-2">
                  ETA : <span className="font-bold text-[#C9922A]">
                    {new Date(order.estimated_delivery_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
              )}
            </section>
          )}

          {/* Articles */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Articles</h3>
            <div className="border border-gray-100 rounded-[5px] divide-y divide-gray-50">
              {order.order_items.map((i) => (
                <div key={i.id} className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 font-mono w-6">{i.quantity}×</span>
                    <span className="text-sm text-gray-700 truncate">{i.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{fmtPrice(Number(i.price) * i.quantity)}</span>
                </div>
              ))}
            </div>
            {/* Totaux */}
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
              <Row label="Sous-total" value={fmtPrice(subtotal)} />
              {deliveryFee > 0 && <Row label="Livraison" value={fmtPrice(deliveryFee)} />}
              {tip > 0 && <Row label="Pourboire" value={fmtPrice(tip)} />}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-[#C9922A] text-lg">{fmtPrice(Number(order.total))}</span>
              </div>
              {order.payment_method && (
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                  Paiement : {order.payment_method}
                </p>
              )}
            </div>
          </section>

          {/* Actions */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Actions</h3>
            <div className="flex flex-wrap gap-2">
              {next && (
                <button
                  onClick={() => onStatusChange(next.next)}
                  className={`px-3 py-2 rounded-[5px] text-xs font-bold transition-colors ${next.tone}`}
                >
                  {next.label}
                </button>
              )}
              <select
                value={order.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="border border-gray-200 rounded-[5px] px-3 py-2 text-xs focus:outline-none focus:border-[#C9922A]"
              >
                {Object.entries(STATUS_META).map(([key, m]) => (
                  <option key={key} value={key}>{m.label}</option>
                ))}
              </select>
              {order.status !== "cancelled" && order.status !== "delivered" && (
                <button
                  onClick={onCancel}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-[5px] transition-colors"
                >
                  Annuler la commande
                </button>
              )}
              <a
                href={`/commande/${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-[5px] transition-colors inline-flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Suivi client
              </a>
            </div>

            {/* Suppression définitive — bouton séparé en bas, visuellement risqué */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={onDelete}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider underline underline-offset-2"
              >
                Supprimer définitivement
              </button>
              <p className="text-[10px] text-gray-400 mt-1">
                Supprime la commande et tous ses articles de la base. Irréversible.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
