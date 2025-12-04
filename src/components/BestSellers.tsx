import ProductCard from "./ProductCard";
import { useEffect, useState, useMemo } from "react";
import { fetchProducts } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

type UIProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  fit?: string | null;
  style?: string | null;
  product_color?: string | null;
  discount_percentage?: number | null;
};

const BestSellers = () => {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const displayProducts = useMemo(() => {
    if (!products.length) return [];

    type DesignGroup = { items: UIProduct[]; colorSlugs: Set<string> };
    const groups: Record<string, DesignGroup> = {};
    const makeKey = (p: UIProduct) => {
      const norm = (v: string | null | undefined) =>
        (v || "").toLowerCase().trim().replace(/\s+/g, "-");
      return [norm(p.category), norm(p.fit), norm(p.style)].join("|");
    };

    const toColorSlug = (value: string | null | undefined) =>
      value ? value.toLowerCase().trim().replace(/\s+/g, "-") : "";

    for (const p of products) {
      const key = makeKey(p);
      if (!groups[key]) {
        groups[key] = { items: [], colorSlugs: new Set<string>() };
      }
      groups[key].items.push(p);
      const colorSlug = toColorSlug(p.product_color ?? undefined);
      if (colorSlug) groups[key].colorSlugs.add(colorSlug);
    }

    const result: UIProduct[] = [];
    for (const key of Object.keys(groups)) {
      const group = groups[key];
      const hasMultipleColors = group.colorSlugs.size > 1;
      if (hasMultipleColors) {
        // Multi-color design: show only one representative product
        result.push(group.items[0]);
      } else {
        // Single-color design: show all products in this group
        result.push(...group.items);
      }
    }

    // Start with unique/grouped designs, limited to 4
    const limited = result.slice(0, 4);

    // If we still have fewer than 4 cards but there are more products available,
    // backfill from the original products list (preserving order) until we reach 4.
    if (limited.length < 4) {
      const usedIds = new Set(limited.map((p) => p.id));
      for (const p of products) {
        if (limited.length >= 4) break;
        if (!usedIds.has(p.id)) {
          limited.push(p);
          usedIds.add(p.id);
        }
      }
    }

    return limited;
  }, [products]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 1) Top 4 product_ids by total quantity sold
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: agg, error } = await (supabase as any)
        .from('order_items')
        .select('product_id, quantity')
        .not('product_id', 'is', null);

      let topIds: string[] = [];
      if (!error && Array.isArray(agg) && agg.length > 0) {
        const totals = new Map<string, number>();
        type OrderAggRow = { product_id: string | null; quantity: number | null };
        for (const row of (agg as OrderAggRow[])) {
          if (!row.product_id) continue;
          const pid = row.product_id;
          const qty = Number(row.quantity ?? 0) || 0;
          totals.set(pid, (totals.get(pid) || 0) + qty);
        }
        topIds = Array.from(totals.entries())
          .sort((a, b) => b[1] - a[1])
          // Take more IDs so that after grouping we still have up to 4 cards
          .slice(0, 12)
          .map(([pid]) => pid);
      }

      let list: UIProduct[] = [];
      if (topIds.length > 0) {
        // 2) Fetch product details for those IDs and preserve order
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: prods } = await (supabase as any)
          .from('products')
          .select('id, name, price, image_url, category, fit, style, product_color, discount_percentage')
          .in('id', topIds);
        const typedProds = (prods || []) as UIProduct[];
        const byId = new Map(typedProds.map((p) => [p.id, p]));
        list = topIds.map((id) => byId.get(id)).filter(Boolean) as UIProduct[];
      } else {
        // 3) Fallback to latest 4 products
        const data = await fetchProducts();
        list = (data as UIProduct[]).slice(0, 4);
      }
      setProducts(list);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="py-12 sm:py-16 px-4 border-t border-border bg-background">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Best Sellers</h2>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading best sellers…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {displayProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.image_url}
                category={p.category}
                discountPercentage={p.discount_percentage ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
