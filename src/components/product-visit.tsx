"use client";

import { useEffect } from "react";
import { readRecentProducts, RECENT_PRODUCTS_KEY } from "@/lib/recommendations";

export function ProductVisit({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const recent = readRecentProducts(localStorage.getItem(RECENT_PRODUCTS_KEY));
      localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify([slug, ...recent.filter(item => item !== slug)].slice(0, 20)));
    } catch { /* Browsing still works when browser storage is unavailable. */ }
  }, [slug]);
  return null;
}
