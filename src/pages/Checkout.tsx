import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { sendOrderConfirmationEmail } from "@/lib/emailjs";

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState("standard");

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    address: "",
    city: "",
    postalCode: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  const trimAll = (obj: typeof formData) => ({
    email: obj.email.trim(),
    name: obj.name.trim(),
    address: obj.address.trim(),
    city: obj.city.trim(),
    postalCode: obj.postalCode.trim(),
    phone: obj.phone.trim(),
  });

  const validate = (obj: typeof formData) => {
    const e: Partial<Record<keyof typeof formData, string>> = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    const nameRe = /^[\p{L}\s]{2,60}$/u; // letters (any language) and spaces only
    const addressMinLen = 8;
    const cityRe = /^[\p{L}\s]{2,40}$/u;
    const postalRe = /^[A-Za-z0-9\-\s]{3,10}$/;
    // Egyptian mobile or E.164-like +20
    const phoneRe = /^(\+?20)?01[0-2,5]\d{8}$/;
    if (!emailRe.test(obj.email)) e.email = "Enter a valid email address";
    if (!nameRe.test(obj.name)) e.name = "Name should be 2–60 letters";
    if (obj.address.length < addressMinLen) e.address = "Address should be at least 8 characters";
    if (!cityRe.test(obj.city)) e.city = "City should be 2–40 letters";
    if (obj.postalCode && !postalRe.test(obj.postalCode)) e.postalCode = "Enter a valid postal code (3–10 chars)";
    if (!phoneRe.test(obj.phone)) e.phone = "Enter a valid Egyptian phone (e.g. 01X########)";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sanitize and validate
      const sanitized = trimAll(formData);
      setFormData(sanitized);
      const v = validate(sanitized);
      if (Object.keys(v).length > 0) {
        setErrors(v);
        setLoading(false);
        toast({ title: "Check your details", description: "Please fix the highlighted fields.", variant: "destructive" });
        return;
      }
      setErrors({});
      const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const invalid = items.find((i) => !i.productId || !isUuid(i.productId));
      if (invalid) {
        setLoading(false);
        toast({
          title: "Unable to place order",
          description: "Some cart items are missing product IDs. Please remove and re-add them from the product page, then try again.",
          variant: "destructive",
        });
        return;
      }
      const userEmail = formData.email ? formData.email : null;
      const itemsPayload = items.map((i) => ({
        product_id: i.productId as string,
        product_name: i.name,
        unit_price: i.price,
        quantity: i.quantity,
        image_url: i.image,
      }));

      const shippingCost = total >= 1499 ? 0 : 60;
      const orderTotal = total + shippingCost;

      const res = await createOrder({
        user_email: userEmail,
        items: itemsPayload,
        total: orderTotal,
        // Use 'requested' so new orders appear in admin notifications and Requested tab
        status: "requested",
        shipping_name: sanitized.name,
        shipping_address: sanitized.address,
        shipping_city: sanitized.city,
        shipping_postal_code: sanitized.postalCode || null,
        shipping_phone: sanitized.phone,
      });

      if (!res.ok || !res.id) {
        throw new Error(res.error || "Order creation failed");
      }

      const itemsSummary = items
        .map((i) => `• ${i.name} x ${i.quantity} – ${formatPrice(i.price * i.quantity)}`)
        .join("\n");

      const orderNo = res.orderNumber !== undefined ? res.orderNumber : undefined;

      sendOrderConfirmationEmail({
        // EmailJS core
        to_email: formData.email,
        // Template variables matching your HTML
        customer_name: formData.name || "Customer",
        order_id: res.id,
        order_number: orderNo !== undefined ? String(orderNo) : res.id.substring(0, 8).toUpperCase(),
        order_total: orderTotal.toFixed(2),
        order_items_markdown: itemsSummary,
        whatsapp_number: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || "201013827705",
        year: String(new Date().getFullYear()),
      }).catch(() => {});

      clearCart();
      navigate(`/order-success?orderId=${res.id}&total=${orderTotal.toFixed(2)}${orderNo !== undefined ? `&orderNumber=${orderNo}` : ''}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Checkout failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Checkout failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = total >= 1499 ? 0 : 60;
  const savings = items.reduce((sum, item) => {
    if ('originalPrice' in item && typeof item.originalPrice === 'number' && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const finalTotal = total + shippingCost;

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:py-20 text-sm md:text-base">
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg md:text-3xl font-bold mb-8 md:mb-12"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-border rounded-lg p-4 md:p-6"
              >
                <h2 className="text-base md:text-2xl font-bold mb-4 md:mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (for order confirmation)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                      autoComplete="email"
                      inputMode="email"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && <p id="email-error" className="text-xs text-red-600">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, name: e.target.value.trim() })}
                      autoComplete="name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      required
                    />
                    {errors.name && <p id="name-error" className="text-xs text-red-600">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, address: e.target.value.trim() })}
                      autoComplete="street-address"
                      aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? 'address-error' : undefined}
                      required
                    />
                    {errors.address && <p id="address-error" className="text-xs text-red-600">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        onBlur={(e) => setFormData({ ...formData, city: e.target.value.trim() })}
                        autoComplete="address-level2"
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? 'city-error' : undefined}
                        required
                      />
                      {errors.city && <p id="city-error" className="text-xs text-red-600">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        onBlur={(e) => setFormData({ ...formData, postalCode: e.target.value.trim() })}
                        inputMode="numeric"
                        autoComplete="postal-code"
                        aria-invalid={!!errors.postalCode}
                        aria-describedby={errors.postalCode ? 'postal-error' : undefined}
                      />
                      {errors.postalCode && <p id="postal-error" className="text-xs text-red-600">{errors.postalCode}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      onBlur={(e) => setFormData({ ...formData, phone: e.target.value.trim() })}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="01XXXXXXXXX"
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                      required
                    />
                    {errors.phone && <p id="phone-error" className="text-xs text-red-600">{errors.phone}</p>}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="border border-border rounded-lg p-4 md:p-6"
              >
                <h2 className="text-base md:text-2xl font-bold mb-4 md:mb-6">Shipping</h2>
                <div className="p-3 md:p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Flat Rate</div>
                      <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">60 EGP — Free over 1499 EGP</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <Button
                type="submit"
                className="hidden lg:block w-full bg-accent hover:bg-accent/90 text-background"
                size="lg"
                disabled={loading}
              >
                {loading ? "Processing..." : "Complete Order"}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="border border-border rounded-lg p-4 md:p-6 sticky top-24 text-sm md:text-base">
              <h2 className="text-base md:text-2xl font-bold mb-4 md:mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {item.name}
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      </p>
                      {'originalPrice' in item && typeof item.originalPrice === 'number' && item.originalPrice > item.price ? (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground line-through font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">{formatPrice(item.originalPrice * item.quantity)}</p>
                          <p className="text-sm md:text-base font-semibold font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-sm md:text-base font-semibold font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">{formatPrice(item.price * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">{formatPrice(total)}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You saved</span>
                    <span className="text-sm md:text-base font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">-{formatPrice(savings)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-sm md:text-base font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                  <span>Total</span>
                  <span className="text-sm md:text-base font-mono [font-variant-numeric:tabular-nums] break-all md:break-normal">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile-only Complete Order button after Order Summary */}
          <div className="lg:hidden">
            <Button
              type="submit"
              form="checkout-form"
              className="w-full bg-accent hover:bg-accent/90 text-background mt-6"
              size="lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "Complete Order"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;

