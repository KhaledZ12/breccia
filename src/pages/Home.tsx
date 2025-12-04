import Hero from "@/components/Hero";
import { Helmet } from "react-helmet";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import BestSellers from "@/components/BestSellers";
import AboutTeaser from "@/components/AboutTeaser";
import { Truck } from "lucide-react";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>BRECCIA | UNIQUE PIECE FOR YOU</title>
        <meta name="description" content="Discover minimal design meets street culture. Shop exclusive collections from BRECCIA Egypt." />
        <meta name="keywords" content="breccia, streetwear, minimal, fashion, egypt, exclusive, shop" />
      </Helmet>
    <main>
      <div className="bg-accent/10 text-accent border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm">
          <Truck className="h-4 w-4" />
          <span className="font-medium">Free shipping over 1499 EGP</span>
        </div>
      </div>
      <Hero />
      <CategoryGrid />
      <FeaturedProducts />
      <BestSellers />
      <AboutTeaser />
    </main>
    </>
  );
};

export default Home;
