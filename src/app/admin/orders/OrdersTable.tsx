"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/admin-orders";

const statusOptions = [
  { value: "pending", label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  { value: "preparing", label: "En préparation", color: "bg-orange-100 text-orange-800" },
  { value: "ready", label: "Prête", color: "bg-green-100 text-green-800" },
  { value: "delivering", label: "En livraison", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Livrée", color: "bg-gray-100 text-gray-600" },
  { value: "cancelled", label: "Annulée", color: "bg-red-100 text-red-800" },
];

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
  status: string;
  total: number;
  payment_method: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const filteredOrders = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    await updateOrderStatus(orderId, newStatus);
  };

  const formatPrice = (p: number) => (p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`);
  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors ${filter === "all" ? "bg-[#C9922A] text-[#111008]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Toutes ({orders.length})
        </button>
        {statusOptions.map(s => {
          const count = orders.filter(o => o.status === s.value).length;
          if (count === 0) return null;
          return (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-[5px] text-xs font-medium transition-colors ${filter === s.value ? "bg-[#C9922A] text-[#111008]" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-[5px] border border-gray-100 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Aucune commande</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredOrders.map(order => (
              <div key={order.id}>
                <div
                  className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900">#{order.order_number}</span>
                    <span className="text-gray-400 text-sm">{formatDate(order.created_at)}</span>
                    <span className="text-gray-500 text-sm">{order.customer_name || "Client"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={order.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 py-1 rounded-[5px] text-xs font-bold border-0 cursor-pointer ${
                        statusOptions.find(s => s.value === order.status)?.color || "bg-gray-100"
                      }`}
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <span className="font-bold text-[#C9922A] min-w-[70px] text-right">{formatPrice(Number(order.total))}</span>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === order.id && (
                  <div className="px-6 pb-4 bg-gray-50/50">
                    <div className="grid grid-cols-3 gap-4 mb-3 text-xs text-gray-500">
                      <div><span className="font-medium">Téléphone :</span> {order.customer_phone || "—"}</div>
                      <div><span className="font-medium">Paiement :</span> {order.payment_method || "—"}</div>
                      <div><span className="font-medium">Articles :</span> {order.order_items?.length || 0}</div>
                    </div>
                    <div className="space-y-1">
                      {(order.order_items || []).map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name} <span className="text-gray-400">x{item.quantity}</span></span>
                          <span className="text-gray-500">{formatPrice(Number(item.price) * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
