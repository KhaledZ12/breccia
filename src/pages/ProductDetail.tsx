import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Truck, Shield, RotateCcw, ChevronLeft, Share, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchProductById, findProductVariant, fetchAvailableFits } from "@/lib/products";
import { fetchSizeChartBySlug, type SizeChart } from "@/lib/sizeCharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

interface UIProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image_url_2?: string | null;
  image_url_3?: string | null;
  image_url_4?: string | null;
  image_url_5?: string | null;
  category: string;
  description?: string | null;
  size_chart_slug?: string | null;
  fit?: string | null;
  style?: string | null;
  discount_percentage?: number | null;
  in_stock?: boolean;
  colors?: string[] | null;
  product_color?: string | null;
  available_sizes?: string[] | null;
}

// Type guard to check if product is in stock
function isInStock(product: UIProduct): product is UIProduct & { in_stock: true } {
  return product.in_stock === true;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const [product, setProduct] = useState<UIProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeChart, setSizeChart] = useState<SizeChart | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [availableFits, setAvailableFits] = useState<{ id: string; fit: string }[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const thumbsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const data = await fetchProductById(id);
      setProduct(data as UIProduct | null);
      setLoading(false);
    })();
  }, [id]);

  // Default selected color based on primary product_color if present,
  // otherwise fall back to the first available color. This only controls
  // which color pill is highlighted; images are not tied to color index.
  useEffect(() => {
    if (!product || !Array.isArray(product.colors) || product.colors.length === 0) return;

    let idx = -1;
    if (product.product_color) {
      idx = product.colors.findIndex((c) => c === product.product_color);
    }
    if (idx < 0) idx = 0;

    setSelectedColorIndex(idx);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    (async () => {
      if (product.name) {
        const fits = await fetchAvailableFits({
          name: product.name,
          product_color: product.product_color,
        });
        // Sort fits to ensure consistent order (e.g. Regular, Oversized)
        // You might want a specific order, for now alphabetical or DB order
        setAvailableFits(fits);
      }
    })();
  }, [product]);

  const openSizeChart = async () => {
    if (!product?.size_chart_slug) return;
    const sc = await fetchSizeChartBySlug(product.size_chart_slug);
    setSizeChart(sc);
    setSizeChartOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground">Loading product…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop">
            <Button variant="default">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const shareData = {
      title: productTitle,
      text: productDescription,
      url: productUrl
    };

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Product shared",
          description: "Thanks for sharing!",
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(productUrl);
        toast({
          title: "Link copied",
          description: "Product link copied to clipboard!",
        });
      }
    } catch (error) {
      // User cancelled sharing or clipboard failed
      if (error instanceof Error && error.name !== 'AbortError') {
        toast({
          title: "Share failed",
          description: "Unable to share product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddToCart = () => {
    if (product && !isInStock(product)) {
      toast({
        title: "Out of stock",
        description: "This product is currently unavailable.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedSize) {
      toast({
        title: "Please select a size",
        description: "Choose a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    const discount = Math.max(0, Math.min(100, Number(product?.discount_percentage) || 0));
    const finalPrice = discount > 0 ? (product!.price * (1 - discount / 100)) : product!.price;
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const selectedColor = selectedColorIndex != null && colors[selectedColorIndex]
      ? colors[selectedColorIndex]
      : undefined;
    addItem({
      id: `${product.id}-${selectedColor || 'default'}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: finalPrice,
      originalPrice: discount > 0 ? product.price : undefined,
      quantity,
      image: product.image_url,
      size: selectedSize,
      color: selectedColor,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} (${selectedSize})`,
    });
  };

  const discount = Math.max(0, Math.min(100, Number(product?.discount_percentage) || 0));
  const finalPrice = discount > 0 ? (product.price * (1 - discount / 100)) : product.price;
  const productTitle = `${product.name} | BRECCIA`;
  const productDescription = product.description || `Shop ${product.name} at BRECCIA. Premium ${product.category} streetwear. ${discount > 0 ? `Save ${discount}%` : ''} Free shipping over 1499 EGP.`;
  const productImage = product.image_url || 'https://breccia-eg.com/og-image.png';
  const productUrl = `https://breccia-eg.com/product/${product.id}`;

  return (
    <>
      <Helmet>
        <title>{productTitle}</title>
        <meta name="description" content={productDescription} />
        <meta name="keywords" content={`breccia, ${product.name}, ${product.category}, streetwear, egypt, fashion, clothing, premium`} />
        <link rel="canonical" href={productUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={productTitle} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:url" content={productUrl} />
        <meta property="product:price:amount" content={finalPrice.toFixed(2)} />
        <meta property="product:price:currency" content="EGP" />
        <meta property="product:availability" content={product.in_stock ? "in stock" : "out of stock"} />
        <meta property="product:category" content={product.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={productTitle} />
        <meta name="twitter:description" content={productDescription} />
        <meta name="twitter:image" content={productImage} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": productDescription,
            "image": productImage,
            "brand": {
              "@type": "Brand",
              "name": "BRECCIA"
            },
            "offers": {
              "@type": "Offer",
              "url": productUrl,
              "priceCurrency": "EGP",
              "price": finalPrice.toFixed(2),
              "availability": product.in_stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "BRECCIA"
              }
            },
            "category": product.category
          })}
        </script>
      </Helmet>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12 pb-28 md:pb-8">
          {/* Breadcrumb */}
          <nav className="mb-6 sm:mb-8">
            <Link to="/shop" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Shop
            </Link>
          </nav>

          {/* Category Badge at top */}
          <div className="max-w-6xl mx-auto mb-3 sm:mb-4">
            <Badge variant="secondary" className="text-xs font-medium tracking-wider px-3 py-1">
              {product.category.toUpperCase()}
            </Badge>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 max-w-6xl mx-auto">
            <div className="order-1">
              {(() => {
                const images = [
                  product.image_url,
                  product.image_url_2,
                  product.image_url_3,
                  product.image_url_4,
                  product.image_url_5
                ].filter((img): img is string => Boolean(img));
                const idx = Math.min(activeImageIndex, Math.max(0, images.length - 1));
                return (
                  <div className="space-y-3">
                    <div className="relative group p-1 sm:p-2 bg-card rounded-xl sm:rounded-2xl border border-border shadow-sm">
                      <div className="aspect-[4/5] overflow-hidden bg-muted rounded-lg sm:rounded-xl">
                        <img
                          src={images[idx]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="eager"
                        />
                      </div>
                      {(() => {
                        const d = Math.max(0, Math.min(100, Number(product.discount_percentage) || 0)); return d > 0 ? (
                          <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-2.5 py-1 sm:px-3 text-xs font-extrabold tracking-wider rounded shadow">
                            -{d}%
                          </div>
                        ) : null;
                      })()}
                      {images.length > 1 && (
                        <>
                          <button
                            aria-label="Previous image"
                            onClick={() => setActiveImageIndex((i) => (i - 1 + images.length) % images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/90 hover:bg-background border border-border shadow flex items-center justify-center backdrop-blur transition active:scale-95"
                          >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                          <button
                            aria-label="Next image"
                            onClick={() => setActiveImageIndex((i) => (i + 1) % images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-background/90 hover:bg-background border border-border shadow flex items-center justify-center backdrop-blur transition active:scale-95"
                          >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                          </button>
                        </>
                      )}
                    </div>
                    {images.length > 1 && (
                      <div className="flex justify-center">
                        <div className="flex gap-2 sm:gap-3 overflow-x-auto p-2 sm:p-3 bg-card rounded-lg sm:rounded-xl border border-border scroll-smooth" ref={thumbsRef}>
                          {images.map((src, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImageIndex(i)}
                              aria-label={`Show image ${i + 1}`}
                              className={`relative h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-md sm:rounded-lg overflow-hidden border shrink-0 transition active:scale-95 ${i === idx ? 'border-accent ring-2 ring-accent' : 'border-border hover:border-foreground/40'}`}
                            >
                              <img src={src} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="order-2 space-y-4 sm:space-y-5">
              {/* Header Section */}
              <div className="space-y-2 sm:space-y-3">
                {/* Title & Price */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {(() => {
                      const d = Math.max(0, Math.min(100, Number(product.discount_percentage) || 0));
                      const finalPrice = d > 0 ? product.price * (1 - d / 100) : product.price;
                      return (
                        <>
                          {d > 0 && (
                            <span className="text-base sm:text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
                          )}
                          <span className="text-xl sm:text-2xl font-bold text-foreground">{formatPrice(finalPrice)}</span>
                        </>
                      );
                    })()}
                    {product.size_chart_slug && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openSizeChart}
                        className="text-xs font-medium h-8 px-3"
                      >
                        Size Guide
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDetailsOpen(true)}
                      className="h-8 w-8 rounded-full"
                      title="Product Details & Care"
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-accent/10 text-accent rounded-md px-3 py-2 inline-flex items-center gap-2 text-xs sm:text-sm">
                    <Truck className="h-4 w-4 shrink-0" />
                    <span className="font-medium">Free shipping over 1499 EGP</span>
                  </div>
                </div>
              </div>

              <Separator className="my-3 sm:my-4" />

              {/* Description */}
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>

              {/* Product Options */}
              <div className="space-y-4">
                {Array.isArray(product.colors) && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground block">
                      Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {product.colors.map((color, index) => {
                        const selected = selectedColorIndex === index;
                        return (
                          <button
                            key={color + index}
                            type="button"
                            onClick={async () => {
                              if (!product) return;
                              setSelectedColorIndex(index);

                              // If this is already the current product color, no navigation needed
                              if (product.product_color && color === product.product_color) {
                                return;
                              }

                              const variant = await findProductVariant({
                                category: product.category,
                                product_color: color,
                                fit: product.fit ?? null,
                                style: product.style ?? null,
                              });

                              if (variant) {
                                navigate(`/product/${variant.id}`);
                              } else {
                                toast({
                                  title: "Color not available",
                                  description: "This color variant is not available for this product.",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-all active:scale-95 ${selected ? "border-accent bg-accent/10" : "border-border bg-background"
                              }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-border shrink-0"
                              style={{ backgroundColor: colorToCss(color) }}
                            />
                            <span>{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {/* Fit Selection */}
                {availableFits.length > 1 && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground block">
                      Fit
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {availableFits.map((fitItem) => (
                        <Button
                          key={fitItem.id}
                          variant={product.fit === fitItem.fit ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (product.id !== fitItem.id) {
                              navigate(`/product/${fitItem.id}`);
                            }
                          }}
                          className="min-w-[80px] h-9 font-medium text-sm active:scale-95 transition-transform capitalize"
                        >
                          {fitItem.fit}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground block">
                    Size
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => {
                      const isAvailable = !product.available_sizes || product.available_sizes.length === 0 || product.available_sizes.includes(size);
                      return (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setSelectedSize(size)}
                          className={`min-w-[64px] h-11 font-medium text-sm transition-transform ${isAvailable ? "active:scale-95" : "opacity-50 cursor-not-allowed relative overflow-hidden"
                            }`}
                        >
                          {size}
                          {!isAvailable && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-full h-[1px] bg-destructive rotate-45 absolute" />
                              <div className="w-full h-[1px] bg-destructive -rotate-45 absolute" />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>



                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full active:scale-95 transition-transform"
                    >
                      -
                    </Button>
                    <span className="font-semibold text-base w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full active:scale-95 transition-transform"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="space-y-3 hidden md:block">
                <Button
                  size="lg"
                  className="w-full h-12 text-sm font-semibold gap-2"
                  onClick={handleAddToCart}
                  disabled={product ? !isInStock(product) : true}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {product && !isInStock(product) ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-9" onClick={handleShare}>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Size Chart Dialog */}
              <Dialog open={sizeChartOpen} onOpenChange={setSizeChartOpen}>
                <DialogContent aria-describedby={undefined} className="p-2 sm:p-6 max-w-[80vw] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xs sm:text-xl">{sizeChart?.title || "Size Chart"}</DialogTitle>
                  </DialogHeader>
                  <div className="prose-invert max-w-none whitespace-pre-wrap text-[11px] sm:text-base leading-snug sm:leading-relaxed prose-li:my-1 sm:prose-li:my-2 prose-p:my-1 sm:prose-p:my-2 prose-th:text-[11px] sm:prose-th:text-base prose-td:text-[11px] sm:prose-td:text-base prose-img:max-w-full">
                    {sizeChart?.content || "No size chart available."}
                  </div>
                </DialogContent>
              </Dialog>

              {/* Features */}
              <div className="bg-muted/20 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm">Cash on Delivery</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">Terms & Conditions apply</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm">Easy Returns</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">7-day</p>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    </div>
                    <p className="font-semibold text-xs sm:text-sm">Secure</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">SSL</p>
                  </div>
                </div>
              </div>

              {/* Details & Care Dialog */}
              <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Product Details & Care</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Category</span>
                          <p className="font-medium">{product.category}</p>
                        </div>
                        {product.fit && (
                          <div>
                            <span className="text-muted-foreground">Fit</span>
                            <p className="font-medium">{product.fit}</p>
                          </div>
                        )}
                        {product.style && (
                          <div>
                            <span className="text-muted-foreground">Style</span>
                            <p className="font-medium">{product.style}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Stock</span>
                          {product && !isInStock(product) ? (
                            <p className="font-medium text-red-600">Out of Stock</p>
                          ) : (
                            <p className="font-medium text-green-600">Available</p>
                          )}
                        </div>
                        <div>
                          <span className="text-muted-foreground">SKU</span>
                          <p className="font-medium text-muted-foreground">#{product.id.slice(0, 6)}</p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Care Instructions</h4>
                      <p className="text-sm text-muted-foreground">Machine wash cold, tumble dry low.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {(() => {
            const d = Math.max(0, Math.min(100, Number(product.discount_percentage) || 0));
            const finalPrice = d > 0 ? product.price * (1 - d / 100) : product.price;
            return (
              <div className="fixed bottom-0 inset-x-0 md:hidden bg-background border-t border-border shadow-lg z-50">
                <div className="container mx-auto p-3">
                  <div className="flex items-center gap-2">
                    {/* Price Section */}
                    <div className="flex-1 min-w-0">
                      {d > 0 && (
                        <div className="text-[10px] text-muted-foreground line-through leading-tight">{formatPrice(product.price)}</div>
                      )}
                      <div className="text-base font-bold truncate">{formatPrice(finalPrice)}</div>
                    </div>

                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 w-11 p-0 shrink-0 rounded-lg"
                      onClick={handleShare}
                    >
                      <Share className="h-4 w-4" />
                    </Button>

                    {/* Add to Cart Button */}
                    <Button
                      size="sm"
                      className="h-11 px-5 flex-1 font-semibold text-sm gap-2 rounded-lg"
                      onClick={handleAddToCart}
                      disabled={product ? !isInStock(product) : true}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {product && !isInStock(product) ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </main>
    </>
  );
}
  ;

export default ProductDetail;