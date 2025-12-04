import { supabase } from "@/integrations/supabase/client";

export type SizeChart = {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at?: string;
};

export async function fetchSizeCharts(): Promise<SizeChart[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("size_charts")
    .select("id, slug, title, content, updated_at")
    .order("slug", { ascending: true });
  if (error) {
    console.error("Failed to fetch size charts:", error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertSizeChart(input: { slug: string; title: string; content: string }): Promise<{ ok: boolean; error?: string }>{
  const slug = input.slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("size_charts")
    .upsert({ slug, title: input.title, content: input.content }, { onConflict: "slug" })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchSizeChartBySlug(slug: string): Promise<SizeChart | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("size_charts")
    .select("id, slug, title, content, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("Failed to fetch size chart:", error.message);
    return null;
  }
  return data ?? null;
}

export async function deleteSizeChart(slug: string): Promise<{ ok: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("size_charts")
    .delete()
    .eq("slug", slug);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
