import Link from "next/link";
import { ArrowUpRight, PackageCheck, Headphones, ShoppingBag } from "lucide-react";
import { Brand } from "./brand";
export function Footer() {
  return (
    <footer className="customer-footer">
      <div className="wrap footer-invitation"><div><span className="eyebrow">GOOD PRODUCTS. BETTER CONNECTIONS.</span><h2>Bring your next idea to life.</h2><p>Discover the essentials that make your space work better.</p></div><Link className="button primary" href="/shop">Explore the collection <ArrowUpRight size={19} /></Link></div>
      <div className="wrap footer-assurances"><span><ShoppingBag size={20} /> Essentials for your everyday</span><span><PackageCheck size={20} /> Clear product information</span><span><Headphones size={20} /> Help from real people</span></div>
      <div className="wrap footer-grid">
        <div>
          <Brand />
          <p>
            Electrical products from Mansa, Punjab.
            <br />
            Since 2000.
          </p>
          <p>
            <a href="tel:+918837684004">+91 88376 84004</a>
            <br />
            <a href="mailto:info@srvelectricals.com">info@srvelectricals.com</a>
            <br />
            Mon–Sat, 9am–6pm
          </p>
          <Link href="/contact">
            Connect with our team <ArrowUpRight size={15} />
          </Link>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/shop">All products</Link>
          <Link href="/categories">Product categories</Link>
          <Link href="/#best-sellers">Best sellers</Link>
          <Link href="/#recommendations">Recommended for you</Link>
          <Link href="/bulk-enquiry">Product enquiries</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/account">My account</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/track-order">Track your order</Link>
          <Link href="/contact">Contact us</Link>
          <a href="https://wa.me/918837684004">Order help on WhatsApp</a>
          <Link href="/shipping-policy">Shipping policy</Link>
          <Link href="/return-policy">Returns & support</Link>
        </div>
        <div>
          <h3>Our company</h3>
          <Link href="/about">About SRV Electricals</Link>
          <Link href="/privacy-policy">Privacy policy</Link>
          <Link href="/terms">Terms & conditions</Link>
          <span className="footer-note">India · Prices in INR</span>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} SRV Electricals. All rights reserved.
        </span>
        <span>Residential. Commercial. Industrial.</span>
      </div>
    </footer>
  );
}
