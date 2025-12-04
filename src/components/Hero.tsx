import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import "@/styles/fonts.css";

const Hero = () => {
  return (
    <section className="relative h-[85vh] sm:h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="BRECCIA Collection" 
          className="w-full h-full object-cover opacity-30 sm:opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-[0.05em] sm:tracking-[0.1em]" style={{ fontFamily: 'Bunya, sans-serif' }}>
          BRECCIA
        </h1>
        <p className="text-sm sm:text-lg md:text-xl mb-6 sm:mb-8 text-muted-foreground tracking-[0.05em] sm:tracking-[0.1em]" style={{ fontFamily: 'Bunya, sans-serif', fontWeight: 300 }}>
          UNIQUE PIECE FOR YOU
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link to="/shop">
            <Button variant="hero" size="lg" className="w-full sm:w-auto px-6 sm:px-8">
              SHOP NOW
            </Button>
          </Link>
          <Link to="/categories">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8">
              CATEGORIES
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden sm:block">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-foreground rounded-full flex justify-center pt-1.5 sm:pt-2">
          <div className="w-0.5 h-1.5 sm:w-1 sm:h-2 bg-foreground rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
