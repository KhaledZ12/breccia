import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, Truck } from "lucide-react";
import { fetchProducts } from "@/lib/products";
import { STATIC_FILTERS } from "@/constants/filters";
import { formatPrice } from "@/lib/currency";

import type { Product as ProductType } from "@/lib/products";


const colorToCss = (name: string) => {
  const key = name.toLowerCase().replace(/\s+/g, "");
  switch (key) {
    case "darkblue":
      return "#202239";
    case "blue":
      return "#234e9d";
    case "darkred":
      return "#47191c";
    case "red":
      return "#af181d";
    case "mintgreen":
      return "#98ff98";
    case "babyblue":
      return "#119ed6";
    case "pink":
      return "#d46a8f";
    case "kashmir":
      return "#895464";
    case "green":
      return "#004b3b";
    case "petroleum":
      return "#004c7a";
    case "purple":
      return "#4a498b";
    case "fuchsia":
      return "#d1247d";
    case "darkgray":
      return "#2f3439";
    default:
      return name.toLowerCase();
  }
};

const STYLE_OPTIONS = [
  {
    id: "anime",
    label: "Anime",
    image:
      "https://i.postimg.cc/dQd8Nx7f/06.jpg",
  },
  {
    id: "moon",
    label: "Moon",
    image:
      "https://i.postimg.cc/FshX7w3P/3.jpg",
  },
  {
    id: "girls",
    label: "Girls",
    image:
      "https://i.postimg.cc/wTmbV2H6/3.jpg",
  },
  {
    id: "qoutes",
    label: "Qoutes",
    image:
      "https://i.postimg.cc/fywqRnp7/07.jpg",
  },
  {
    id: "basic",
    label: "Basic",
    image:
      "https://i.postimg.cc/Xvf8t9BF/Black.jpg",
  },
];

const Shop = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [uiPriceRange, setUiPriceRange] = useState([0, 200]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sliderMax, setSliderMax] = useState<number>(200);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // applied
  const [selectedCategoryOptions, setSelectedCategoryOptions] = useState<string[]>([]); // UI selections
  const [selectedFits, setSelectedFits] = useState<string[]>([]); // applied
  const [selectedFitOptions, setSelectedFitOptions] = useState<string[]>([]); // UI selections
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]); // applied
  const [selectedStyleOptions, setSelectedStyleOptions] = useState<string[]>([]); // UI selections
  const [selectedColors, setSelectedColors] = useState<string[]>([]); // applied
  const [selectedColorOptions, setSelectedColorOptions] = useState<string[]>([]); // UI selections
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 10;
  const dynamicFilters = useMemo(() => {
    const slug = (value: string) => {
      const s = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      const compact = s.replace(/-/g, "");
      return compact === "sweetpants" ? "sweatpants" : compact;
    };

    // Build a set of available primary colors from all products (by product_color)
    const availableColorSlugs = new Set(
      products
        .map((p) => (p.product_color ? slug(String(p.product_color)) : ""))
        .filter((v) => v)
    );

    return STATIC_FILTERS.map((filter) =>
      filter.id === "color"
        ? {
            ...filter,
            values: filter.values.filter((value: string) =>
              availableColorSlugs.has(slug(value))
            ),
          }
        : filter
    );
  }, [products]);

  // Slug normalizer used across this module
  const toSlug = (value: string) => {
    const s = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    // Compact and normalize common variants
    const compact = s.replace(/-/g, "");
    return compact === 'sweetpants' ? 'sweatpants' : compact;
  };

  const selectedCategory = useMemo(() => {
    const c = searchParams.get("category");
    const s = c ? toSlug(c) : "";
    return s === 'sweetpants' ? 'sweatpants' : s;
  }, [searchParams]);

  const filterDependencies = useMemo(() => ({
    selectedCategories: JSON.stringify(selectedCategories),
    priceRange: JSON.stringify(priceRange),
    selectedFits: JSON.stringify(selectedFits),
    selectedStyles: JSON.stringify(selectedStyles),
    selectedColors: JSON.stringify(selectedColors),
  }), [selectedCategories, priceRange, selectedFits, selectedStyles, selectedColors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDependencies]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
      // Compute max effective (discounted) price to auto-widen the slider and default filter
      const effectivePrices = data.map((p) => {
        const d = Math.max(0, Math.min(100, Number(p.discount_percentage) || 0));
        return d > 0 ? p.price * (1 - d / 100) : p.price;
      });
      const max = Math.max(200, Math.ceil((Math.max(0, ...effectivePrices)) / 50) * 50 || 200);
      setSliderMax(max);
      setUiPriceRange([0, max]);
      setPriceRange([0, max]);
    })();
  }, []);

  // Seed sidebar selected categories from URL on first load
  useEffect(() => {
    if (selectedCategory) {
      // Force only this category to be selected
      setSelectedCategories([selectedCategory]);
      setSelectedCategoryOptions([selectedCategory]);
    }
  }, [selectedCategory]);

  const categoryName = selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : 'All Products';
  const pageTitle = selectedCategory ? `${categoryName} | Shop BRECCIA` : 'Shop | BRECCIA - Premium Streetwear Egypt';
  const pageDescription = selectedCategory 
    ? `Shop ${categoryName} at BRECCIA. Premium streetwear collection. Free shipping over 1499 EGP.`
    : 'Shop premium streetwear at BRECCIA. Browse hoodies, sweatpants, jeans, and more. Bold, minimal, luxury. Free shipping over 1499 EGP.';

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`breccia, shop, ${selectedCategory}, streetwear, egypt, fashion, clothing, premium`} />
        <link rel="canonical" href={`https://breccia-eg.com/shop/${selectedCategory ? `?category=${selectedCategory}` : ''}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://breccia-eg.com/shop/${selectedCategory ? `?category=${selectedCategory}` : ''}`} />
        <meta property="og:type" content="website" />
      </Helmet>
    <main className="min-h-screen">
        {/* Free shipping hint */}
      <div className=" bg-accent/10 text-accent border-b border-border ">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Truck className="h-4 w-4" />
          <span className="font-medium">Free shipping over 1499 EGP</span>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-1 sm:mb-2">SHOP</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {loading
                ? 'Loading…'
                : (() => {
                    const byCategory = selectedCategories.length
                      ? products.filter((p) => {
                          const cat = (p.category || '').toLowerCase();
                          const catSlug = toSlug(p.category || '');
                          return selectedCategories.includes(cat) || selectedCategories.includes(catSlug);
                        })
                      : products;
                    const byPrice = byCategory.filter((p) => {
                      const d = Math.max(0, Math.min(100, Number(p.discount_percentage) || 0));
                      const effective = d > 0 ? p.price * (1 - d / 100) : p.price;
                      return effective >= priceRange[0] && effective <= priceRange[1];
                    });
                    const filtered = byPrice;
                    return `${filtered.length} items`;
                  })()}
            </p>
          </div>
        </div>

        {/* Collections */}
        <section className="mb-10 sm:mb-12">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase mb-3 text-muted-foreground">
            Collections
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {STYLE_OPTIONS.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => navigate(`/collections/${style.id}/`)}
                className="group relative aspect-[4/5] rounded-lg border text-left overflow-hidden transition-all duration-200 flex flex-col border-border bg-muted/40 hover:border-foreground/60 hover:bg-muted"
              >
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={style.image}
                    alt={style.label}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                </div>

                {/* Content overlay */}
                <div className="relative flex-1 flex items-center justify-center px-2">
                  <span className="text-sm sm:text-base font-semibold tracking-wide text-white drop-shadow-md">
                    {style.label}
                  </span>
                </div>
                <div className="relative px-2 py-2 text-[10px] sm:text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center justify-between border-t border-border/60 bg-background/70 backdrop-blur-sm">
                  <span>View collection</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground/70" />
                </div>
              </button>
            ))}
          </div>
        </section>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Choose a collection above to explore hoodies by style.
        </p>
      </div>
    </main>
    </>
  );
};

export default Shop;
