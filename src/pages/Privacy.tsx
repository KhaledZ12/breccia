const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8 text-sm sm:text-base">
          Your privacy is important to us. This policy explains what data we collect and how we use it.
        </p>

        <section className="space-y-6 text-sm sm:text-base">
          <div>
            <h2 className="font-semibold mb-2">Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Account and order details (name, email, address, phone).</li>
              <li>Payment details processed securely by our payment partners.</li>
              <li>Usage data (device, pages visited) to improve our services.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>To process and fulfill orders.</li>
              <li>To communicate updates about your order.</li>
              <li>To enhance website performance and user experience.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Data Sharing</h2>
            <p className="text-muted-foreground">We do not sell your personal data. We share limited data with trusted providers (e.g., payments, shipping) to deliver our services.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Security</h2>
            <p className="text-muted-foreground">We use industry-standard measures to protect your data. No method of transmission or storage is 100% secure.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Your Rights</h2>
            <p className="text-muted-foreground">You may request access, correction, or deletion of your personal data. Contact us for assistance.</p>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Contact</h2>
            <p className="text-muted-foreground">Questions about this policy? Contact us via the Contact page.</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Privacy;
