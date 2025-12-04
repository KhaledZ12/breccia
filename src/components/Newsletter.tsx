import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <section className="py-20 px-4 bg-card">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          JOIN THE BRECCIA FAMILY
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Subscribe to get exclusive access to drops, sales, and more.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 h-12 bg-background border-2 border-border focus:border-accent"
          />
          <Button variant="accent" size="lg" type="submit" className="sm:w-auto">
            SUBSCRIBE
          </Button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
