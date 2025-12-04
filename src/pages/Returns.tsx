import { Link } from "react-router-dom";

const Returns = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Returns & Refunds</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          We want you to love your purchase. If something isn’t right, we’re here to help.
        </p>

        <section className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-semibold mb-2">Return Window</h2>
            <p>Returns are accepted within 14 days of delivery.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Condition</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Items must be unused, unwashed, and in original packaging with tags.</li>
              <li>For hygiene reasons, accessories may not be eligible unless faulty.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">How to Start a Return</h2>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Contact us via the <Link to="/contact" className="underline hover:text-accent">Contact</Link> page with your order number.</li>
              <li>We’ll provide return instructions and the return address.</li>
              <li>Ship the item securely; keep your receipt/tracking.</li>
            </ol>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Refunds</h2>
            <p className="text-muted-foreground">
              Once your return is received and inspected, refunds are issued to your original payment method. Please allow 5–10 business days for processing.
            </p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Exchanges</h2>
            <p className="text-muted-foreground">If you need a different size or color, please place a new order and return the original item.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Shipping Costs</h2>
            <p className="text-muted-foreground">Original shipping fees are non-refundable. Return shipping is the responsibility of the customer unless the item is faulty.</p>
          </div>

          <div className="rounded-md border border-border bg-card p-4 text-xs sm:text-sm">
            <p>
              Questions? Reach us anytime from the <Link to="/contact" className="underline hover:text-accent">Contact</Link> page.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Returns;
