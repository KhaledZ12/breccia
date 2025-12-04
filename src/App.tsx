import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import CollectionPage from "./pages/CollectionPage";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import Returns from "./pages/Returns";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Sweatpants from "./pages/Sweatpants";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

// Scroll to top on every route change (smooth)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
};

// Normalize URLs to have a trailing slash for directory-like routes when navigating client-side
const TrailingSlashRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const isRoot = pathname === "/";
    const isFile = /\.[^./]+$/.test(pathname);
    const hasSlash = pathname.endsWith("/");
    const hasQuery = !!search;
    // Skip dynamic and special routes where we don't want to enforce trailing slash
    const skip = (
      pathname.startsWith('/product/') ||
      pathname.startsWith('/order-success') ||
      pathname.startsWith('/admin')
    );
    if (!isRoot && !isFile && !hasSlash && !hasQuery && !skip) {
      navigate(`${pathname}/${hash || ''}`, { replace: true });
    }
  }, [pathname, search, hash, navigate]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <TrailingSlashRedirect />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop/" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/categories/" element={<Categories />} />
                <Route path="/collections/:collectionId/" element={<CollectionPage />} />
                <Route path="/about/" element={<About />} />
                <Route path="/contact/" element={<Contact />} />
                <Route path="/cart/" element={<Cart />} />
                <Route path="/login/" element={<Login />} />
                <Route path="/checkout/" element={<Checkout />} />
                <Route path="/order-success/" element={<OrderSuccess />} />
                <Route path="/admin/" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/returns/" element={<Returns />} />
                <Route path="/privacy/" element={<Privacy />} />
                <Route path="/terms/" element={<Terms />} />
                <Route path="/sweatpants/" element={<Sweatpants />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
