import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Clock, Mail, Sparkles, Star } from "lucide-react";
import { useEffect } from "react";

const Sweatpants = () => {
  // Scroll to top smoothly when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  return (
    <>
      <Helmet>
        <title>Sweatpants Collection | BRECCIA</title>
        <meta name="description" content="Sweatpants collection coming soon to BRECCIA. Be the first to know when our exclusive sweatpants drop." />
        <meta name="keywords" content="sweatpants, breccia, coming soon, collection, streetwear, egypt" />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5] 
            }}
            transition={{ duration: 8, repeat: Infinity, delay: 2 }}
          />
        </div>

        {/* Floating stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute hidden lg:block"
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [0, -20, 0] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            style={{
              top: `${20 + (i * 15)}%`,
              left: `${10 + (i * 15)}%`,
            }}
          >
            <Star className="w-4 h-4 text-accent/30" />
          </motion.div>
        ))}

        <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Back button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </motion.div>

            {/* Main content */}
            <div className="space-y-8">
              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-accent/10 rounded-full mb-6"
              >
                <Sparkles className="w-12 h-12 text-accent" />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
              >
                <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                  Sweatpants
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-2 text-accent">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-semibold">Coming Soon</span>
                </div>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Our exclusive Sweatpants collection is dropping soon. 
                  Get ready for ultimate comfort and style that will elevate your streetwear game.
                </p>
              </motion.div>

              {/* Feature highlights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto py-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <Star className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-semibold">Premium Comfort</h3>
                  <p className="text-sm text-muted-foreground">Soft fabrics for all-day wear</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-semibold">Modern Design</h3>
                  <p className="text-sm text-muted-foreground">Contemporary streetwear style</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="font-semibold">Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">Dropping this season</p>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
              >
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-background min-w-[200px]"
                  asChild
                >
                  <Link to="/shop/">
                    Shop Other Collections
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="min-w-[200px]"
                  asChild
                >
                  <Link to="/contact/">
                    <Mail className="w-4 h-4 mr-2" />
                    Notify Me
                  </Link>
                </Button>
              </motion.div>

              {/* Additional info */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-sm text-muted-foreground pt-4"
              >
                Be the first to know when Sweatpants drop. Follow us on social media for updates.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default Sweatpants;
