"use server";

/* ──────────────────────────────────────────────────────────────────
 * Création de commande — TOUT est recalculé côté serveur.
 *
 * Le client envoie uniquement :
 *   - les IDs et quantités des articles (PAS le prix, PAS le nom)
 *   - les infos de livraison
 *   - le pourboire et les frais de livraison estimés
 *
 * Le serveur :
 *   1. Recharge les prix réels depuis menu_items via les IDs
 *   2. Vérifie que les articles sont disponibles
 *   3. Recalcule le sous-total à partir des vrais prix
 *   4. Valide les frais de livraison contre une liste blanche
 *   5. Construit le total : subtotal + delivery + tip
 *
 * Cela empêche un attaquant de modifier les prix côté navigateur
 * (paye 0,01 € pour 200 € d'articles).
 * ────────────────────────────────────────────────────────────────── */

const ALLOWED_DELIVERY_FEES = new Set([0, 2.5, 4.5, 6]);
const MIN_ORDER = 25;
const MAX_QTY = 50; /* sanity: pas plus de 50 d'un même article */

export interface CreateOrderInput {
  items: { menuItemId: string; quantity: number }[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: string;
  paid?: boolean;
  tip?: number;
  deliveryFee?: number;
  zoneLabel?: string;
  distanceKm?: number;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: number;
  total?: number;
  error?: string;
}

/* Helper pour validation rapide */
function fail(error: string): CreateOrderResult {
  return { success: false, error };
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  try {
    /* ── 1. Validation structurelle ── */
    if (!Array.isArray(input.items) || input.items.length === 0) {
      return fail("Panier vide");
    }
    if (input.items.length > 100) {
      return fail("Trop d'articles");
    }
    for (const it of input.items) {
      if (!it.menuItemId || typeof it.menuItemId !== "string") {
        return fail("Article invalide");
      }
      if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > MAX_QTY) {
        return fail("Quantité invalide");
      }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || url.includes("YOUR_PROJECT")) {
      return fail("Configuration manquante");
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    /* ── 2. Fetch des vrais articles depuis la base ── */
    const ids = input.items.map((i) => i.menuItemId);
    const { data: menuRows, error: menuErr } = await supabase
      .from("menu_items")
      .select("id, name, price, image, available")
      .in("id", ids);

    if (menuErr || !menuRows) {
      console.warn("[orders] menu fetch:", menuErr?.message);
      return fail("Lecture du menu impossible");
    }

    /* Vérifier que tous les IDs existent */
    if (menuRows.length !== new Set(ids).size) {
      return fail("Un article du panier n'existe plus");
    }

    const byId = new Map(menuRows.map((m) => [m.id as string, m]));

    /* ── 3. Recalcul du sous-total et construction des lignes ── */
    let subtotal = 0;
    const orderItemRows: Array<{
      menu_item_id: string;
      name: string;
      price: number;
      quantity: number;
      image: string | null;
    }> = [];

    for (const it of input.items) {
      const row = byId.get(it.menuItemId);
      if (!row) return fail("Article introuvable");
      if (!row.available) return fail(`"${row.name}" n'est plus disponible`);

      const price = Number(row.price);
      if (!isFinite(price) || price < 0) return fail("Prix invalide");

      subtotal += price * it.quantity;

      orderItemRows.push({
        menu_item_id: row.id,
        name: row.name,
        price,
        quantity: it.quantity,
        image: row.image ?? null,
      });
    }

    /* Arrondi à 2 décimales pour éviter les float drift */
    subtotal = Math.round(subtotal * 100) / 100;

    if (subtotal < MIN_ORDER) {
      return fail(`Minimum de commande ${MIN_ORDER} €`);
    }

    /* ── 4. Validation des frais de livraison ── */
    const deliveryFee = Number(input.deliveryFee ?? 0);
    if (!ALLOWED_DELIVERY_FEES.has(deliveryFee)) {
      return fail("Frais de livraison invalides");
    }

    /* ── 5. Pourboire (max 100 €, pas négatif) ── */
    const tip = Math.max(0, Math.min(100, Number(input.tip ?? 0)));

    const total = Math.round((subtotal + deliveryFee + tip) * 100) / 100;

    /* ── 6. Insert order ── */
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: input.customerName?.slice(0, 200) || null,
        customer_phone: input.customerPhone?.slice(0, 30) || null,
        customer_address: input.customerAddress?.slice(0, 500) || null,
        payment_method: input.paymentMethod === "carte" ? "carte" : "carte",
        total,
        tip,
        status: input.paid ? "paid" : "pending",
      })
      .select()
      .single();

    if (error || !order) {
      console.warn("[orders] insert:", error?.message);
      return fail("Création de la commande impossible");
    }

    /* ── 7. Insert order_items avec les prix authoritatifs serveur ── */
    const itemsRows = orderItemRows.map((r) => ({ ...r, order_id: order.id }));
    const { error: itemsError } = await supabase.from("order_items").insert(itemsRows);
    if (itemsError) {
      console.warn("[orders] items insert:", itemsError.message);
      /* Rollback : supprimer l'order créé */
      await supabase.from("orders").delete().eq("id", order.id);
      return fail("Création des lignes impossible");
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      total,
    };
  } catch (e) {
    console.warn("[orders] createOrder threw:", e);
    return fail("Erreur interne");
  }
}

/* ─── Public order lookup for tracking page ─── */
export interface PublicOrder {
  id: string;
  order_number: number;
  status: string;
  total: number;
  tip: number;
  estimated_delivery_at: string | null;
  payment_method: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  created_at: string;
  items: { name: string; price: number; quantity: number; image: string | null }[];
}

export async function getPublicOrder(id: string): Promise<PublicOrder | null> {
  try {
    /* Valider que l'ID est un UUID pour éviter d'utiliser l'endpoint
     * comme oracle d'énumération d'ordres existants. */
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return null;
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total, tip, estimated_delivery_at, payment_method, customer_name, customer_phone, customer_address, created_at, order_items(name, price, quantity, image)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      order_number: data.order_number,
      status: data.status,
      total: Number(data.total),
      tip: Number(data.tip ?? 0),
      estimated_delivery_at: data.estimated_delivery_at ?? null,
      payment_method: data.payment_method,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      created_at: data.created_at,
      items: (data.order_items || []).map((i: { name: string; price: number | string; quantity: number; image: string | null }) => ({
        name: i.name,
        price: Number(i.price),
        quantity: i.quantity,
        image: i.image,
      })),
    };
  } catch {
    return null;
  }
}

/* buildOrderWhatsAppNotification(order) a été déplacé dans
 * @/lib/order-notifications car les fichiers "use server" ne peuvent
 * exporter que des fonctions async. */
