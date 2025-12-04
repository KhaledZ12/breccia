import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/currency";
import { SizeSelectionDialog } from "@/components/SizeSelectionDialog";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  discountPercentage?: number | null;
  inStock?: boolean | null;
}

// Define UIProduct interface for the dialog
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
}

const ProductCard = ({ id, name, price, image, images, category, discountPercentage = 0, inStock = true }: ProductCardProps) => {
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const discount = Math.max(0, Math.min(100, Number(discountPercentage) || 0));
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const imgs = (images && images.length > 0 ? images : [image]).filter(Boolean);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (imgs.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % imgs.length);
    }, 2500);
    return () => clearInterval(t);
  }, [imgs.length]);

  const handleAdd = () => {
    if (inStock === false) return;
    // Open size selection dialog
    setSizeDialogOpen(true);
  };

  // Create UIProduct object for the dialog
  const uiProduct: UIProduct = {
    id,
    name,
    price,
    image_url: image,
    image_url_2: images?.[1] || null,
    image_url_3: images?.[2] || null,
    image_url_4: images?.[3] || null,
    image_url_5: images?.[4] || null,
    category,
    discount_percentage: discountPercentage,
    in_stock: inStock,
  };
  return (
    <div className="group relative overflow-hidden bg-card border border-border hover:border-accent transition-all duration-300 rounded-lg h-full flex flex-col">
      {/* Image Container */}
      <Link to={`/product/${id}`} className="block relative h-[340px] sm:aspect-[3/4] overflow-hidden">
        <div className="w-full h-full relative group-hover:brightness-110 transition-all duration-300">
          {imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        {inStock === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-2 py-1 text-[10px] sm:text-xs font-bold rounded">OUT OF STOCK</span>
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 text-[10px] sm:text-xs font-extrabold tracking-wider rounded shadow">
            -{discount}%
          </div>
        )}
        
        {/* Overlay on Hover - Hidden on mobile */}
        <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center gap-2 hidden sm:flex">
          <Button variant="hero" size="sm">
            VIEW
          </Button>
        </div>


        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-background/80 text-foreground px-2 py-1 text-[10px] sm:text-xs font-bold tracking-wider rounded border border-border">
          {category.toUpperCase()}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <div>
          <Link to={`/product/${id}`} className="hover:text-accent transition-colors">
            <h3 className="font-semibold text-xs sm:text-sm tracking-tight line-clamp-2">{name}</h3>
          </Link>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col leading-tight">
            {discount > 0 && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(price)}</span>
            )}
            <p className="text-sm sm:text-base font-bold font-mono [font-variant-numeric:tabular-nums]">{formatPrice(finalPrice)}</p>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-1 text-xs sm:text-sm w-full sm:w-auto h-8"
            onClick={handleAdd}
            disabled={inStock === false}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{inStock === false ? 'OUT' : 'ADD'}</span>
            <span className="sm:hidden">{inStock === false ? 'Out' : 'Add'}</span>
          </Button>
        </div>
      </div>
      
      {/* Size Selection Dialog */}
      <SizeSelectionDialog
        open={sizeDialogOpen}
        onOpenChange={setSizeDialogOpen}
        product={uiProduct}
        quantity={1}
        selectedColorIndex={null}
      />
    </div>
  );
};

export default ProductCard;
