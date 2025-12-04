import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at?: string;
};

export async function fetchCategories(): Promise<Category[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("categories")
    .select("id, name, slug, image_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch categories:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createCategory(input: {
  name: string;
  slug: string;
  image_url: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('categories')
    .insert({
      name: input.name,
      slug: input.slug,
      image_url: input.image_url,
    })
    .select('id')
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data?.id };
}

export async function deleteCategory(categoryId: string): Promise<{ ok: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function updateCategory(categoryId: string, input: {
  name?: string;
  slug?: string;
  image_url?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const payload: Partial<Pick<Category, "name" | "slug" | "image_url">> = {};
  if (typeof input.name === 'string') payload.name = input.name;
  if (typeof input.slug === 'string') payload.slug = input.slug;
  if (typeof input.image_url === 'string') payload.image_url = input.image_url;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('categories')
    .update(payload)
    .eq('id', categoryId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}


