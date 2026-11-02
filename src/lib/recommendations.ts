import type { Product } from "./catalog";

export const RECENT_PRODUCTS_KEY = "srv-recent-products";

export function readRecentProducts(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? [...new Set(parsed.filter((item): item is string => typeof item === "string"))].slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function recommendProducts(products: Product[], recent: string[]): Product[] {
  const interests = new Map<string, number>();
  recent.forEach((slug, index) => {
    const product = products.find(p => p.slug === slug);
    if (product) interests.set(product.category.slug, (interests.get(product.category.slug) || 0) + 20 - index);
  });
  const score = (p: Product) => (interests.get(p.category.slug) || 0) * 10
    + (p.collectionSlugs.includes("featured-products") ? 2 : 0)
    - (recent.includes(p.slug) ? 5 : 0);
  const candidates = products.filter(p => !p.collectionSlugs.includes("best-sellers"));
  const relevant = interests.size ? candidates.filter(p => interests.has(p.category.slug)) : candidates;
  return [...relevant].sort((a, b) => score(b) - score(a)).slice(0, 16);
}
