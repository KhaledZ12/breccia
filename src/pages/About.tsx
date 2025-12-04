import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Heart, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Quality",
    description: "Premium materials and craftsmanship in every piece"
  },
  {
    icon: Sparkles,
    title: "Design",
    description: "Bold, minimal aesthetics that define modern streetwear"
  },
  {
    icon: Users,
    title: "Community",
    description: "Built by and for those who express themselves through style"
  }
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About | UNIQUE PIECE FOR YOU</title>
        <meta name="description" content="Learn more about BRECCIA, where minimal design meets street culture. Our story, vision, and values." />
        <meta name="keywords" content="about breccia, streetwear, minimal, fashion, egypt, brand story" />
      </Helmet>
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl"
        >
          <h1 className="font-brand tracking-[0.1em] text-4xl md:text-6xl mb-2" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</h1>
          <p className="font-brand tracking-[0.1em] text-sm md:text-base text-muted-foreground" style={{ fontFamily: 'Bunya, sans-serif' }}>UNIQUE PIECE FOR YOU</p>
        </motion.div>
      </section>

      {/* About BRECCIA Section */}
      <section className="py-16 px-4 bg-card/30">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-3xl"
        >
          <h2 className="text-3xl font-brand font-bold mb-6 text-center" style={{ fontFamily: 'Bunya, sans-serif' }}>About BRECCIA</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p >
              <span className="font-brand font-bold" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</span> is where minimal design meets street culture. Inspired by clean lines and creative expression, every collection is built around individuality — no noise, just refined energy. Each garment is crafted to feel exclusive, made for those who see fashion as an art form, not a trend.
            </p>
            <p className="font-medium font-brand text-foreground" style={{ fontFamily: 'Bunya, sans-serif' }}>A UNIQUE PIECE FOR YOU</p>
          </div>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-card/50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-3xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              <span className="font-brand font-bold" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</span> was created for those who see beauty in simplicity and strength in individuality. Like the stone it's named after — formed from fragments coming together — <span className="font-brand font-bold" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</span> stands for unity through difference.
            </p>
            <p>
              Every design is a composition of minimal shapes, premium fabrics, and subtle details — a quiet statement of personal style.
            </p>
            <p className="font-medium font-brand text-foreground" style={{ fontFamily: 'Bunya, sans-serif' }}>A UNIQUE PIECE FOR YOU</p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 border border-border rounded-lg hover:border-accent transition-colors"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-accent" />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 text-center bg-accent/10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-2xl"
        >
          <h2 className="text-3xl font-bold mb-4">Join the Movement</h2>
          <p className="text-muted-foreground mb-8">
            Follow us on Instagram for the latest drops and style inspiration
          </p>
          <a
            href="https://instagram.com/breccia.official"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-background font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            @breccia.official
          </a>
        </motion.div>
      </section>
    </main>
    </>
  );
};

export default About;
