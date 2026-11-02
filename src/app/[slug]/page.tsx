import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  ShieldCheck,
  ShoppingBag,
  PackageSearch,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EnquiryForm } from "@/components/enquiry-form";
import { CatalogueImage } from "@/components/catalogue-image";
import { categories, getHome } from "@/lib/catalog";
const pages: Record<string, { title: string; description: string }> = {
  categories: {
    title: "Every project starts here.",
    description:
      "Explore the SRV range by category, from the first fitting to the final connection.",
  },
  about: {
    title: "Built around better connections.",
    description: "Discover SRV Electricals, Mansa, Punjab.",
  },
  contact: {
    title: "Let’s get you connected.",
    description:
      "For product guidance, retail purchases or project supply, talk to the SRV team.",
  },
  "bulk-enquiry": {
    title: "Let’s find what you need.",
    description:
      "Share your product list and quantities. We’ll help you start a conversation about supply.",
  },
  account: {
    title: "Your SRV account.",
    description:
      "Online account access is not open yet. Our team can help with product and order enquiries.",
  },
  cart: {
    title: "Your project bag.",
    description:
      "Online purchasing is not open yet. You can explore the products and prepare a product or bulk enquiry.",
  },
  checkout: {
    title: "Let’s confirm the details first.",
    description:
      "Online checkout is not open yet. Contact SRV to confirm pricing, availability, GST and delivery before ordering.",
  },
  "order-confirmation": {
    title: "No order to display.",
    description:
      "This page does not contain a confirmed order. If you placed an order with SRV, contact the team with your reference.",
  },
  "track-order": {
    title: "Need an update on your order?",
    description:
      "Online order tracking is not available yet. Contact SRV with your order reference and purchase details.",
  },
  "shipping-policy": { title: "Shipping policy", description: "" },
  "return-policy": { title: "Returns & support", description: "" },
  "privacy-policy": { title: "Privacy policy", description: "" },
  terms: { title: "Terms & conditions", description: "" },
};
const sourceMap: Record<string, string> = {
  about: "about-us",
  terms: "terms-and-condition",
  "shipping-policy": "shipping-policy",
  "return-policy": "return-policy",
  "privacy-policy": "privacy-policy",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: pages[slug]?.title || "Page not found" };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug];
  if (slug === "dealer-registration") redirect("/contact");
  if (!Object.hasOwn(pages,slug)) notFound();
  const data = await getHome();
  const source = slug === "about" ? undefined : data.pages.find((p) => p.slug === sourceMap[slug]);
  const enquiry = slug === "bulk-enquiry";
  return (
    <>
      <Header whatsapp={data.settings.whatsappNumber} />
      <main id="main" className={"wrap page-body information-page" + (slug === "contact" ? " contact-page" : "")}>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} />
          <span>{slug.replaceAll("-", " ")}</span>
        </nav>
        <div className="information-heading">
          <div className="eyebrow">SRV ELECTRICALS</div>
          <h1>{page.title}</h1>
          {page.description && <p>{page.description}</p>}
        </div>
        {source && (
          <>
            <article
              className="source-richtext policy-content"
              dangerouslySetInnerHTML={{ __html: source.html }}
            />
            <p className="source-attribution">
              Content from <a href={source.sourceUrl}>SRV Electricals</a> ·
              Captured {new Date(data.importedAt).toLocaleDateString("en-IN")}
            </p>
          </>
        )}
        {slug === "categories" && (
          <div className="all-categories-grid">
            {categories.map((c) => (
              <Link
                className="all-category-card"
                key={c.slug}
                href={"/shop?category=" + c.slug}
              >
                <div>
                  <CatalogueImage src={c.image} alt={c.name} />
                </div>
                <h2>{c.name}</h2>
                <p>
                  {c.count} {c.count === 1 ? "product" : "products"}
                  <ArrowUpRight size={17} />
                </p>
              </Link>
            ))}
          </div>
        )}
        {slug === "about" && <section className="customer-story"><span className="eyebrow">YOUR SPACE. YOUR POSSIBILITIES.</span><h2>Everyday essentials, thoughtfully chosen.</h2><p>From your first light fitting to your next home improvement, explore electrical products from SRV Electricals in Mansa, Punjab. Find clear specifications, compare your options and choose what works for your space.</p><div className="why-grid"><article><ShieldCheck /><h3>Choose with clarity</h3><p>See product details and available options before you decide.</p></article><article><ShoppingBag /><h3>Explore products at your pace</h3><p>Browse the range, save products in your cart and plan your order.</p></article><article><Phone /><h3>A little help goes a long way</h3><p>Ask our team about products, availability and delivery.</p></article></div><Link className="button primary" href="/shop">Discover the collection <ArrowUpRight size={17} /></Link></section>}
        {slug === "contact" && (
          <>
            <div className="contact-grid">
              <a className="contact-method-card contact-phone-card"
                href={
                  "tel:" + data.settings.businessPhone.replace(/[^+0-9]/g, "")
                }
              >
                <div className="contact-method-top"><i><Phone size={26} strokeWidth={1.6} /></i><span>A REAL PERSON. A LITTLE GUIDANCE.</span><ArrowUpRight size={18} /></div>
                <h2>Give us a call.</h2>
                <strong>{data.settings.businessPhone}</strong>
                <p>Help with products, purchases and your order</p>
                <span className="contact-method-action">Call our team <ArrowUpRight size={17} /></span>
                <small>Start with a call. We’ll help with the next step.</small>
              </a>
              <a className="contact-method-card contact-email-card" href={"mailto:" + data.settings.businessEmail}>
                <div className="contact-method-top"><i><Mail size={26} strokeWidth={1.6} /></i><span>YOUR QUESTIONS. OUR ATTENTION.</span><ArrowUpRight size={18} /></div>
                <h2>Send your list.</h2>
                <strong>{data.settings.businessEmail}</strong>
                <p>Share products, quantities and specifications</p>
                <span className="contact-method-action">Write to us <ArrowUpRight size={17} /></span>
                <small>Send the details. We’ll take it from there.</small>
              </a>
              <a className="whatsapp-contact-tile" href={"https://wa.me/" + (data.settings.whatsappNumber || "918837684004").replace(/\D/g, "") + "?text=" + encodeURIComponent("Hello SRV, I’d like to chat with your team.")}>
                <div className="whatsapp-tile-top"><i className="whatsapp-tile-icon"><MessageCircle size={29} strokeWidth={1.6} /></i><span>LET’S CONNECT</span></div>
                <h2>A conversation away.</h2>
                <p>Questions about a product or your order? Send us a message and talk directly with our team.</p>
                <span className="whatsapp-tile-button">Chat on WhatsApp <ArrowUpRight size={18} /></span>
                <small>Open WhatsApp to start your conversation</small>
              </a>
            </div>
            <div className="contact-followup">
              <h2>Planning a larger project?</h2>
              <p>
                Prepare your requirements in one place and send them to the
                team.
              </p>
              <Link className="button primary" href="/bulk-enquiry">
                Prepare a product enquiry
                <ArrowRight size={17} />
              </Link>
            </div>
          </>
        )}
        {enquiry && <EnquiryForm />}{" "}
        {!source &&
          ![
            "categories",
            "contact",
            "bulk-enquiry",
            "about",
          ].includes(slug) && (
            <section className="availability-state">
              <div className="state-icon">
                {slug === "cart" ? (
                  <ShoppingBag size={32} />
                ) : slug === "track-order" ? (
                  <PackageSearch size={32} />
                ) : (
                  <ShieldCheck size={32} />
                )}
              </div>
              <h2>Our team is here to help.</h2>
              <p>
                Browse the product range or get in touch for the next step. No
                order or payment has been created on this page.
              </p>
              <div className="product-actions">
                <Link className="button primary" href="/shop">
                  Explore products
                  <ArrowRight size={17} />
                </Link>
                <Link className="button outline" href="/contact">
                  Contact SRV
                </Link>
              </div>
            </section>
          )}
      </main>
      <Footer />
    </>
  );
}
