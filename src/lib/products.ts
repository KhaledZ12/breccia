import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string; // primary image
  image_url_2?: string | null;
  image_url_3?: string | null;
  image_url_4?: string | null;
  image_url_5?: string | null;
  category: string;
  description?: string | null;
  in_stock?: boolean | null;
  slug?: string | null;
  created_at?: string;
  size_chart_slug?: string | null;
  fit?: string | null;
  style?: string | null;
  colors?: string[] | null;
  product_color?: string | null;
  discount_percentage?: number | null;
};

export async function fetchProducts(): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("products")
    .select("id, name, price, image_url, image_url_2, image_url_3, image_url_4, image_url_5, category, description, in_stock, slug, size_chart_slug, fit, style, colors, product_color, created_at, discount_percentage")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch products:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchProductsWithSizeChart(sizeChartSlug: string): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("products")
    .select("id, name, price, image_url, image_url_2, image_url_3, image_url_4, image_url_5, category, description, in_stock, slug, size_chart_slug, fit, style, colors, product_color, created_at, discount_percentage")
    .eq("size_chart_slug", sizeChartSlug);
  if (error) {
    console.error("Failed to fetch products with size chart:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("products")
    .select("id, name, price, image_url, image_url_2, image_url_3, image_url_4, image_url_5, category, size_chart_slug, fit, style, colors, product_color, created_at, discount_percentage")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch featured products:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("products")
    .select("id, name, price, image_url, image_url_2, image_url_3, image_url_4, image_url_5, category, description, in_stock, slug, size_chart_slug, fit, style, colors, product_color, created_at, discount_percentage")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch product:", error.message);
    return null;
  }
  return data ?? null;
}

export async function createProduct(input: {
  name: string;
  price: number;
  category: string;
  description?: string;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  image_url_5?: string;
  size_chart_slug?: string;
  fit?: string;
  style?: string;
  product_color?: string;
  colors?: string[];
  in_stock?: boolean;
  discount_percentage?: number;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    name: input.name,
    price: input.price,
    category: input.category,
    description: input.description ?? null,
    image_url: input.image_url,
  };

  // Include optional image fields only if provided to avoid DB errors when columns don't exist yet
  if (input.image_url_2) payload.image_url_2 = input.image_url_2;
  if (input.image_url_3) payload.image_url_3 = input.image_url_3;
  if (input.image_url_4) payload.image_url_4 = input.image_url_4;
  if (input.image_url_5) payload.image_url_5 = input.image_url_5;
  if (input.size_chart_slug) payload.size_chart_slug = input.size_chart_slug;
  if (input.fit) payload.fit = input.fit;
  if (input.style) payload.style = input.style;
  if (input.product_color) payload.product_color = input.product_color;
  if (input.colors && input.colors.length > 0) payload.colors = input.colors;
  if (typeof input.in_stock === 'boolean') payload.in_stock = input.in_stock;
  if (typeof input.discount_percentage === 'number') payload.discount_percentage = input.discount_percentage;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("products")
    .insert(payload)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data && data.id ? data.id : undefined };
}

export async function updateProduct(id: string, updates: {
  name?: string;
  price?: number;
  category?: string;
  description?: string | null;
  image_url?: string;
  image_url_2?: string | null;
  image_url_3?: string | null;
  image_url_4?: string | null;
  image_url_5?: string | null;
  size_chart_slug?: string | null;
  fit?: string | null;
  style?: string | null;
  colors?: string[] | null;
  product_color?: string | null;
  in_stock?: boolean | null;
  discount_percentage?: number | null;
}): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(updates)) {
    if (v !== undefined) payload[k] = v;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('products')
    .update(payload)
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("products")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function findProductVariant(params: {
  category: string;
  product_color: string;
  fit?: string | null;
  style?: string | null;
}): Promise<Product | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("products")
    .select("id, name, price, image_url, image_url_2, image_url_3, image_url_4, image_url_5, category, description, in_stock, slug, size_chart_slug, fit, style, colors, product_color, created_at, discount_percentage")
    .eq("category", params.category)
    .eq("product_color", params.product_color);

  if (params.fit) {
    query = query.eq("fit", params.fit);
  }
  if (params.style) {
    query = query.eq("style", params.style);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("Failed to find product variant:", error.message);
    return null;
  }
  return data ?? null;
}
