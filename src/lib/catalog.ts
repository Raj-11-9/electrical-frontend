import snapshotData from "@/data/srv.json";
export { categories } from "./taxonomy";
export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  sellingPrice: string;
  category: { name: string; slug: string };
  collectionSlugs: string[];
  images: { id: string; url: string; alt: string }[];
  variants: {
    id: string;
    sku: string | null;
    name: string;
    price: string;
    mrp: string | null;
    available: boolean;
    options: Record<string, string>;
    image: string | null;
    grams: number;
    taxable: boolean;
  }[];
  descriptionHtml: string;
  description: string;
  sourceUrl: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
};
export type HomeSettings = {
  brand: string;
  heroTitle: string;
  heroDescription: string;
  announcement: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessHours: string;
  whatsappNumber: string;
  reviews: { name: string; quote: string }[];
  brands: string[];
  certifications: string[];
};
export type Catalogue = {
  sourceUrl: string;
  importedAt: string;
  sourceHash: string;
  settings: HomeSettings;
  collections: {
    id: string;
    name: string;
    slug: string;
    productIds: string[];
    image: string | null;
    sourceUrl: string;
  }[];
  pages: { slug: string; title: string; html: string; sourceUrl: string }[];
  products: Product[];
  connected: boolean;
  apiConnected?: boolean;
  storage?: "snapshot" | "postgresql";
};
const snapshot = snapshotData as unknown as Omit<Catalogue, "connected">;
let cached: { data: Catalogue; expires: number } | undefined;
let pending: Promise<Catalogue> | undefined;
async function loadCatalogue(): Promise<Catalogue> {
  try {
    const res = await fetch(
      (process.env.API_URL || "http://localhost:4000/api") + "/catalogue",
      { cache: "no-store", signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) throw new Error("API unavailable");
    const current = await res.json();
    if (
      !Array.isArray(current.products) ||
      !current.settings ||
      !Array.isArray(current.pages) ||
      !Array.isArray(current.collections) ||
      !current.products.every(
        (p: Product) =>
          typeof p.name === "string" &&
          typeof p.slug === "string" &&
          Array.isArray(p.images) &&
          Array.isArray(p.variants) &&
          p.variants.length > 0,
      )
    )
      throw new Error("Catalogue missing");
    return {
      ...current,
      ...(current.storage !== "postgresql" ? { products: [], collections: current.collections.map((c: Catalogue["collections"][number]) => ({ ...c, productIds: [] })) } : {}),
      apiConnected: true,
      connected: current.storage === "postgresql",
    };
  } catch {
    return {
      ...snapshot,
      products: [],
      collections: snapshot.collections.map(c => ({ ...c, productIds: [] })),
      storage: "snapshot",
      apiConnected: false,
      connected: false,
    };
  }
}
// Public catalogue only: share a short cache and in-flight request across page + metadata rendering.
export async function getHome(): Promise<Catalogue> {
  if (cached && cached.expires > Date.now()) return cached.data;
  if (pending) return pending;
  pending = loadCatalogue()
    .then((data) => {
      cached = {
        data,
        expires: Date.now() + (data.apiConnected ? 15000 : 3000),
      };
      return data;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}
export async function getProduct(slug: string) {
  const data = await getHome();
  const product = data.products.find((p) => p.slug === slug);
  return {
    product,
    similarProducts: product ? data.products.filter(p => p.id !== product.id && p.category.slug === product.category.slug) : [],
    discoveryProducts: product ? data.products.filter(p => p.id !== product.id && p.category.slug !== product.category.slug).slice(0, 8) : [],
    settings: data.settings,
    connected: data.connected,
    importedAt: data.importedAt,
  };
}
