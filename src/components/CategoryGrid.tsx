import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/categories";

const CategoryGrid = () => {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string; image_url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-14 tracking-tight">
          SHOP BY CATEGORY
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse" />
            ))}
          </div>
        ) : categories.length <= 2 ? (
          <div className="flex flex-wrap justify-center gap-10">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.slug === 'sweatpants' ? '/sweatpants/' : `/shop?category=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden aspect-square hover-scale w-full max-w-[28rem] sm:max-w-[32rem] md:w-[36rem] lg:w-[40rem]"
              >
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-end justify-center pb-10">
                  <h3 className="text-3xl sm:text-4xl font-extrabold tracking-wider group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.slug === 'sweatpants' ? '/sweatpants/' : `/shop?category=${encodeURIComponent(category.slug)}`}
                className="group relative overflow-hidden aspect-square hover-scale"
              >
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 flex items-end justify-center pb-8">
                  <h3 className="text-2xl font-bold tracking-wider group-hover:text-accent transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
