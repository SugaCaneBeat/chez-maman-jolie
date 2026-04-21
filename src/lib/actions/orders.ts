"use server";

export interface CreateOrderInput {
  items: { name: string; price: number; quantity: number; image?: string; menuItemId?: string }[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: string;
  paid?: boolean;
  total: number;
  zoneLabel?: string;
  distanceKm?: number;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: number;
  error?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || url.includes("YOUR_PROJECT")) {
      return { success: false, error: "Supabase not configured" };
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: input.customerName || null,
        customer_phone: input.customerPhone || null,
        customer_address: input.customerAddress || null,
        payment_method: input.paymentMethod,
        total: input.total,
        status: input.paid ? "paid" : "pending",
      })
      .select()
      .single();

    if (error || !order) return { success: false, error: error?.message || "Order creation failed" };

    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId || null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image || null,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) return { success: false, error: itemsError.message };

    return { success: true, orderId: order.id, orderNumber: order.order_number };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

/* ─── Public order lookup for tracking page ─── */
export interface PublicOrder {
  id: string;
  order_number: number;
  status: string;
  total: number;
  payment_method: string | null;
  customer_name: string | null;
  customer_address: string | null;
  created_at: string;
  items: { name: string; price: number; quantity: number; image: string | null }[];
}

export async function getPublicOrder(id: string): Promise<PublicOrder | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(url, key);

    const { data, error } = await supabase
      .from("orders")
      .select("id, order_number, status, total, payment_method, customer_name, customer_address, created_at, order_items(name, price, quantity, image)")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      order_number: data.order_number,
      status: data.status,
      total: Number(data.total),
      payment_method: data.payment_method,
      customer_name: data.customer_name,
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
