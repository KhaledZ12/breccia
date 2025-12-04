import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { fetchFeaturedProducts } from "@/lib/products";

type UIProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image_url_2?: string | null;
  image_url_3?: string | null;
  image_url_4?: string | null;
  image_url_5?: string | null;
  category: string;
  fit?: string | null;
  style?: string | null;
  product_color?: string | null;
  discount_percentage?: number | null;
};

const FeaturedProducts = () => {
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchFeaturedProducts(4);
      setProducts(data as UIProduct[]);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          FEATURED PRODUCTS
        </h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Discover our latest collection
        </p>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[340px] bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                image={p.image_url}
                images={[
                  p.image_url,
                  p.image_url_2 || undefined,
                  p.image_url_3 || undefined,
                  p.image_url_4 || undefined,
                  p.image_url_5 || undefined,
                ].filter(Boolean) as string[]}
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

export default FeaturedProducts;
