"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Check } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { matchedVariant } from "@/lib/catalogue-query";
import { ProductCard } from "./product-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function ProgressiveProducts({ products, search, batchSize = 12, endLink = false }: { products: Product[]; search: string; batchSize?: number; endLink?: boolean }) {
  const [visible, setVisible] = useState(batchSize);
  const sentinel = useRef<HTMLDivElement>(null);
  const shown = Math.min(visible, products.length);
  const hasMore = shown < products.length;
  useEffect(() => {
    const target = sentinel.current;
    if (!hasMore || !target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        setVisible(count => Math.min(count + batchSize, products.length));
      }
    }, { rootMargin: "0px 0px 180px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, visible, products.length, batchSize]);
  return <>
    <div className="source-products-grid shop-product-grid">
      {products.slice(0, shown).map(product => <ProductCard key={product.id} product={product} variantId={matchedVariant(product, search)} />)}
    </div>
    <div className="progressive-footer" ref={sentinel}>
      <p role="status" aria-live="polite">Showing <strong>{shown}</strong> of <strong>{products.length}</strong> products</p>
      <div className="catalogue-progress" aria-hidden="true"><span style={{width: `${products.length ? shown / products.length * 100 : 0}%`}} /></div>
      {hasMore ? <><span className="scroll-hint"><ArrowDown size={15}/> Scroll to explore more</span><button type="button" className="button outline" onClick={() => setVisible(count => Math.min(count + batchSize, products.length))}>Show more products <ArrowDown size={15}/></button></> : <span className="scroll-hint"><Check size={15}/> You’ve explored this entire selection</span>}
    </div>
    {endLink && !hasMore && <div className="similar-products-end"><Link className="button secondary" href="/shop">Explore products <ArrowRight size={17} /></Link></div>}
    <noscript><p className="catalogue-disclaimer">Enable JavaScript to reveal the rest of this selection as you scroll. Search and category filters remain available above.</p></noscript>
  </>;
}
