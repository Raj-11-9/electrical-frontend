import type { Product } from "./catalog";
export type SearchInput = Record<string, string | string[] | undefined>;
export type CatalogueQuery = {
  q: string;
  category: string;
  collection: string;
  sort: string;
  availability: string;
  min: string;
  max: string;
  page: number;
};
const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] || "" : value || "").trim();
export const normalise = (value: string) =>
  value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
const price = (value: string) =>
  value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
    ? String(Number(value))
    : "";
export function parseQuery(input: SearchInput): CatalogueQuery {
  let min = price(first(input.min)),
    max = price(first(input.max));
  if (min !== "" && max !== "" && Number(min) > Number(max))
    [min, max] = [max, min];
  const requested = Number(first(input.page));
  return {
    q: first(input.q).slice(0, 120),
    category: first(input.category),
    collection: first(input.collection),
    sort: ["price-asc", "price-desc", "newest", "name"].includes(
      first(input.sort),
    )
      ? first(input.sort)
      : "",
    availability:
      first(input.availability) === "listed-available"
        ? "listed-available"
        : "",
    min,
    max,
    page: Number.isFinite(requested) ? Math.max(1, Math.floor(requested)) : 1,
  };
}
export function catalogueHref(
  query: CatalogueQuery,
  changes: Partial<CatalogueQuery> = {},
) {
  const next = { ...query, ...changes };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(next))
    if (value !== "" && !(key === "page" && value === 1))
      params.set(key, String(value));
  return "/shop" + (params.size ? "?" + params.toString() : "");
}
export function matchedVariant(
  product: Product,
  q: string,
): string | undefined {
  const key = normalise(q).replace(/\s/g, "");
  return key
    ? product.variants.find(
        (v) => v.sku && normalise(v.sku).replace(/\s/g, "") === key,
      )?.id
    : undefined;
}
export function queryCatalogue(
  products: Product[],
  input: SearchInput,
  pageSize = 12,
) {
  const query = parseQuery(input),
    tokens = normalise(query.q).split(" ").filter(Boolean);
  const filtered = products.filter((p) => {
    const haystack = normalise(
      [p.name, p.category.name, ...p.variants.map((v) => v.sku || "")].join(
        " ",
      ),
    );
    return (
      tokens.every(
        (t) => haystack.includes(t) || haystack.replace(/\s/g, "").includes(t),
      ) &&
      (!query.category || p.collectionSlugs.includes(query.category)) &&
      (!query.collection || p.collectionSlugs.includes(query.collection)) &&
      (!query.availability || p.variants.some((v) => v.available)) &&
      (query.min === "" || Number(p.sellingPrice) >= Number(query.min)) &&
      (query.max === "" || Number(p.sellingPrice) <= Number(query.max))
    );
  });
  if (query.sort === "price-asc")
    filtered.sort((a, b) => Number(a.sellingPrice) - Number(b.sellingPrice));
  if (query.sort === "price-desc")
    filtered.sort((a, b) => Number(b.sellingPrice) - Number(a.sellingPrice));
  if (query.sort === "newest")
    filtered.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (query.sort === "name")
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  const total = filtered.length,
    totalPages = Math.max(1, Math.ceil(total / pageSize));
  query.page = Math.min(query.page, totalPages);
  return {
    query,
    total,
    totalPages,
    items: filtered.slice((query.page - 1) * pageSize, query.page * pageSize),
    start: total ? (query.page - 1) * pageSize + 1 : 0,
    end: Math.min(query.page * pageSize, total),
  };
}
