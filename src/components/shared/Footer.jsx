
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto bg-brand-ink text-brand-ivory">
      <div className="container-editorial grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="font-heading text-2xl font-semibold">
            vestirhaus.
          </Link>
          <p className="max-w-xs text-sm leading-6 text-brand-cream/75">
            African expression. Modern form. Made for every wardrobe.
          </p>
        </div>

        <div>
          <h2 className="eyebrow mb-4 text-brand-gold">Explore</h2>
          <ul className="space-y-3 text-sm text-brand-cream/80">
            <li><Link to="/shop">Shop all</Link></li>
            <li><Link to="/categories/men">Men</Link></li>
            <li><Link to="/categories/women">Women</Link></li>
            <li><Link to="/categories/kids">Kids</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow mb-4 text-brand-gold">Your account</h2>
          <ul className="space-y-3 text-sm text-brand-cream/80">
            <li><Link to="/account">My account</Link></li>
            <li><Link to="/orders">Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="eyebrow mb-4 text-brand-gold">The brand</h2>
          <p className="text-sm leading-6 text-brand-cream/80">
            Contemporary African-inspired fashion, bringing heritage and
            modern personal style together.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-editorial flex flex-col gap-2 py-5 text-xs text-brand-cream/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Vestirhaus. All rights reserved.</p>
          <p>Designed with intention.</p>
        </div>
      </div>
    </footer>
  );
}
