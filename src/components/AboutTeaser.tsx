import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AboutTeaser = () => {
  return (
    <section className="py-12 sm:py-16 border-t border-border bg-background">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Bunya, sans-serif' }}>About <span className="font-brand font-bold" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</span></h2>
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-brand font-bold" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</span> crafts distinctive apparel designed to stand out. From premium materials to
            thoughtful details, every piece is made to help you express your individuality with
            confidence and comfort.
          </p>
        </div>
        <div className="flex md:justify-end">
          <Link to="/about">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-background">Know More</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AboutTeaser;
