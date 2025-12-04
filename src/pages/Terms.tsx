const Terms = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Terms of Service</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Please read these terms carefully before using our website or placing an order.
        </p>

        <section className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-semibold mb-2">Use of the Site</h2>
            <p className="text-muted-foreground">By accessing this site, you agree to follow all applicable laws and these Terms of Service.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Orders</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>All orders are subject to availability and acceptance.</li>
              <li>We reserve the right to cancel or refuse any order at our discretion.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Pricing</h2>
            <p className="text-muted-foreground">Prices are subject to change without notice. Taxes and shipping fees may apply.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Returns & Refunds</h2>
            <p className="text-muted-foreground">Please see our <a className="underline hover:text-accent" href="/returns">Returns & Refunds</a> policy.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Liability</h2>
            <p className="text-muted-foreground">We are not liable for any indirect or consequential damages arising from the use of our products or services.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Changes to Terms</h2>
            <p className="text-muted-foreground">We may update these terms at any time. Continued use of the site constitutes acceptance of the updated terms.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Terms;
