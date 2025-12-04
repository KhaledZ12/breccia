/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/integrations/supabase/client";

export type Order = {
  id: string;
  user_email: string | null;
  total: number;
  status: string;
  created_at?: string;
  order_number?: number;
  shipping_name?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  shipping_phone?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  image_url: string | null;
};

export async function fetchRecentOrders(limit = 10): Promise<(Order & { items: OrderItem[] })[]> {
  const { data, error } = await (supabase as any)
    .from("orders")
    .select("id, user_email, total, status, created_at, order_number, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_phone, order_items:order_items(id, order_id, product_id, product_name, unit_price, quantity, image_url)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch orders:", error.message);
    return [] as any;
  }
  return (data || []).map((o: any) => ({
    id: o.id,
    user_email: o.user_email,
    total: o.total,
    status: o.status,
    created_at: o.created_at,
    order_number: o.order_number,
    shipping_name: o.shipping_name ?? null,
    shipping_address: o.shipping_address ?? null,
    shipping_city: o.shipping_city ?? null,
    shipping_postal_code: o.shipping_postal_code ?? null,
    shipping_phone: o.shipping_phone ?? null,
    items: o.order_items || [],
  }));
}

/**
 * Secure variant: recomputes prices and totals from DB and ignores client-sent prices/names.
 * Shipping: 60 EGP, free over 1499 EGP.
 */
export async function createOrderSecure(input: {
  user_email: string | null;
  items: Array<{ product_id: string; quantity: number }>
  shipping_name?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  shipping_phone?: string | null;
}): Promise<{ ok: boolean; id?: string; orderNumber?: number; error?: string }> {
  try {
    if (!Array.isArray(input.items) || input.items.length === 0) {
      return { ok: false, error: 'No items' };
    }
    const qtyValid = input.items.every(it => typeof it.quantity === 'number' && it.quantity > 0 && typeof it.product_id === 'string');
    if (!qtyValid) return { ok: false, error: 'Invalid item payload' };

    const ids = Array.from(new Set(input.items.map(i => i.product_id)));
    const { data: prods, error: prodErr } = await (supabase as any)
      .from('products')
      .select('id, name, price, discount_percentage, image_url')
      .in('id', ids);
    if (prodErr) return { ok: false, error: prodErr.message };
    const byId: Map<string, any> = new Map<string, any>((prods || []).map((p: any) => [p.id as string, p]));
    // Build items using server prices
    const itemsPayload: Array<{ order_id: string; product_id: string; product_name: string; unit_price: number; quantity: number; image_url: string | null }> = [] as any;
    let subtotal = 0;
    for (const it of input.items) {
      const p = byId.get(it.product_id) as any;
      if (!p) return { ok: false, error: 'Product not found: ' + it.product_id };
      const d = Math.max(0, Math.min(100, Number(p.discount_percentage) || 0));
      const unit = d > 0 ? p.price * (1 - d / 100) : p.price;
      subtotal += unit * it.quantity;
      (itemsPayload as any).push({
        order_id: '', // to be set after order insert
        product_id: p.id,
        product_name: p.name,
        unit_price: unit,
        quantity: it.quantity,
        image_url: p.image_url ?? null,
      });
    }
    const shippingCost = subtotal >= 1499 ? 0 : 60;
    const total = subtotal + shippingCost;

    // Create order first
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .insert({
        user_email: input.user_email,
        total,
        status: 'requested',
        shipping_name: input.shipping_name ?? null,
        shipping_address: input.shipping_address ?? null,
        shipping_city: input.shipping_city ?? null,
        shipping_postal_code: input.shipping_postal_code ?? null,
        shipping_phone: input.shipping_phone ?? null,
      })
      .select('id, order_number')
      .maybeSingle();
    if (orderError || !order?.id) return { ok: false, error: orderError?.message || 'Failed to create order' };

    const orderId = order.id as string;
    const orderNumber = order.order_number as number | undefined;
    // Attach order_id
    const finalItems = itemsPayload.map((it) => ({ ...it, order_id: orderId }));
    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .insert(finalItems);
    if (itemsError) return { ok: false, error: itemsError.message };

    return { ok: true, id: orderId, orderNumber };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Unknown error' };
  }
}

export async function fetchAllOrders(): Promise<(Order & { items: OrderItem[] })[]> {
  const { data, error } = await (supabase as any)
    .from("orders")
    .select("id, user_email, total, status, created_at, order_number, shipping_name, shipping_address, shipping_city, shipping_postal_code, shipping_phone, order_items:order_items(id, order_id, product_id, product_name, unit_price, quantity, image_url)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch orders:", error.message);
    return [] as any;
  }
  return (data || []).map((o: any) => ({
    id: o.id,
    user_email: o.user_email,
    total: o.total,
    status: o.status,
    created_at: o.created_at,
    order_number: o.order_number,
    shipping_name: o.shipping_name ?? null,
    shipping_address: o.shipping_address ?? null,
    shipping_city: o.shipping_city ?? null,
    shipping_postal_code: o.shipping_postal_code ?? null,
    shipping_phone: o.shipping_phone ?? null,
    items: o.order_items || [],
  }));
}

export async function createOrder(input: {
  user_email: string | null;
  items: Array<{ product_id: string; product_name: string; unit_price: number; quantity: number; image_url?: string | null }>;
  total: number;
  status?: string;
  shipping_name?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  shipping_phone?: string | null;
}): Promise<{ ok: boolean; id?: string; orderNumber?: number; error?: string }> {
  // 1) create order
  const { data: order, error: orderError } = await (supabase as any)
    .from('orders')
    .insert({
      user_email: input.user_email,
      total: input.total,
      status: input.status || 'requested',
      shipping_name: input.shipping_name ?? null,
      shipping_address: input.shipping_address ?? null,
      shipping_city: input.shipping_city ?? null,
      shipping_postal_code: input.shipping_postal_code ?? null,
      shipping_phone: input.shipping_phone ?? null,
    })
    .select('id, order_number')
    .maybeSingle();

  if (orderError || !order?.id) {
    return { ok: false, error: orderError?.message || 'Failed to create order' };
  }

  const orderId = order.id as string;
  const orderNumber = order.order_number as number | undefined;

  if (input.items.length > 0) {
    const itemsPayload = input.items.map((it) => ({
      order_id: orderId,
      product_id: it.product_id,
      product_name: it.product_name,
      unit_price: it.unit_price,
      quantity: it.quantity,
      image_url: it.image_url ?? null,
    }));

    const { error: itemsError } = await (supabase as any)
      .from('order_items')
      .insert(itemsPayload);

    if (itemsError) {
      return { ok: false, error: itemsError.message };
    }
  }

  return { ok: true, id: orderId, orderNumber };
}

export async function updateOrderStatus(orderId: string, status: 'requested' | 'ready_to_ship' | 'shipped' | 'delivered') {
  const { error } = await (supabase as any)
    .from('orders')
    .update({ status })
    .eq('id', orderId);
  return { ok: !error, error: error?.message };
}

export async function deleteOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  // Delete order items first to satisfy foreign key constraints
  const { error: itemsError } = await (supabase as any)
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  if (itemsError) {
    return { ok: false, error: itemsError.message };
  }

  const { error: orderError } = await (supabase as any)
    .from('orders')
    .delete()
    .eq('id', orderId);

  return { ok: !orderError, error: orderError?.message };
}


