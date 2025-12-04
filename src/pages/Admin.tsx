import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createProduct, fetchProducts, updateProduct, deleteProduct, type Product } from "@/lib/products";
import { fetchCategories, createCategory, deleteCategory, updateCategory, type Category } from "@/lib/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus, fetchAllOrders, deleteOrder, type Order, type OrderItem } from "@/lib/orders";
import { formatPrice } from "@/lib/currency";
import { Select as UISelect, SelectContent as UISelectContent, SelectItem as UISelectItem, SelectTrigger as UISelectTrigger, SelectValue as UISelectValue } from "@/components/ui/select";
import { fetchSizeCharts, upsertSizeChart, deleteSizeChart, type SizeChart } from "@/lib/sizeCharts";
import { fetchProductsWithSizeChart } from "@/lib/products";

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

const Admin = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'products' | 'orders' | 'kpis') || 'products';
  const initialStatus = (searchParams.get('status') as 'requested' | 'ready_to_ship' | 'shipped' | 'delivered') || 'requested';
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    image_url: "",
  });
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [orders, setOrders] = useState<(Order & { items: OrderItem[] })[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'kpis'>(initialTab);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'requested' | 'ready_to_ship' | 'shipped' | 'delivered'>(initialStatus);
  const [sizeCharts, setSizeCharts] = useState<SizeChart[]>([]);
  const [sizeChartsLoading, setSizeChartsLoading] = useState(false);
  const sizeChartsDeduped = useMemo(() => {
    const canon = (s: string) => (s || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const map = new Map<string, SizeChart>();
    for (const sc of sizeCharts) {
      const key = canon(sc.slug || '');
      if (!map.has(key)) map.set(key, sc);
    }
    return Array.from(map.values());
  }, [sizeCharts]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    fit: "",
    style: "",
    product_color: "",
    colors: [] as string[],
    in_stock: "in", // 'in' | 'out' for UI, mapped to boolean
    description: "",
    image_url: "",
    image_url_2: "",
    image_url_3: "",
    image_url_4: "",
    image_url_5: "",
    size_chart_slug: "",
    discount_percentage: "",
  });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const refresh = async () => {
    setListLoading(true);
    const data = await fetchProducts();
    setProducts(data);
    setListLoading(false);
  };

  const startEditProduct = (p: Product) => {
    const normalizeFit = (val: string | null | undefined) => {
      const v = (val || '').toString().trim();
      if (/^over\s*-?size(d)?$/i.test(v)) return 'Oversized';
      return v;
    };
    setForm({
      name: p.name ?? "",
      price: String(p.price ?? ""),
      category: p.category ?? "",
      fit: normalizeFit(p.fit),
      style: p.style ?? "",
      product_color: p.product_color ?? "",
      colors: Array.isArray(p.colors) ? p.colors.filter(Boolean) as string[] : [],
      in_stock: (typeof p.in_stock === 'boolean' ? (p.in_stock ? 'in' : 'out') : 'in'),
      description: p.description ?? "",
      image_url: p.image_url ?? "",
      image_url_2: p.image_url_2 ?? "",
      image_url_3: p.image_url_3 ?? "",
      image_url_4: p.image_url_4 ?? "",
      image_url_5: p.image_url_5 ?? "",
      size_chart_slug: p.size_chart_slug ?? "",
      discount_percentage: p.discount_percentage != null ? String(p.discount_percentage) : "",
    });
    setEditingProductId(p.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setForm({ name: "", price: "", category: "", fit: "", style: "", product_color: "", colors: [], in_stock: 'in', description: "", image_url: "", image_url_2: "", image_url_3: "", image_url_4: "", image_url_5: "", size_chart_slug: "", discount_percentage: "" });
  };

  useEffect(() => {
    refresh();
    (async () => {
      setCategoriesLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      setCategoriesLoading(false);
    })();
    (async () => {
      setSizeChartsLoading(true);
      const charts = await fetchSizeCharts();
      setSizeCharts(charts);
      setSizeChartsLoading(false);
    })();
    (async () => {
      setOrdersLoading(true);
      const data = await fetchAllOrders();
      setOrders(data);
      setOrdersLoading(false);
    })();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryForm((f) => ({ ...f, [name]: value }));
  };

  const refreshCategories = async () => {
    setCategoriesLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setCategoriesLoading(false);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name || !categoryForm.slug || !categoryForm.image_url) {
      toast({ title: "Missing fields", description: "Name, slug, and image URL are required.", variant: "destructive" });
      return;
    }
    setCategoryLoading(true);
    const res = await createCategory({
      name: categoryForm.name,
      slug: categoryForm.slug,
      image_url: categoryForm.image_url,
    });
    setCategoryLoading(false);
    if (!res.ok) {
      toast({ title: "Create failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Category created", description: categoryForm.name });
    setCategoryForm({ name: "", slug: "", image_url: "" });
    refreshCategories();
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return;
    }
    const res = await deleteCategory(categoryId);
    if (!res.ok) {
      toast({ title: "Delete failed", description: res.error, variant: "destructive" });
      return;
    }
    toast({ title: "Category deleted", description: categoryName });
    refreshCategories();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.image_url) {
      toast({ title: "Missing fields", description: "Name, price, category, and Image URL 1 are required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    let ok = false; let err: string | undefined; const createdName = form.name;
    if (editingProductId) {
      const resUp = await updateProduct(editingProductId, {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        fit: form.fit || null,
        style: form.style || null,
        product_color: form.product_color || null,
        colors: form.colors && form.colors.length ? form.colors : null,
        in_stock: form.in_stock === 'in' ? true : false,
        description: form.description || null,
        image_url: form.image_url,
        image_url_2: form.image_url_2 || null,
        image_url_3: form.image_url_3 || null,
        image_url_4: form.image_url_4 || null,
        image_url_5: form.image_url_5 || null,
        size_chart_slug: form.size_chart_slug || null,
        discount_percentage: form.discount_percentage !== "" ? Number(form.discount_percentage) : null,
      });
      ok = resUp.ok; err = resUp.error;
    } else {
      const res = await createProduct({
        name: form.name,
        price: Number(form.price),
        category: form.category,
        fit: form.fit || undefined,
        style: form.style || undefined,
        product_color: form.product_color || undefined,
        colors: form.colors && form.colors.length ? form.colors : undefined,
        in_stock: form.in_stock === 'in' ? true : false,
        description: form.description || undefined,
        image_url: form.image_url,
        image_url_2: form.image_url_2 || undefined,
        image_url_3: form.image_url_3 || undefined,
        image_url_4: form.image_url_4 || undefined,
        image_url_5: form.image_url_5 || undefined,
        size_chart_slug: form.size_chart_slug || undefined,
        discount_percentage: form.discount_percentage !== "" ? Number(form.discount_percentage) : undefined,
      });
      ok = res.ok; err = res.error;
    }
    setLoading(false);
    if (!ok) {
      toast({ title: editingProductId ? "Update failed" : "Create failed", description: err, variant: "destructive" });
      return;
    }
    toast({ title: editingProductId ? "Product updated" : "Product created", description: createdName });
    cancelEdit();
    refresh();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    const res = await deleteProduct(product.id);
    if (!res.ok) {
      toast({ title: "Delete failed", description: res.error, variant: "destructive" });
      return;
    }

    toast({ title: "Product deleted", description: product.name });
    refresh();
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const getFilteredOrders = () => {
    return orders.filter(order => order.status === orderStatusFilter);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: 'requested' | 'ready_to_ship' | 'shipped' | 'delivered') => {
    const prevStatus = orders.find(o => o.id === orderId)?.status;
    
    // Optimistic UI update
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    const res = await updateOrderStatus(orderId, newStatus);
    if (!res.ok) {
      // Revert on failure
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: prevStatus } : order
      ));
      toast({ 
        title: "Update failed", 
        description: res.error, 
        variant: "destructive" 
      });
    } else {
      toast({ 
        title: "Status updated", 
        description: `Order status changed to ${newStatus}` 
      });
    }
  };

  const handleDeleteOrder = async (order: Order & { items: OrderItem[] }) => {
    if (!confirm(`Are you sure you want to delete order #${order.order_number ?? order.id.slice(0, 8)}? This action cannot be undone.`)) {
      return;
    }

    const res = await deleteOrder(order.id);
    if (!res.ok) {
      toast({ title: "Delete failed", description: res.error, variant: "destructive" });
      return;
    }

    toast({ title: "Order deleted", description: `Order #${order.order_number ?? order.id.slice(0, 8)}` });
    setOrders(prev => prev.filter(o => o.id !== order.id));
  };

  const handleDeleteSizeChart = async (sizeChart: SizeChart) => {
    // Check if any products are using this size chart
    const dependentProducts = await fetchProductsWithSizeChart(sizeChart.slug);
    
    if (dependentProducts.length > 0) {
      const productNames = dependentProducts.map(p => p.name).join(', ');
      toast({
        title: "Cannot delete size chart",
        description: `This size chart is being used by ${dependentProducts.length} product(s): ${productNames}. Please update these products first.`,
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete the size chart "${sizeChart.title}" (${sizeChart.slug})? This action cannot be undone.`)) {
      return;
    }

    const res = await deleteSizeChart(sizeChart.slug);
    if (!res.ok) {
      toast({ title: "Delete failed", description: res.error, variant: "destructive" });
      return;
    }

    toast({ title: "Size chart deleted", description: `${sizeChart.title} has been deleted.` });
    
    // Refresh size charts list
    setSizeChartsLoading(true);
    const charts = await fetchSizeCharts();
    setSizeCharts(charts);
    setSizeChartsLoading(false);
  };

  const OrderCard = ({ order }: { order: Order & { items: OrderItem[] } }) => (
    <div className="border border-border p-3 sm:p-4 bg-card rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
        <div className="flex-1">
          <p className="font-semibold text-sm sm:text-base">Order #{order.order_number ?? order.id.slice(0, 8)}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {order.user_email || 'guest'} • {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-2">
          <p className="font-bold text-base sm:text-lg">{formatPrice(Number(order.total))}</p>
          <UISelect
            value={order.status}
            onValueChange={(val: 'requested' | 'ready_to_ship' | 'shipped' | 'delivered') => handleStatusUpdate(order.id, val)}
          >
            <UISelectTrigger className="h-8 w-full sm:w-40 text-xs">
              <UISelectValue />
            </UISelectTrigger>
            <UISelectContent>
              <UISelectItem value="requested">Requested</UISelectItem>
              <UISelectItem value="ready_to_ship">Ready to Ship</UISelectItem>
              <UISelectItem value="shipped">Shipped</UISelectItem>
              <UISelectItem value="delivered">Delivered</UISelectItem>
            </UISelectContent>
          </UISelect>
        </div>
      </div>
      {/* Shipping Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 text-xs sm:text-sm">
        <div className="space-y-1">
          <p><span className="text-muted-foreground">Email:</span> {order.user_email || '—'}</p>
          <p><span className="text-muted-foreground">Full Name:</span> {order.shipping_name || '—'}</p>
          <p><span className="text-muted-foreground">Phone:</span> {order.shipping_phone || '—'}</p>
        </div>
        <div className="space-y-1">
          <p><span className="text-muted-foreground">Address:</span> {order.shipping_address || '—'}</p>
          <p><span className="text-muted-foreground">City:</span> {order.shipping_city || '—'}</p>
          <p><span className="text-muted-foreground">Postal Code:</span> {order.shipping_postal_code || '—'}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {order.items.map((item: OrderItem) => (
          <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-2 bg-muted/50 rounded">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-muted overflow-hidden border border-border rounded">
              {item.image_url ? (
                <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium truncate">{item.product_name}</p>
              <p className="text-xs text-muted-foreground">
                x{item.quantity} • {formatPrice(Number(item.unit_price))}
              </p>
            </div>
          </div>
        ))}
      </div>
      {order.status === 'delivered' && (
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteOrder(order)}
          >
            Delete Order
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 sm:mb-8">
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className="flex-1 sm:flex-none"
          >
            Products
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className="flex-1 sm:flex-none"
          >
            Orders
          </Button>
          <Button
            variant={activeTab === 'kpis' ? 'default' : 'outline'}
            onClick={() => setActiveTab('kpis')}
            className="flex-1 sm:flex-none"
          >
            KPIs
          </Button>
        </div>

        {activeTab === 'products' && (
          <>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 sm:gap-6 bg-card border border-border p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Product name" />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" value={form.price} onChange={handleChange} placeholder="0" type="number" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="discount_percentage">Discount (%)</Label>
                  <Input
                    id="discount_percentage"
                    name="discount_percentage"
                    value={form.discount_percentage}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                    type="number"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(val) => setForm((f) => ({ ...f, category: val }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select a category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Select
                    value={form.in_stock}
                    onValueChange={(val) => setForm((f) => ({ ...f, in_stock: val }))}
                  >
                    <SelectTrigger id="stock">
                      <SelectValue placeholder="Select stock status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">In Stock</SelectItem>
                      <SelectItem value="out">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fit">Fit</Label>
                  <Select
                    value={form.fit}
                    onValueChange={(val) => setForm((f) => ({ ...f, fit: val }))}
                  >
                    <SelectTrigger id="fit">
                      <SelectValue placeholder="Select fit (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Slim">Slim</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="Over Size">Over Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="style">Style</Label>
                  <Select
                    value={form.style}
                    onValueChange={(val) => setForm((f) => ({ ...f, style: val }))}
                  >
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anime">Anime</SelectItem>
                      <SelectItem value="Moon">Moon</SelectItem>
                      <SelectItem value="Girls">Girls</SelectItem>
                      <SelectItem value="Qoutes">Qoutes</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="product_color">Product Color</Label>
                  <Select
                    value={form.product_color}
                    onValueChange={(val) => setForm((f) => ({ ...f, product_color: val }))}
                  >
                    <SelectTrigger id="product_color">
                      <SelectValue placeholder="Select product color (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Black",
                        "Dark blue",
                        "Blue",
                        "Brown",
                        "Dark Red",
                        "Green",
                        "Pink",
                        "Purple",
                        "Fuchsia",
                        "White",
                        "Gray",
                        "Dark gray",
                        "Mint Green",
                        "Kashmir",
                        "Petroleum",
                        "Baby blue",
                        "Red",
                      ].map((color) => (
                        <SelectItem key={color} value={color}>{color}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Available Colors</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[
                      "Black",
                      "Dark blue",
                      "Blue",
                      "Brown",
                      "Dark Red",
                      "Green",
                      "Pink",
                      "Purple",
                      "Fuchsia",
                      "White",
                      "Gray",
                      "Dark gray",
                      "Mint Green",
                      "Kashmir",
                      "Petroleum",
                      "Baby blue",
                      "Red",
                    ].map((color) => {
                      const selected = form.colors.includes(color);
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setForm((f) => {
                              const exists = f.colors.includes(color);
                              const next = exists
                                ? f.colors.filter((c) => c !== color)
                                : [...f.colors, color];
                              return { ...f, colors: next };
                            });
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${
                            selected ? "border-accent bg-accent/10" : "border-border bg-background"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-border"
                            style={{ backgroundColor: colorToCss(color) }}
                          />
                          <span>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label htmlFor="size_chart">Size Chart</Label>
                  <Select
                    value={form.size_chart_slug}
                    onValueChange={(val) => setForm((f) => ({ ...f, size_chart_slug: val }))}
                  >
                    <SelectTrigger id="size_chart">
                      <SelectValue placeholder={sizeChartsLoading ? "Loading charts..." : "Select a size chart (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {sizeChartsDeduped.map((sc) => (
                        <SelectItem key={sc.slug} value={sc.slug}>{sc.title} <span className="text-muted-foreground">/ {sc.slug}</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" value={form.description} onChange={handleChange} placeholder="Short description" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Image URL 1</Label>
                  <Input name="image_url" value={form.image_url} onChange={handleChange} placeholder="https://..." />
                </div>
                <div>
                  <Label>Image URL 2</Label>
                  <Input name="image_url_2" value={form.image_url_2} onChange={handleChange} placeholder="https://..." />
                </div>
                <div>
                  <Label>Image URL 3</Label>
                  <Input name="image_url_3" value={form.image_url_3} onChange={handleChange} placeholder="https://..." />
                </div>
                <div>
                  <Label>Image URL 4</Label>
                  <Input name="image_url_4" value={form.image_url_4} onChange={handleChange} placeholder="https://..." />
                </div>
                <div>
                  <Label>Image URL 5</Label>
                  <Input name="image_url_5" value={form.image_url_5} onChange={handleChange} placeholder="https://..." />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                {editingProductId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} disabled={loading}>Cancel</Button>
                )}
                <Button type="submit" disabled={loading}>{loading ? "Saving..." : (editingProductId ? "Save Changes" : "Add Product")}</Button>
              </div>
            </form>

            {/* Existing Products */}
            <div className="bg-card border border-border p-4 sm:p-6 rounded-lg mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">Existing Products</h2>
                {editingProductId && (
                  <span className="text-xs sm:text-sm text-muted-foreground">Editing: {form.name}</span>
                )}
              </div>
              {listLoading ? (
                <div className="text-muted-foreground">Loading products…</div>
              ) : products.length === 0 ? (
                <div className="text-muted-foreground">No products found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="border border-border rounded-lg p-3 flex flex-col sm:flex-row gap-3 bg-background">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 bg-muted overflow-hidden border border-border rounded">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.category}</p>
                        <div className="text-sm">
                          {typeof p.discount_percentage === 'number' && p.discount_percentage > 0 ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through mr-2">{formatPrice(Number(p.price))}</span>
                              <span className="font-semibold">{formatPrice(Number(p.price) * (1 - p.discount_percentage / 100))}</span>
                            </>
                          ) : (
                            <span className="font-semibold">{formatPrice(Number(p.price))}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0">
                        <Button size="sm" className="flex-1" onClick={() => startEditProduct(p)}>Edit</Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleDeleteProduct(p)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-8" />

            {/* Category Management */}
            <div className="bg-card border border-border p-4 sm:p-6 rounded-lg">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Category Management</h2>
              
              {/* Add Category Form */}
              <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input 
                    id="category-name" 
                    name="name" 
                    value={categoryForm.name} 
                    onChange={handleCategoryChange} 
                    placeholder="e.g., Hoodies" 
                  />
                </div>
                <div>
                  <Label htmlFor="category-slug">Slug</Label>
                  <Input 
                    id="category-slug" 
                    name="slug" 
                    value={categoryForm.slug} 
                    onChange={handleCategoryChange} 
                    placeholder="e.g., hoodies" 
                  />
                </div>
                <div>
                  <Label htmlFor="category-image">Image URL</Label>
                  <Input 
                    id="category-image" 
                    name="image_url" 
                    value={categoryForm.image_url} 
                    onChange={handleCategoryChange} 
                    placeholder="https://..." 
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button type="submit" disabled={categoryLoading}>
                    {categoryLoading ? "Adding..." : "Add Category"}
                  </Button>
                </div>
              </form>

              {/* Categories List */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Existing Categories</h3>
                {categoriesLoading ? (
                  <div className="text-muted-foreground">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="text-muted-foreground">No categories found.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-border p-4 rounded-lg bg-background">
                        <div className="aspect-[4/3] mb-3 overflow-hidden bg-muted rounded">
                          <img 
                            src={category.image_url} 
                            alt={category.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="font-semibold">{category.name}</p>
                              <p className="text-sm text-muted-foreground">/{category.slug}</p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                            >
                              Delete
                            </Button>
                          </div>
                          <div>
                            <Label className="text-xs mb-1 block">Image URL</Label>
                            <div className="flex gap-2">
                              <Input
                                defaultValue={category.image_url}
                                onBlur={async (e) => {
                                  const val = e.target.value.trim();
                                  if (val && val !== category.image_url) {
                                    const res = await updateCategory(category.id, { image_url: val });
                                    if (!res.ok) toast({ title: "Update failed", description: res.error, variant: "destructive" });
                                    else {
                                      toast({ title: "Image updated", description: category.name });
                                      refreshCategories();
                                    }
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async (e) => {
                                  const wrapper = (e.currentTarget.previousSibling as HTMLInputElement);
                                  const val = (wrapper?.value || '').trim();
                                  if (!val) return;
                                  const res = await updateCategory(category.id, { image_url: val });
                                  if (!res.ok) toast({ title: "Update failed", description: res.error, variant: "destructive" });
                                  else {
                                    toast({ title: "Image updated", description: category.name });
                                    refreshCategories();
                                  }
                                }}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            <h2 className="text-2xl font-bold mb-4">Size Charts</h2>
            {sizeChartsLoading ? (
              <div className="text-muted-foreground">Loading…</div>
            ) : (
              <div className="space-y-6">
                {sizeCharts.map((sc) => (
                  <div key={sc.slug} className="border border-border p-4 bg-card">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{sc.title}</h3>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSizeChart(sc)}
                        className="text-xs"
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Slug</Label>
                        <Input value={sc.slug} disabled />
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          defaultValue={sc.title}
                          onBlur={async (e) => {
                            const next = { slug: sc.slug, title: e.target.value, content: sc.content };
                            const res = await upsertSizeChart(next);
                            if (!res.ok) toast({ title: "Save failed", description: res.error, variant: "destructive" });
                            else toast({ title: "Saved", description: sc.slug });
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Content (Markdown table)</Label>
                        <textarea
                          defaultValue={sc.content}
                          className="w-full h-40 border border-border bg-background p-2 text-sm"
                          onBlur={async (e) => {
                            const next = { slug: sc.slug, title: sc.title, content: e.target.value };
                            const res = await upsertSizeChart(next);
                            if (!res.ok) toast({ title: "Save failed", description: res.error, variant: "destructive" });
                            else toast({ title: "Saved", description: sc.slug });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              <Button
                variant={orderStatusFilter === 'requested' ? 'default' : 'outline'}
                onClick={() => setOrderStatusFilter('requested')}
                className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                Requested ({getOrdersByStatus('requested').length})
              </Button>
              <Button
                variant={orderStatusFilter === 'ready_to_ship' ? 'default' : 'outline'}
                onClick={() => setOrderStatusFilter('ready_to_ship')}
                className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Ready to Ship ({getOrdersByStatus('ready_to_ship').length})
              </Button>
              <Button
                variant={orderStatusFilter === 'shipped' ? 'default' : 'outline'}
                onClick={() => setOrderStatusFilter('shipped')}
                className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Shipped ({getOrdersByStatus('shipped').length})
              </Button>
              <Button
                variant={orderStatusFilter === 'delivered' ? 'default' : 'outline'}
                onClick={() => setOrderStatusFilter('delivered')}
                className="flex items-center gap-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Delivered ({getOrdersByStatus('delivered').length})
              </Button>
            </div>

            {/* Filtered Orders Display */}
            <div>
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {orderStatusFilter.replace('_', ' ')} Orders ({getFilteredOrders().length})
              </h2>

              {ordersLoading ? (
                <div className="text-muted-foreground">Loading…</div>
              ) : getFilteredOrders().length === 0 ? (
                <div className="text-muted-foreground">
                  {`No ${orderStatusFilter.replace('_', ' ')} orders.`}
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredOrders().map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-6">
            {ordersLoading ? (
              <div className="text-muted-foreground">Loading…</div>
            ) : (
              (() => {
                const monthlyMap = new Map<string, { revenue: number; pieces: number; orders: number }>();

                // Use only delivered orders for KPI calculations
                const deliveredOrders = orders.filter((o) => o.status === 'delivered');

                for (const o of deliveredOrders) {
                  if (!o.created_at) continue;
                  const d = new Date(o.created_at);
                  if (Number.isNaN(d.getTime())) continue;
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  const bucket = monthlyMap.get(key) || { revenue: 0, pieces: 0, orders: 0 };
                  bucket.revenue += Number(o.total || 0);
                  bucket.orders += 1;
                  const pieces = o.items?.reduce((s, it) => s + Number(it.quantity || 0), 0) || 0;
                  bucket.pieces += pieces;
                  monthlyMap.set(key, bucket);
                }

                // If there are no delivered orders, show 0 KPIs for the current month
                if (monthlyMap.size === 0) {
                  const now = new Date();
                  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                  monthlyMap.set(key, { revenue: 0, pieces: 0, orders: 0 });
                }

                const monthly = Array.from(monthlyMap.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
                return (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Monthly KPIs</h2>
                    {monthly.length === 0 ? (
                      <div className="text-muted-foreground">No orders yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {monthly.map(([key, stats]) => {
                          const [year, month] = key.split('-');
                          const dateLabel = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                          });
                          const avgOrderValue = stats.orders > 0 ? stats.revenue / stats.orders : 0;
                          return (
                            <div
                              key={key}
                              className="border border-border bg-card p-4 rounded"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                  {dateLabel}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {stats.orders} orders
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                <div>
                                  <div className="text-xs text-muted-foreground">Sales</div>
                                  <div className="text-lg font-bold">{formatPrice(stats.revenue)}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Pieces</div>
                                  <div className="text-lg font-bold">{stats.pieces}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Orders</div>
                                  <div className="text-lg font-bold">{stats.orders}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-muted-foreground">Avg. Order</div>
                                  <div className="text-lg font-bold">{formatPrice(avgOrderValue)}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        )}

        
      </div>
    </main>
  );
};

export default Admin;


