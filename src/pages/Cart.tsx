import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/currency";

const Cart = () => {
  const { items, removeItem, updateQuantity } = useCart();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = items.reduce((sum, item) => {
    if (typeof item.originalPrice === "number" && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some items to get started with your order
          </p>
          <Link to="/shop">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-background">
              Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8 pb-28">
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-10"
        >
          Your Shopping Cart
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 border border-border rounded-lg shadow-sm bg-card hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="w-24 h-28 sm:w-28 sm:h-36 overflow-hidden rounded-md bg-muted">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm sm:text-base line-clamp-2">
                      {item.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="hover:text-destructive text-muted-foreground"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-muted-foreground line-through text-xs">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                    <span className="font-bold text-base">{formatPrice(item.price)}</span>
                  </div>

                  {item.size && (
                    <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                  )}

                  {/* Quantity Controls */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 rounded-none hover:bg-muted/70"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="px-3 font-medium select-none text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 rounded-none hover:bg-muted/70"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden lg:block"
          >
            <OrderSummary total={total} savings={savings} />
          </motion.div>
        </div>

        {/* Order Summary Mobile */}
        <div className="lg:hidden mt-6">
          <OrderSummary total={total} savings={savings} />
        </div>
      </div>

      {/* Sticky Mobile Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-4 flex justify-between items-center shadow-xl z-[50]">
        <div className="font-bold text-lg">{formatPrice(total + (total >= 1499 ? 0 : 60))}</div>
        <Link to="/checkout">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-background">
            Checkout
          </Button>
        </Link>
      </div>
    </main>
  );
};

const OrderSummary = ({ total, savings }) => {
  const shippingCost = total >= 1499 ? 0 : 60;
  const grandTotal = total + shippingCost;
  return (
    <div className="border border-border rounded-lg p-6 shadow-md bg-card">
      <h2 className="text-xl sm:text-2xl font-bold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>

        {savings > 0 && (
          <div className="flex justify-between text-green-600 text-base">
            <span>You saved</span>
            <span>-{formatPrice(savings)}</span>
          </div>
        )}

        <div className="flex justify-between text-base">
          <span className="text-muted-foreground">Shipping</span>
          <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(grandTotal)}</span>
          </div>
        </div>
      </div>

      <Link to="/checkout">
        <Button className="w-full bg-accent hover:bg-accent/90 text-background" size="lg">
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  );
};

export default Cart;
