import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { CatalogueImage } from "./catalogue-image";
import { formatINR } from "@/lib/enquiry";
export function ProductCard({
  product: p,
  variantId,
}: {
  product: Product;
  variantId?: string;
}) {
  const selected = p.variants.find(variant=>variant.id===variantId);
  return (
    <Link
      className="product-card source-product-card"
      aria-label={"View " + p.name + " details and options"}
      href={
        "/products/" +
        p.slug +
        (variantId ? "?variant=" + encodeURIComponent(variantId) : "")
      }
      prefetch={false}
    >
      <div className="source-product-image">
        <CatalogueImage
          src={p.images[0]?.url}
          alt={p.images[0]?.alt || p.name}
        />
      </div>
      <small>{p.category.name}</small>
      <h3>{p.name}</h3>
      <div className="source-sku">
        {(selected?.sku||p.sku) ? "SKU " + (selected?.sku||p.sku) : "SKU not published"} · {p.variants.length}{" "}
        {p.variants.length === 1 ? "variant" : "variants"}
      </div>
      <p>
        <strong>
          {!selected&&p.variants.length > 1 ? "From " : ""}
          {formatINR(selected?.price||p.sellingPrice)}
        </strong>
        <ArrowUpRight size={18} />
      </p>
      <span className="source-product-link">View product & options</span>
    </Link>
  );
}
