import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/currency";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "UNKNOWN";
  const orderNumber = searchParams.get("orderNumber");
  const total = searchParams.get("total") || "0.00";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 text-sm md:text-base">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-6 text-accent" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-5xl font-bold mb-4"
        >
          Thank You for Your Purchase!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-base md:text-xl text-muted-foreground mb-8"
        >
          Your order has been successfully placed
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-lg p-6 md:p-8 mb-8"
        >
          <div className="flex items-start justify-between gap-3 md:gap-6">
            <div className="shrink-0 text-left">
              <p className="text-sm text-muted-foreground mb-1">Order No</p>
              <p className="font-mono font-bold text-accent">{orderNumber ?? orderId}</p>
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
              <p className="font-bold text-xs md:text-2xl font-mono [font-variant-numeric:tabular-nums] tracking-tight">{formatPrice(Number(total))}</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground mb-8"
        >
          A confirmation email has been sent to your inbox. You can track your order status in your account.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/shop">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-background">
              Continue Shopping
            </Button>
          </Link>
          <Link to="/">
            <Button size="lg" variant="outline">
              Back to Home
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
};

export default OrderSuccess;
