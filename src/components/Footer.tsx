import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <span className="font-brand tracking-[0.1em]" style={{ fontFamily: 'Bunya, sans-serif' }}>BRECCIA</span>
            <p className="text-sm text-muted-foreground font-brand tracking-[0.1em]" style={{ fontFamily: 'Bunya, sans-serif' }}>
              UNIQUE PIECE FOR YOU
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/breccia_eg?igsh=MTM4YjU0NXk3ODV5MQ==" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/share/1BVEco537D/" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold mb-4 text-sm tracking-wider">SHOP</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/sweatpants/"
                  className="hover:text-accent transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Sweetpants
                </Link>
              </li>
              <li>
                <Link
                  to="/shop/?category=hoodies"
                  className="hover:text-accent transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Hoodies
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold mb-4 text-sm tracking-wider">COMPANY</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about/" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact/" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-sm tracking-wider">LEGAL</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy/" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms/" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/returns/" className="hover:text-accent transition-colors">Returns & Refunds</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BRECCIA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
