import {ResponsiveFilters} from '@/components/responsive-filters';
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
  PackageSearch,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProgressiveProducts } from "@/components/progressive-products";
import { categories, getHome } from "@/lib/catalog";
import {
  catalogueHref,
  matchedVariant,
  queryCatalogue,
  type CatalogueQuery,
  type SearchInput,
} from "@/lib/catalogue-query";
export const metadata = {
  title: "Electrical products",
  description:
    "Explore SRV products, variants and technical details. Enquire about retail or bulk supply.",
};

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<SearchInput>;
}) {
  const data = await getHome();
  const input = await searchParams;
  const { query, total, items } = queryCatalogue(
    data.products,
    { ...input, page: "1" },
    Math.max(1, data.products.length),
  );
  const category = categories.find((c) => c.slug === query.category);
  const collection = data.collections.find((c) => c.slug === query.collection);
  const chips: { label: string; changes: Partial<CatalogueQuery> }[] = [];
  if (query.q) chips.push({ label: "Search: " + query.q, changes: { q: "" } });
  if (category) chips.push({ label: category.name, changes: { category: "" } });
  if (collection)
    chips.push({ label: collection.name, changes: { collection: "" } });
  if (query.min)
    chips.push({ label: "From INR " + query.min, changes: { min: "" } });
  if (query.max)
    chips.push({ label: "Up to INR " + query.max, changes: { max: "" } });
  if (query.availability)
    chips.push({ label: "Listed available", changes: { availability: "" } });
  return (
    <>
      <Header whatsapp={data.settings.whatsappNumber} />
      <main id="main" className="shop-page">
        <div className="catalogue-intro">
          <div className="wrap">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link className="back-home" href="/"><ArrowLeft size={14} /> Back to Home</Link>
              <ChevronRight size={13} />
              <span>Products</span>
            </nav>
            <div className="catalogue-heading">
              <div>
                <div className="eyebrow">FIND YOUR ESSENTIALS</div>
                <h1>Product categories</h1>
              </div>
            </div>
            <nav className="product-category-links" aria-label="Product categories">
              <Link href={catalogueHref(query, { category: "", page: 1 })} className={!query.category ? "is-active" : undefined} aria-current={!query.category ? "page" : undefined}>All products</Link>
              {categories.map(c => <Link key={c.slug} href={catalogueHref(query, { category: c.slug, page: 1 })} className={query.category === c.slug ? "is-active" : undefined} aria-current={query.category === c.slug ? "page" : undefined}>{c.name}</Link>)}
            </nav>
          </div>
        </div>
        <div className="wrap shop-layout">
          <aside className="shop-sidebar">
            <ResponsiveFilters>
              <form action="/shop" className="catalogue-filter-form">
                {query.collection && (
                  <input
                    type="hidden"
                    name="collection"
                    value={query.collection}
                  />
                )}
                <label htmlFor="catalogue-search">Product name or SKU</label>
                <div className="filter-search">
                  <Search size={16} />
                  <input
                    id="catalogue-search"
                    name="q"
                    defaultValue={query.q}
                    placeholder="e.g. MCB or SSP 174"
                    maxLength={120}
                  />
                </div>
                <label htmlFor="catalogue-category">Category</label>
                <select
                  id="catalogue-category"
                  name="category"
                  defaultValue={query.category}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <label>Price range (INR)</label>
                <div className="price-inputs">
                  <input
                    aria-label="Minimum price"
                    name="min"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Min"
                    defaultValue={query.min}
                  />
                  <span>–</span>
                  <input
                    aria-label="Maximum price"
                    name="max"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Max"
                    defaultValue={query.max}
                  />
                </div>
                <label htmlFor="catalogue-sort">Sort products</label>
                <select
                  id="catalogue-sort"
                  name="sort"
                  defaultValue={query.sort}
                >
                  <option value="">Product order</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="newest">Newest first</option>
                  <option value="name">Name: A–Z</option>
                </select>
                <label className="filter-check">
                  <input
                    type="checkbox"
                    name="availability"
                    value="listed-available"
                    defaultChecked={!!query.availability}
                  />
                  Listed available at source
                </label>
                <small>
                  Source availability is a snapshot. Confirm current stock
                  before ordering.
                </small>
                <button className="button secondary" type="submit">
                  Apply filters
                  <ArrowRight size={16} />
                </button>
                <Link className="reset-filters" href="/shop">
                  Clear all filters
                </Link>
              </form>
            </ResponsiveFilters>
            <div className="trade-help">
              <span className="eyebrow">BUYING FOR A PROJECT?</span>
              <h3>Let’s work through your list.</h3>
              <p>Tell us what you need for your home or next project.</p>
              <Link href="/bulk-enquiry">
                Request a quotation
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>
          <section className="shop-results" aria-label="Product results">
            <div className="results-toolbar">
              <p role="status">
                {total ? (
                  <>
                    <strong>
                      {total}
                    </strong>{" "}
                    {total === 1 ? "product" : "products"}
                  </>
                ) : (
                  "No products found"
                )}
              </p>
              <span>Retail & trade enquiries</span>
            </div>
            {chips.length > 0 && (
              <div className="active-filters">
                {chips.map((chip) => (
                  <Link
                    key={chip.label}
                    href={catalogueHref(query, { ...chip.changes, page: 1 })}
                    aria-label={"Remove " + chip.label}
                  >
                    {chip.label}
                    <X size={12} />
                  </Link>
                ))}
              </div>
            )}
            {items.length ? (
              <ProgressiveProducts key={JSON.stringify(query)} products={items} search={query.q} />
            ) : (
              <div className="no-results">
                <PackageSearch size={46} strokeWidth={1.2} />
                <h2>Let’s try a different connection.</h2>
                <p>Try a shorter product name or SKU, or widen your filters.</p>
                <Link className="button primary" href="/shop">
                  Browse all products
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
            <p className="catalogue-disclaimer">
              Prices and product details reflect the SRV product information captured on{" "}
              {new Date(data.importedAt).toLocaleDateString("en-IN")}. Confirm
              current stock, GST and delivery costs with our team.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
