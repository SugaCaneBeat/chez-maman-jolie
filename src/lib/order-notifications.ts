/**
 * Helpers pour générer les notifications WhatsApp à partir d'une commande.
 * Module séparé (pas "use server") car ce sont des fonctions sync utilisables
 * côté serveur ET côté client.
 */

import type { PublicOrder } from "@/lib/actions/orders";

const RESTAURANT_PHONE = "33753873213";

function fmtPrice(p: number) {
  return p % 1 === 0 ? `${p} €` : `${p.toFixed(2).replace(".", ",")} €`;
}

/* ─── Build the WhatsApp notification URL from order data ─── */
export function buildOrderWhatsAppNotification(order: PublicOrder): string {
  const labels: Record<string, string> = {
    carte:  "Carte (SumUp)",
    lydia:  "Lydia",
    paylib: "PayLib",
    wero:   "Wero",
  };
  const sep = "━━━━━━━━━━━━━━━━━━";
  const sub = "──────────────────";
  const total = fmtPrice(order.total);
  const lines: string[] = [];

  lines.push(sep);
  lines.push("*CHEZ MAMAN JOLIE*");
  lines.push(`_Commande #${order.order_number}_`);
  lines.push("✅ *PAIEMENT EFFECTUÉ* — _à préparer_");
  lines.push(sep);
  lines.push("");

  lines.push("🍽️ *ARTICLES*");
  order.items.forEach((i) => {
    lines.push(`• ${i.name}  _x${i.quantity}_  —  ${fmtPrice(i.price * i.quantity)}`);
  });
  lines.push("");
  lines.push(`*Total :*  *${total}*`);
  lines.push("");
  lines.push(sub);
  lines.push("");

  lines.push("👤 *CLIENT*");
  if (order.customer_name) lines.push(order.customer_name);
  if (order.customer_phone) lines.push(`📞 ${order.customer_phone}`);
  lines.push("");
  lines.push("📍 *ADRESSE DE LIVRAISON*");
  (order.customer_address ?? "_à préciser_").split("\n").forEach((l) => lines.push(l));
  lines.push("");
  lines.push(sub);
  lines.push("");

  lines.push(
    `💳 Payé via *${labels[order.payment_method ?? ""] ?? order.payment_method ?? "Carte"}*  ·  ${total}`
  );
  lines.push("");
  lines.push("_Merci de préparer la commande._");

  return `https://wa.me/${RESTAURANT_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}
