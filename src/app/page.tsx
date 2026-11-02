import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  PackageCheck,
  Headphones,
  Truck,
  Zap,
  Building2,
  Check,
  Layers3,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { categories, getHome } from "@/lib/catalog";
import { HomeRecommendations } from "@/components/home-recommendations";
import { HeroProducts } from "@/components/hero-products";
import { ProductCarousel } from "@/components/product-carousel";
import { ProductCard } from "@/components/product-card";
import "./home.css";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { settings: s, products, connected, importedAt } = await getHome();
  const spotlights = [
    products.find(p => p.category.slug.includes("change")),
    products.find(p => p.category.slug.includes("flood")) || products.find(p => p.name.includes("LED")),
  ].filter((p): p is (typeof products)[number] => Boolean(p));
  const bestSellers = products.filter(p => p.collectionSlugs.includes("best-sellers"));
  const heroProducts = bestSellers.slice(0, 8);
  return (
    <>
      <Header announcement={s.announcement} whatsapp={s.whatsappNumber} />
      <main id="main" className="premium-storefront">
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span />
                ELECTRICAL ESSENTIALS. EXPERT SUPPLY.
              </div>
              <h1>Better equipment.<br />Stronger <span>connections.</span></h1>
              <p>
                {s.heroDescription?.replace(/\b(?:catalogue|catalog)\b/gi, "products") ||
                  "From the first wire to the final switch. Find electrical essentials for homes, worksites and everything you build."}
              </p>
              <div className="hero-buttons">
                <Button asChild>
                  <Link href="/shop">
                    Explore products
                    <ArrowUpRight size={19} />
                  </Link>
                </Button>
                <Link className="text-link" href="/bulk-enquiry">
                  Request a quotation
                  <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hero-caption">
                <span>
                  <Check size={14} /> Made for your everyday needs
                </span>
                <span>
                  <Check size={14} /> Project supply enquiries
                </span>
              </div>
            </div>
            <div className="hero-art premium-showcase">
              <HeroProducts products={heroProducts} bestSellers={bestSellers.length > 0} />
              <div className="showcase-minis">{spotlights.map((p,i)=><Link href={"/products/"+p.slug} key={p.id}><img src={p.images[0]?.url} alt={p.name} width="80" height="80"/><div><small>{i===0?"CONTROL & SWITCHING":"LIGHTING SOLUTIONS"}</small><strong>{p.name}</strong></div><ArrowUpRight size={18}/></Link>)}</div>
            </div>
          </div>
        </section>
        <div className="range-ribbon"><div className="wrap"><span>FOR EVERY SPACE. EVERY SCALE.</span><span><Layers3 size={17}/> Residential</span><span><Building2 size={17}/> Commercial</span><span><Zap size={17}/> Industrial</span><Link href="/categories">Find your range <ArrowRight size={16}/></Link></div></div>
        <div className="benefits wrap">
          {[
            [
              PackageCheck,
              "Products for every project",
              "Equipment for every project",
            ],
            [Truck, "Delivery support", "Plan your supply with our team"],
            [
              ShieldCheck,
              "Product transparency",
              "Clear details before you order",
            ],
            [Headphones, "People who can help", "Retail and project enquiries"],
          ].map(([Icon, title, desc]) => {
            const I = Icon as typeof Truck;
            return (
              <div key={String(title)}>
                <I size={25} />
                <span>
                  <strong>{String(title)}</strong>
                  <small>{String(desc)}</small>
                </span>
              </div>
            );
          })}
        </div>
        <section className="section wrap" id="categories">
          <div className="section-heading">
            <div>
              <div className="eyebrow">FIND YOUR ESSENTIALS</div>
              <h2>Find the right fit.</h2>
            </div>
            <Link href="/categories">
              All categories <ArrowRight size={17} />
            </Link>
          </div>
          <div className="category-grid">
            {categories.slice(0, 6).map((c, i) => (
              <Link
                className="category-card"
                key={c.slug}
                href={"/shop?category=" + c.slug}
              >
                <div className="category-art">
                  {c.image && (
                    <img
                      className="category-source-image"
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                    />
                  )}
                  <span className="round-arrow">
                    <ArrowUpRight size={17} />
                  </span>
                </div>
                <h3>{c.name}</h3>
                <p>
                  Explore the range <ArrowRight size={14} />
                </p>
              </Link>
            ))}
          </div>
        </section>
        {bestSellers.length > 0 && <section className="catalog-section bestseller-section" id="best-sellers"><div className="wrap"><div className="section-heading"><div><div className="eyebrow">THE SRV BEST-SELLER COLLECTION</div><h2>Great choices. Everyday essentials.</h2></div><Link href="/shop?collection=best-sellers">View best-selling products <ArrowRight size={17} /></Link></div><ProductCarousel interval={4000} label="Best sellers">{bestSellers.map(p => <ProductCard key={p.id} product={p} />)}</ProductCarousel></div></section>}
        <section className="catalog-section recommendations-section" id="recommendations">
          <div className="wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">YOUR NEXT PROJECT STARTS HERE</div>
                <h2>Recommended for you.</h2>
              </div>
              <Link href="/shop">
                Browse products <ArrowRight size={17} />
              </Link>
            </div>
            <HomeRecommendations products={products} />
            <div className="catalogue-browse-cta"><Link className="button secondary" href="/shop">Explore all products <ArrowRight size={17}/></Link><span>Choose your products. Confirm the details with our team.</span></div>
          </div>
        </section>
        <section className="section wrap order-steps"><div className="section-heading"><div><div className="eyebrow">A SIMPLE WAY TO ORDER</div><h2>From product to project, in three steps.</h2></div></div><div className="why-grid">{[["01","Find your product","Browse categories, compare specifications and select the right variant."],["02","Share your requirements","Choose a quantity and send your product enquiry on WhatsApp or email."],["03","Confirm with our team","Discuss stock, final pricing, GST and delivery before confirming your order."]].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>
        <section className="wholesale">
          <div className="wrap wholesale-inner">
            <div>
              <div className="eyebrow">LET’S BUILD TOGETHER</div>
              <h2>
                A little guidance.
                <br />The right product for you.
              </h2>
              <p>
                Updating your home or starting something new?<br />
                We’re here to help you find what you need.
              </p>
            </div>
            <div>
              <Link className="button primary" href="/shop">
                Find your essentials <ArrowUpRight size={18} />
              </Link>
              <Link className="button light-outline" href="/bulk-enquiry">
                Ask about a product <ArrowRight size={18} />
              </Link>
              <small>Friendly help with product choices, availability and delivery.</small>
            </div>
          </div>
        </section>
        <section className="contact-cta customer-contact wrap">
          <div className="customer-contact-copy">
            <span className="contact-chat-icon"><MessageCircle size={30} strokeWidth={1.5} /></span>
            <div className="eyebrow">YOUR PRODUCTS. YOUR NEXT ORDER.</div>
            <h2>Your essentials.<br />One WhatsApp order away.</h2>
            <p>Send your product names, quantities and delivery location on WhatsApp. Our team will confirm availability, pricing and delivery before you place your order.</p>
            <div className="contact-topics"><span>Choose products</span><span>Share quantities</span><span>Confirm your order</span></div>
          </div>
          <div className="customer-contact-card"><span className="contact-card-eyebrow">ORDER DIRECTLY WITH SRV</span><h3>Order on WhatsApp.</h3><p>Send your product list to get your order started.</p>
          <Link
            className="button primary"
            href={
              s.whatsappNumber
                ? "https://wa.me/" + s.whatsappNumber.replace(/\D/g, "") + "?text=" + encodeURIComponent("Hello SRV, I’d like to place an order.\nProducts and quantities: \nDelivery location: ")
                : "/contact"
            }
          >
            {s.whatsappNumber ? "Order on WhatsApp" : "Contact us to order"}
            <ArrowUpRight size={18} />
          </Link>
          <a className="contact-call-link" href={"tel:" + s.businessPhone.replace(/[^+0-9]/g, "")}><Phone size={14} /> Prefer a call? {s.businessPhone}</a>
          </div>
        </section>
        {!connected && (
          <div className="connection-note wrap">
            Showing the SRV product snapshot from{" "}
            {new Date(importedAt).toLocaleDateString("en-IN")}. Prices and
            source availability are not a live inventory guarantee. Checkout
            remains unavailable.
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

