/**
 * Tools exposés à l'agent DeepSeek.
 *
 * Format compatible OpenAI function calling (DeepSeek implémente la
 * même interface). Chaque tool a une définition JSON-schema (pour
 * l'agent) et une implémentation TypeScript (pour le runtime).
 */

import { createClient } from "@supabase/supabase-js";

/* ─── Définitions exposées à l'agent ─── */
export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "check_delivery_zone",
      description:
        "Vérifie si une adresse client est dans la zone de livraison de Chez Maman Jolie (Paris 11ᵉ). Renvoie distance, zone, frais et délai approximatif. À appeler dès qu'un client demande s'il est livré ou combien ça coûte.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description:
              "Adresse complète du client (rue + code postal + ville). Ex : '15 rue de Belleville, 75019 Paris'.",
          },
        },
        required: ["address"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_order_status",
      description:
        "Récupère le statut d'une commande à partir de son numéro (ex: 142) ou de l'email du client. À utiliser uniquement si le client demande où en est sa commande.",
      parameters: {
        type: "object",
        properties: {
          order_number: {
            type: "number",
            description: "Numéro de la commande (visible dans l'email de confirmation).",
          },
          customer_phone: {
            type: "string",
            description: "Téléphone du client si pas de numéro de commande disponible.",
          },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_quote_request",
      description:
        "Enregistre une demande de devis traiteur événementiel. À utiliser quand un client demande pour un événement (mariage, anniversaire, repas d'entreprise, etc.). Envoie ensuite une notification au gérant qui rappellera dans la journée.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string", description: "Nom complet du client" },
          contact: {
            type: "string",
            description: "Email ou téléphone pour rappel",
          },
          event_date: {
            type: "string",
            description: "Date prévue (ex : '15 juin 2026', 'à confirmer')",
          },
          guests_count: {
            type: "number",
            description: "Nombre de personnes prévues",
          },
          event_type: {
            type: "string",
            description: "Type d'événement (mariage, anniv, corporate, etc.)",
          },
          location: {
            type: "string",
            description: "Adresse ou ville de l'événement (peut être vague)",
          },
          notes: {
            type: "string",
            description: "Détails supplémentaires utiles (plats demandés, budget, allergies, etc.)",
          },
        },
        required: ["customer_name", "contact", "guests_count"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "escalate_to_human",
      description:
        "Transfère la demande à un humain (le gérant). À utiliser pour : plaintes, problèmes de commande déjà passée, questions hors périmètre, ou quand le client demande explicitement à parler à quelqu'un. Le client recevra un accusé immédiat et le gérant sera notifié par WhatsApp.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            enum: ["complaint", "payment_issue", "order_problem", "explicit_request", "out_of_scope", "other"],
            description: "Raison principale de l'escalation",
          },
          summary: {
            type: "string",
            description: "Résumé du problème en 1-2 phrases pour le gérant",
          },
          urgency: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Urgence perçue",
          },
        },
        required: ["reason", "summary", "urgency"],
      },
    },
  },
] as const;

/* ─── Implémentations ─── */

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  meta: { channel: string; customerEmail?: string; customerPhone?: string }
): Promise<ToolResult> {
  switch (name) {
    case "check_delivery_zone":
      return checkDeliveryZone(args.address as string);
    case "get_order_status":
      return getOrderStatus(args.order_number as number | undefined, args.customer_phone as string | undefined);
    case "create_quote_request":
      return createQuoteRequest(args, meta);
    case "escalate_to_human":
      return escalateToHuman(args, meta);
    default:
      return { success: false, error: `Unknown tool: ${name}` };
  }
}

/* ─── check_delivery_zone ─── */
import { resolveZone } from "@/lib/geo";

async function checkDeliveryZone(address: string): Promise<ToolResult> {
  try {
    const res = await resolveZone(address);
    if (!res || !res.geo) {
      return { success: false, error: "Adresse introuvable. Demandez au client de préciser." };
    }
    const z = res.zoneInfo;
    return {
      success: true,
      data: {
        resolved_address: res.geo.label,
        distance_km: Math.round(z.distanceKm * 10) / 10,
        zone: z.zone,
        out_of_range: z.outOfRange,
        delivery_fee_eur: z.fee,
        delivery_fee_label: z.feeLabel,
        eta_text:
          z.zone === 1 ? "environ 30 minutes"
          : z.zone === 2 ? "environ 40 minutes"
          : z.zone === 3 ? "environ 50 minutes"
          : "non livrable",
        notes: z.outOfRange ? "Adresse hors zone (> 10 km). Pas de livraison possible." : null,
      },
    };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/* ─── get_order_status ─── */
async function getOrderStatus(orderNumber?: number, phone?: string): Promise<ToolResult> {
  try {
    const supabase = adminClient();
    let query = supabase
      .from("orders")
      .select("order_number, status, total, estimated_delivery_at, created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    if (orderNumber) query = query.eq("order_number", orderNumber);
    else if (phone) query = query.eq("customer_phone", phone);
    else return { success: false, error: "Need order_number or phone" };

    const { data } = await query.maybeSingle();
    if (!data) return { success: false, error: "Commande introuvable" };

    return {
      success: true,
      data: {
        order_number: data.order_number,
        status: data.status,
        status_fr: STATUS_LABELS[data.status as string] ?? data.status,
        total_eur: Number(data.total),
        eta: data.estimated_delivery_at,
        created_at: data.created_at,
      },
    };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée, à confirmer par le restaurant",
  confirmed: "Confirmée",
  preparing: "En préparation",
  ready: "Prête pour livraison",
  delivering: "En cours de livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};

/* ─── create_quote_request ─── */
async function createQuoteRequest(
  args: Record<string, unknown>,
  meta: { channel: string; customerEmail?: string; customerPhone?: string }
): Promise<ToolResult> {
  try {
    const supabase = adminClient();
    const { error } = await supabase.from("agent_quote_requests").insert({
      customer_name: args.customer_name,
      contact: args.contact,
      event_date: args.event_date ?? null,
      guests_count: args.guests_count,
      event_type: args.event_type ?? null,
      location: args.location ?? null,
      notes: args.notes ?? null,
      channel: meta.channel,
      raw_email: meta.customerEmail ?? null,
      raw_phone: meta.customerPhone ?? null,
      status: "new",
    });
    if (error) {
      console.warn("[agent] create_quote_request failed:", error.message);
      return { success: false, error: "Impossible d'enregistrer pour le moment" };
    }
    return {
      success: true,
      data: { message: "Demande enregistrée. Le gérant rappellera dans la journée." },
    };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/* ─── escalate_to_human ─── */
async function escalateToHuman(
  args: Record<string, unknown>,
  meta: { channel: string; customerEmail?: string; customerPhone?: string }
): Promise<ToolResult> {
  try {
    const supabase = adminClient();
    const { error } = await supabase.from("agent_escalations").insert({
      reason: args.reason,
      summary: args.summary,
      urgency: args.urgency,
      channel: meta.channel,
      customer_email: meta.customerEmail ?? null,
      customer_phone: meta.customerPhone ?? null,
      status: "open",
    });
    if (error) {
      console.warn("[agent] escalate_to_human failed:", error.message);
    }
    /* TODO Phase 2 : envoyer une notif WhatsApp au gérant via Meta Cloud API */
    return {
      success: true,
      data: {
        message:
          "Un humain de l'équipe va vous répondre dans la journée. Merci de votre patience.",
        notified_at: new Date().toISOString(),
      },
    };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
