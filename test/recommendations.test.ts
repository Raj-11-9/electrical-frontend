import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Product } from "../src/lib/catalog";
import { readRecentProducts, recommendProducts } from "../src/lib/recommendations";

const products = JSON.parse(readFileSync("src/data/srv.json", "utf8")).products as Product[];

test("recommendations tolerate corrupt storage and limit browsing history", () => {
  assert.deepEqual(readRecentProducts("invalid"), []);
  assert.deepEqual(readRecentProducts('{"slug":"example"}'), []);
  assert.deepEqual(readRecentProducts('["one",1,"one","two"]'), ["one", "two"]);
  assert.equal(readRecentProducts(JSON.stringify(Array.from({ length: 30 }, (_, i) => String(i)))).length, 20);
});

test("recommendations prioritize browsed categories without altering the catalogue", () => {
  const viewed = products.find(p => products.filter(other => other.category.slug === p.category.slug).length > 1)!;
  const original = products.map(p => p.id);
  const ranked = recommendProducts(products, [viewed.slug]);
  assert.equal(ranked[0].category.slug, viewed.category.slug);
  assert.ok(ranked.every(p => p.category.slug === viewed.category.slug));
  assert.ok(ranked.every(p => !p.collectionSlugs.includes("best-sellers")));
  assert.notEqual(ranked[0].slug, viewed.slug);
  assert.deepEqual(products.map(p => p.id), original);
  assert.deepEqual(recommendProducts(products, ["unknown"]), recommendProducts(products, []));
  assert.equal(new Set(ranked.map(p => p.id)).size, ranked.length);
  assert.ok(ranked.length <= 16);
});

test("new visitors see discovery products separate from best sellers", () => {
  const result = recommendProducts(products, []);
  assert.ok(result.length > 0);
  assert.ok(result.every(p => !p.collectionSlugs.includes("best-sellers")));
  const onlyBestSellers = products.filter(p => p.collectionSlugs.includes("best-sellers"));
  assert.deepEqual(recommendProducts(onlyBestSellers, []), []);
});
