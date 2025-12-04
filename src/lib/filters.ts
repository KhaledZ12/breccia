import { supabase } from "@/integrations/supabase/client";

export type Filter = {
  id: string;
  name: string;
  type: "category" | "size" | "color" | "brand" | "price_range" | "custom";
  values: string[];
  is_active: boolean;
  display_order: number;
  created_at?: string;
};

export async function fetchAllFilters(): Promise<Filter[]> {
  const { data, error } = await (supabase as any)
    .from("filters")
    .select("id, name, type, values, is_active, display_order, created_at")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to fetch filters:", error.message);
    return [];
  }
  return data ?? [];
}

export async function createFilter(input: {
  name: string;
  type: Filter["type"];
  values: string[];
  is_active: boolean;
  display_order: number;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { data, error } = await (supabase as any)
    .from("filters")
    .insert({
      name: input.name,
      type: input.type,
      values: input.values,
      is_active: input.is_active,
      display_order: input.display_order,
    })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

export async function updateFilter(
  id: string,
  patch: Partial<Pick<Filter, "name" | "type" | "values" | "is_active" | "display_order">>
): Promise<{ ok: boolean; error?: string }> {
  const updates: any = {};
  if (typeof patch.name !== "undefined") updates.name = patch.name;
  if (typeof patch.type !== "undefined") updates.type = patch.type;
  if (typeof patch.values !== "undefined") updates.values = patch.values;
  if (typeof patch.is_active !== "undefined") updates.is_active = patch.is_active;
  if (typeof patch.display_order !== "undefined") updates.display_order = patch.display_order;

  const { error } = await (supabase as any)
    .from("filters")
    .update(updates)
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteFilter(id: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await (supabase as any)
    .from("filters")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function reorderFilters(
  orders: Array<{ id: string; display_order: number }>
): Promise<{ ok: boolean; error?: string }> {
  for (const o of orders) {
    const { error } = await (supabase as any)
      .from("filters")
      .update({ display_order: o.display_order })
      .eq("id", o.id);
    if (error) return { ok: false, error: error.message };
  }
  return { ok: true };
}
