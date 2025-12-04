import { useEffect, useState } from "react";
import { ShoppingCart, Search, User, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import breccia from "@/assets/breccia-logo.jpg";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { fetchRecentOrders, type Order, type OrderItem } from "@/lib/orders";

const Navbar = () => {
  const { itemCount } = useCart();
  const [isAdmin, setIsAdmin] = useState(false);
  const [newOrders, setNewOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const newOrdersCount = newOrders.length;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ordersPanelOpen, setOrdersPanelOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const email = data.session?.user?.email || "";
      const adminList = (import.meta.env.VITE_ADMIN_EMAILS || "")
        .split(",")
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean);
      setIsAdmin(Boolean(email) && adminList.includes(email.toLowerCase()));
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || "";
      const adminList = (import.meta.env.VITE_ADMIN_EMAILS || "")
        .split(",")
        .map((e: string) => e.trim().toLowerCase())
        .filter(Boolean);
      setIsAdmin(Boolean(email) && adminList.includes(email.toLowerCase()));
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isAdmin) {
        setNewOrders([]);
        return;
      }
      const orders = await fetchRecentOrders(20);
      if (cancelled) return;
      const requested = orders.filter((o) => o.status === "requested");
      setNewOrders(requested);
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    toast({ title: "Signed out", description: "You are now shopping as a guest." });
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <span className="font-brand tracking-[0.1em]" style={{ fontFamily: 'Bunya, sans-serif' }} >BRECCIA</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium hover:text-accent transition-colors">
            HOME
          </Link>
          <Link to="/shop/" className="text-sm font-medium hover:text-accent transition-colors">
            SHOP
          </Link>
          <Link to="/about/" className="text-sm font-medium hover:text-accent transition-colors">
            ABOUT
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link to="/cart/">
            <Button variant="ghost" size="icon" className="relative hover:text-white">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>
          {isAdmin && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setOrdersPanelOpen((open) => !open)}
              >
                <Bell className="h-5 w-5" />
                {newOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
                    {newOrdersCount}
                  </span>
                )}
              </Button>
              {ordersPanelOpen && (
                <div className="fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 w-auto sm:w-80 max-h-80 overflow-y-auto border border-border bg-background shadow-lg rounded-md p-3 z-50 text-xs sm:text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold tracking-wide uppercase text-[10px] text-muted-foreground">
                      New Orders
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setOrdersPanelOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                  {newOrdersCount === 0 ? (
                    <div className="text-muted-foreground text-xs">
                      No new orders.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {newOrders.map((o: Order & { items: OrderItem[] }) => (
                        <div
                          key={o.id}
                          className="border border-border rounded p-2 bg-card flex flex-col gap-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs">
                              #{o.order_number ?? String(o.id).slice(0, 8)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {o.created_at
                                ? new Date(o.created_at).toLocaleDateString()
                                : ""}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {o.user_email || "guest"}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[11px] font-medium">
                              Total: {o.total != null ? o.total : "-"} EGP
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px]"
                              onClick={() => {
                                setOrdersPanelOpen(false);
                                navigate("/admin/?tab=orders&status=requested");
                              }}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {isAdmin && (
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>
      {/* Mobile panel */}
      <div className={`md:hidden border-t border-border bg-background transition-[max-height,opacity] duration-300 overflow-hidden ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm font-medium hover:text-accent transition-colors">
            HOME
          </Link>
          <Link to="/shop/" onClick={() => setMobileOpen(false)} className="text-sm font-medium hover:text-accent transition-colors">
            SHOP
          </Link>
          <Link to="/about/" onClick={() => setMobileOpen(false)} className="text-sm font-medium hover:text-accent transition-colors">
            ABOUT
          </Link>
          <Link to="/cart/" onClick={() => setMobileOpen(false)} className="text-sm font-medium hover:text-accent transition-colors">
            CART
          </Link>
          {isAdmin && (
            <Button variant="outline" onClick={handleLogout} className="mt-2 w-full">
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
