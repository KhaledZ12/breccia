import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/categories";

const Categories = () => {
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
    <main className="min-h-screen bg-background py-12 sm:py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Categories</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Streetwear Collections</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-lg border border-border" />)
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/shop?category=${c.slug}`}
                className="group block relative overflow-hidden rounded-lg border border-border hover:border-accent transition-all duration-300"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={c.image_url}
                    alt={c.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 group-hover:text-accent transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 hidden sm:block">Explore {c.name}</p>
                  <span className="inline-flex items-center text-xs sm:text-sm font-medium text-accent">
                    Shop
                    <svg className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Categories;
