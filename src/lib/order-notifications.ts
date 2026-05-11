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

/** Formate un numéro de téléphone en groupes de 2 chiffres
 *  +33600000000  →  +33 6 00 00 00 00
 *  +32489975793  →  +32 4 89 97 57 93 */
function fmtPhone(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return raw;
  const country = digits.length > 10 ? digits.slice(0, 2) : "";
  const local = digits.slice(country ? 2 : 0);
  /* Premier chiffre du local, puis paires */
  const first = local[0];
  const rest = local.slice(1).match(/.{1,2}/g)?.join(" ") ?? "";
  return country ? `+${country} ${first} ${rest}`.trim() : `${first} ${rest}`.trim();
}

const PAY_LABELS: Record<string, string> = {
  carte:  "Carte bancaire (SumUp)",
  lydia:  "Lydia",
  paylib: "PayLib",
  wero:   "Wero",
};

/* ─── Build the WhatsApp notification URL from order data ─── */
export function buildOrderWhatsAppNotification(order: PublicOrder): string {
  const lines: string[] = [];
  const total = fmtPrice(order.total);
  const method = order.payment_method
    ? (PAY_LABELS[order.payment_method] ?? order.payment_method)
    : "Carte";

  /* En-tête épuré */
  lines.push("*Chez Maman Jolie*");
  lines.push("");
  lines.push(`✅ *Commande #${order.order_number} — Payée*`);
  lines.push("");

  /* Client */
  lines.push("*Client*");
  if (order.customer_name) lines.push(order.customer_name);
  if (order.customer_phone) lines.push(fmtPhone(order.customer_phone));
  lines.push("");

  /* Livraison */
  lines.push("*Livraison*");
  (order.customer_address ?? "_à préciser_").split("\n").forEach((l) => lines.push(l));
  lines.push("");

  /* Articles */
  lines.push("*Détails*");
  if (order.items.length === 0) {
    lines.push("_Aucun article enregistré_");
  } else {
    order.items.forEach((i) => {
      lines.push(`• ${i.quantity}× ${i.name} — ${fmtPrice(i.price * i.quantity)}`);
    });
  }
  lines.push("");

  /* Total + paiement */
  lines.push(`*Total : ${total}*`);
  lines.push(`_Payé par ${method}_`);
  lines.push("");

  /* Closing */
  lines.push("Merci de préparer la commande dès réception 🙏");

  return `https://wa.me/${RESTAURANT_PHONE}?text=${encodeURIComponent(lines.join("\n"))}`;
}
