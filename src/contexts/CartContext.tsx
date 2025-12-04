import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: string;
  productId?: string; // real product UUID for orders
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  originalPrice?: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("breccia-cart");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("breccia-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((current) => {
      const existing = current.find((i) => i.id === item.id);
      if (existing) {
        toast({
          title: "Updated cart",
          description: `Quantity updated for ${item.name}`,
        });
        return current.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
      return [...current, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
