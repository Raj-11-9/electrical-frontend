"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/catalog";
import { readRecentProducts, recommendProducts, RECENT_PRODUCTS_KEY } from "@/lib/recommendations";
import { ProductCard } from "./product-card";
import { ProductCarousel } from "./product-carousel";

export function HomeRecommendations({ products }: { products: Product[] }) {
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    const update = () => {
      try { setRecent(readRecentProducts(localStorage.getItem(RECENT_PRODUCTS_KEY))); }
      catch { setRecent([]); }
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("pageshow", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("pageshow", update);
      window.removeEventListener("focus", update);
    };
  }, []);
  const personalized = products.some(p => recent.includes(p.slug));
  const recommended = recommendProducts(products, recent);
  return <>
    {recommended.length === 0 ? <div className="recommendation-empty"><h3>Your next discovery is waiting.</h3><p>Explore more product categories to find recommendations here.</p><a className="button secondary" href="/shop">Explore products</a></div> : <>
    <p className="recommendation-caption">{personalized ? "Inspired by products you recently viewed on this browser." : "A curated selection to get you started. Explore products to make it yours."}</p>
    <ProductCarousel key={recommended.map(p => p.id).join(",")}>
      {recommended.map(p => <ProductCard key={p.id} product={p} />)}
    </ProductCarousel>
    </>}
  </>;
}
