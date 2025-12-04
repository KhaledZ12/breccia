import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact | BRECCIA Egypt</title>
        <meta name="description" content="Contact BRECCIA for support, inquiries, and collaboration. We're here to help you." />
        <meta name="keywords" content="contact breccia, support, help, egypt, fashion, streetwear" />
      </Helmet>
    <main className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Contact Us
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground mb-10"
        >
          We'd love to hear from you. Reach out using the details below and we'll get back to you as soon as possible.
        </motion.p>

        <div className="grid gap-6">
          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card">
            <Phone className="h-5 w-5 text-accent" />
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <a href="tel:01013827705" className="font-semibold hover:text-accent">01013827705</a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-card">
            <Mail className="h-5 w-5 text-accent" />
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <a href="mailto:info@breccia-eg.com" className="font-semibold hover:text-accent">info@breccia-eg.com</a>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
            <div className="flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5 text-accent"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M20.52 3.48A11.94 11.94 0 0 0 12.06 0C5.48 0 .16 5.31.16 11.88c0 2.09.55 4.1 1.6 5.9L0 24l6.4-1.7a11.83 11.83 0 0 0 5.67 1.46h.01c6.58 0 11.9-5.31 11.9-11.88a11.82 11.82 0 0 0-3.47-8.4Zm-8.46 18.3h-.01a9.93 9.93 0 0 1-5.05-1.38l-.36-.21-3.8 1.01 1.02-3.7-.24-.38a9.87 9.87 0 0 1-1.54-5.33c0-5.47 4.46-9.92 9.95-9.92 2.66 0 5.16 1.04 7.04 2.92a9.83 9.83 0 0 1 2.92 7 9.9 9.9 0 0 1-9.93 9.9Zm5.48-7.42c-.3-.15-1.78-.88-2.06-.98-.28-.1-.49-.15-.7.15-.21.3-.8.98-.98 1.18-.18.2-.36.22-.66.07-.3-.15-1.24-.45-2.37-1.44-.88-.77-1.48-1.73-1.65-2.03-.17-.3-.02-.46.13-.61.13-.13.3-.36.44-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.7-1.68-.96-2.3-.25-.6-.51-.52-.7-.53l-.6-.01c-.2 0-.52.07-.79.38-.27.3-1.04 1-1.04 2.43 0 1.43 1.06 2.81 1.2 3 .15.2 2.08 3.17 5.04 4.46.7.3 1.25.48 1.67.6.7.22 1.33.19 1.83.12.56-.08 1.78-.73 2.03-1.44.25-.7.25-1.31.17-1.44-.07-.13-.27-.2-.57-.35Z"/>
              </svg>
              <div>
                <div className="text-sm text-muted-foreground">WhatsApp</div>
                <span className="font-semibold  hover:text-accent"> <a href="https://wa.me/201013827705" target="_blank" rel="noopener noreferrer">Chat on Whatsapp</a>
                </span>
              </div>
            </div>
           
          </div>
        </div>
      </div>
    </main>
    </>
  );
};

export default Contact;
