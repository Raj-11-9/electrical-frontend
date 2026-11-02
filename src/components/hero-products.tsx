"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/catalog";

export function HeroProducts({ products, bestSellers }: { products: Product[]; bestSellers: boolean }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (products.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % products.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [products.length]);
  const product = products[index % products.length];
  if (!product) return null;
  return <>
    <div className="showcase-heading"><span><span className="status-dot" /> {bestSellers ? "SRV BEST SELLERS" : "THE SRV COLLECTION"}</span><span>{index + 1} / {products.length}</span></div>
    <Link href={"/products/" + product.slug} className="showcase-main">
      <span className="showcase-category">{product.category.name}</span>
      <img key={product.id} src={product.images[0]?.url} alt={product.name} width="420" height="300" fetchPriority={index === 0 ? "high" : "auto"} />
      <div className="showcase-caption"><div><small>{bestSellers ? "BEST SELLING ELECTRICAL ESSENTIALS" : "BUILT AROUND YOUR PROJECT"}</small><h2>{product.name}</h2></div><span className="showcase-arrow"><ArrowUpRight size={23} /></span></div>
    </Link>
  </>;
}
