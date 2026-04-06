"use server";

interface OrderInput {
  items: { name: string; price: number; quantity: number; image?: string; menuItemId?: string }[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  paymentMethod: string;
  total: number;
}

export async function createOrder(input: OrderInput) {
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
        status: "pending",
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
