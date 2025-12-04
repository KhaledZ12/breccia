import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Truck, ChevronLeft, SlidersHorizontal } from "lucide-react";
import { fetchProducts, type Product as ProductType } from "@/lib/products";
import { STATIC_FILTERS } from "@/constants/filters";
import { formatPrice } from "@/lib/currency";

const STYLE_OPTIONS = [
  { id: "anime", label: "Anime" },
  { id: "moon", label: "Moon" },
  { id: "girls", label: "Girls" },
  { id: "qoutes", label: "Qoutes" },
  { id: "basic", label: "Basic" },
];

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

const toSlug = (value: string) => {
  const s = value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const compact = s.replace(/-/g, "");
  return compact === "sweetpants" ? "sweatpants" : compact;
};

const findCollectionLabel = (id: string | undefined) => {
  if (!id) return "Collection";
  const found = STYLE_OPTIONS.find((s) => s.id === id);
  return found ? found.label : id.charAt(0).toUpperCase() + id.slice(1);
};

const CollectionPage = () => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showFilters, setShowFilters] = useState(false);
  const [uiPriceRange, setUiPriceRange] = useState([0, 200]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sliderMax, setSliderMax] = useState<number>(200);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCategoryOptions, setSelectedCategoryOptions] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>([]);
  const [selectedFitOptions, setSelectedFitOptions] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedColorOptions, setSelectedColorOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);

      const effectivePrices = data.map((p) => {
        const d = Math.max(0, Math.min(100, Number(p.discount_percentage) || 0));
        return d > 0 ? p.price * (1 - d / 100) : p.price;
      });
      const max = Math.max(
        200,
        Math.ceil((Math.max(0, ...effectivePrices)) / 50) * 50 || 200
      );
      setSliderMax(max);
      setUiPriceRange([0, max]);
      setPriceRange([0, max]);
    })();
  }, []);

  const collectionLabel = findCollectionLabel(collectionId);

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

  const filterDependencies = useMemo(
    () => ({
      selectedCategories: JSON.stringify(selectedCategories),
      priceRange: JSON.stringify(priceRange),
      selectedFits: JSON.stringify(selectedFits),
      selectedColors: JSON.stringify(selectedColors),
    }),
    [selectedCategories, priceRange, selectedFits, selectedColors]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterDependencies, collectionId]);

  const baseCollectionProducts = useMemo(() => {
    if (!collectionId) return [] as ProductType[];
    return products.filter((p) => {
      const styleSlug = p.style ? toSlug(String(p.style)) : "";
      return styleSlug === collectionId;
    });
  }, [products, collectionId]);

  const pageTitle = `${collectionLabel} Collection | BRECCIA`;
  const pageDescription = `Shop the ${collectionLabel} collection at BRECCIA. Premium hoodies and streetwear. Free shipping over 1499 EGP.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`breccia, ${collectionLabel.toLowerCase()}, collection, streetwear, egypt, fashion, clothing, premium`}
        />
        <link
          rel="canonical"
          href={`https://breccia-eg.com/collections/${collectionId || ""}/`}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta
          property="og:url"
          content={`https://breccia-eg.com/collections/${collectionId || ""}/`}
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <main className="min-h-screen">
        <div className=" bg-accent/10 text-accent border-b border-border ">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
            <Truck className="h-4 w-4" />
            <span className="font-medium">Free shipping over 1499 EGP</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          <nav className="mb-4 sm:mb-6">
            <Link
              to="/shop/"
              className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </nav>

          <header className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">
                Collection
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {collectionLabel}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                {loading
                  ? "Loading…"
                  : `${baseCollectionProducts.length} item${baseCollectionProducts.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              FILTER
            </Button>
          </header>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[200px] sm:h-[240px] bg-muted animate-pulse rounded"
                />
              ))}
            </div>
          ) : baseCollectionProducts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No products found in this collection.
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Sidebar / Drawer Filters */}
              <aside
                className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-56 space-y-4 sm:space-y-6`}
              >
                <>
                  {dynamicFilters
                    .filter((filter) =>
                      filter.id !== "style" &&
                      filter.id !== "color" &&
                      filter.id !== "category"
                    )
                    .map((filter) => (
                      <div key={filter.id}>
                        <h3 className="font-bold mb-3 tracking-wider text-xs uppercase">
                          {filter.name}
                        </h3>
                        {filter.type === "price_range" ? (
                          <div>
                            <Slider
                              defaultValue={[0, 200]}
                              max={sliderMax}
                              step={10}
                              value={uiPriceRange}
                              onValueChange={setUiPriceRange}
                              className="mb-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{formatPrice(uiPriceRange[0])}</span>
                              <span>{formatPrice(uiPriceRange[1])}</span>
                            </div>
                          </div>
                        ) : filter.type === "size" ? (
                          <div className="grid grid-cols-3 gap-2">
                            {filter.values.map((value: string) => (
                              <div key={value} className="flex items-center space-x-1">
                                <Checkbox id={`${filter.id}-${value}`} />
                                <Label
                                  htmlFor={`${filter.id}-${value}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {value}
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filter.values.map((value: string) => {
                              const valueSlug = toSlug(value);
                              const checked =
                                filter.id === "fit"
                                  ? selectedFitOptions.includes(valueSlug)
                                  : false;
                              const isColorFilter = false;
                              return (
                                <div key={value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${filter.id}-${value}`}
                                    checked={checked}
                                    onCheckedChange={(v) => {
                                      if (filter.id === "fit") {
                                        setSelectedFitOptions((prev) => {
                                          const next = new Set(prev);
                                          if (v) next.add(valueSlug);
                                          else next.delete(valueSlug);
                                          return Array.from(next);
                                        });
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`${filter.id}-${value}`}
                                    className="text-xs cursor-pointer flex items-center gap-2"
                                  >
                                    {isColorFilter && (
                                      <span
                                        className="w-3 h-3 rounded-full border border-border"
                                        style={{ backgroundColor: colorToCss(value) }}
                                      />
                                    )}
                                    <span>{value}</span>
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  <Button
                    variant="default"
                    className="w-full text-xs"
                    onClick={() => {
                      const normalized = selectedCategoryOptions.map((v) =>
                        v === "sweetpants" ? "sweatpants" : v
                      );
                      setSelectedCategories(normalized);
                      setSelectedFits(selectedFitOptions);
                      setSelectedColors(selectedColorOptions);
                      setPriceRange(uiPriceRange as [number, number]);
                      setShowFilters(false);
                    }}
                  >
                    APPLY
                  </Button>
                </>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {(() => {
                  const byCollection = baseCollectionProducts;
                  const byCategory = selectedCategories.length
                    ? byCollection.filter((p) => {
                        const catSlug = toSlug(p.category || "");
                        return selectedCategories.includes(catSlug);
                      })
                    : byCollection;
                  const byPrice = byCategory.filter((p) => {
                    const d = Math.max(
                      0,
                      Math.min(100, Number(p.discount_percentage) || 0)
                    );
                    const effective = d > 0 ? p.price * (1 - d / 100) : p.price;
                    return (
                      effective >= priceRange[0] && effective <= priceRange[1]
                    );
                  });
                  const byFit = selectedFits.length
                    ? byPrice.filter((p) => {
                        let fit = p.fit ? toSlug(String(p.fit)) : "";
                        if (/^over-?size(d)?$/.test(fit)) fit = "oversized";
                        return selectedFits.includes(fit);
                      })
                    : byPrice;
                  const byColor = selectedColors.length
                    ? byFit.filter((p) => {
                        const primaryColorSlug = p.product_color
                          ? toSlug(String(p.product_color))
                          : "";
                        return primaryColorSlug
                          ? selectedColors.includes(primaryColorSlug)
                          : false;
                      })
                    : byFit;

                  // Show every product after filters; do not group designs by category/fit/style
                  const filtered: ProductType[] = byColor;

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center text-muted-foreground col-span-full">
                        No items match your selection.
                      </div>
                    );
                  }

                  const indexOfLastItem = currentPage * itemsPerPage;
                  const currentItems = filtered.slice(0, indexOfLastItem);
                  const hasMore = indexOfLastItem < filtered.length;

                  return (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        {currentItems.map((p) => (
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
                            inStock={p.in_stock ?? true}
                          />
                        ))}
                      </div>
                      {hasMore && (
                        <div className="mt-6 text-center">
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                            className="px-8"
                          >
                            Show More
                          </Button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default CollectionPage;
