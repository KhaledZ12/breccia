import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

// Define the UIProduct interface locally since it's not exported from ProductDetail
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

interface SizeSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: UIProduct;
  quantity: number;
  selectedColorIndex: number | null;
}

const availableSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];

export const SizeSelectionDialog = ({
  open,
  onOpenChange,
  product,
  quantity,
  selectedColorIndex,
}: SizeSelectionDialogProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast({
        title: "Size required",
        description: "Please select a size to continue",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);

    try {
      const discount = Math.max(0, Math.min(100, Number(product.discount_percentage) || 0));
      const finalPrice = discount > 0 ? (product.price * (1 - discount / 100)) : product.price;
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

      // Reset and close
      setSelectedSize("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedSize("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Select Size</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-16 h-16 object-cover rounded-md"
            />
            <div className="flex-1">
              <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Quantity: {quantity}
                </Badge>
                {selectedColorIndex !== null && product.colors?.[selectedColorIndex] && (
                  <Badge variant="outline" className="text-xs">
                    {product.colors[selectedColorIndex]}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Choose Size</label>
            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="h-12 font-medium"
                  disabled={isAdding}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAdding}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToCart}
              disabled={!selectedSize || isAdding}
              className="flex-1"
            >
              {isAdding ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
