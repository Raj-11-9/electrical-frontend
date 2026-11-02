import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductOptions } from "@/components/product-options";
import { getProduct } from "@/lib/catalog";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { ProductVisit } from "@/components/product-visit";
import { ProgressiveProducts } from "@/components/progressive-products";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { product } = await getProduct(slug);
  return { title: product?.name || "Product not found" };
}
export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}) {
  const { slug } = await params;
  const { product, similarProducts, discoveryProducts, settings, importedAt } = await getProduct(slug);
  if (!product) notFound();
  const requestedVariant = (await searchParams).variant;
  const initialVariantId =
    typeof requestedVariant === "string" ? requestedVariant : undefined;
  return (
    <>
      <ProductVisit slug={product.slug} />
      <Header whatsapp={settings.whatsappNumber} />
      <main id="main" className="wrap page-body">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} />
          <Link href="/shop">Products</Link>
          <ChevronRight size={13} />
          <span>{product.name}</span>
        </nav>
        <ProductOptions
          key={product.id + ":" + initialVariantId}
          product={product}
          initialVariantId={initialVariantId}
        />
        <section className="source-description">
          <h2>Product details & specifications</h2>
          {product.descriptionHtml ? (
            <div
              className="source-richtext"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : (
            <p>
              {product.description ||
                "No further technical specifications are published for this product."}
            </p>
          )}
        </section>
        {product.sourceUrl && (
          <p className="source-attribution">
            Source:{" "}
            <a href={product.sourceUrl}>SRV Electricals products</a> ·
            Retrieved {new Date(importedAt).toLocaleDateString("en-IN")}
          </p>
        )}
        <section className="similar-products" aria-labelledby="similar-products-heading">
          <div className="section-heading"><div><div className="eyebrow">MORE IN {product.category.name.toUpperCase()}</div><h2 id="similar-products-heading">Similar products</h2></div><Link href={"/shop?category=" + encodeURIComponent(product.category.slug)}>View category <ArrowRight size={17} /></Link></div>
          <p className="similar-products-description">{similarProducts.length ? `Explore more from ${product.category.name}, selected from the same category.` : "Discover more electrical essentials for your next project."}</p>
          <ProgressiveProducts key={product.id} products={similarProducts.length ? similarProducts : discoveryProducts} search="" batchSize={4} endLink />
        </section>
      </main>
      <Footer />
    </>
  );
}
