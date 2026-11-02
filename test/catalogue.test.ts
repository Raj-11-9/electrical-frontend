import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Product } from "../src/lib/catalog";
import {
  queryCatalogue,
  parseQuery,
  catalogueHref,
  matchedVariant,
} from "../src/lib/catalogue-query";
import {
  enquiryQuantity,
  productEnquiry,
  enquiryLinks,
  tradeEnquiry,
} from "../src/lib/enquiry";
const products = JSON.parse(
  readFileSync(resolve(process.cwd(), "src/data/srv.json"), "utf8"),
).products as Product[];
test("empty and repeated URL parameters do not crash search", () => {
  assert.equal(queryCatalogue(products, {}).total, 112);
  const result = queryCatalogue(products, {
    q: [" MCB ", "ignored"],
    category: ["", "anything"],
  });
  assert.ok(result.total > 0);
  assert.equal(result.query.q, "MCB");
});
test("multi-token and compact supplier-SKU searches work", () => {
  assert.ok(queryCatalogue(products, { q: "MCB distribution" }).total > 0);
  const result = queryCatalogue(products, { q: "SSP174" });
  assert.equal(result.total, 1);
  const id = matchedVariant(result.items[0], "SSP174");
  assert.equal(
    result.items[0].variants.find((v) => v.id === id)?.sku,
    "SSP 174",
  );
});
test("price ranges, reversed bounds and sort order are consistent", () => {
  const result = queryCatalogue(products, {
    min: "1500",
    max: "100",
    sort: "price-desc",
  });
  assert.equal(result.query.min, "100");
  assert.equal(result.query.max, "1500");
  assert.ok(
    result.items.every(
      (p) => Number(p.sellingPrice) >= 100 && Number(p.sellingPrice) <= 1500,
    ),
  );
  assert.ok(
    result.items.every(
      (p, i, a) =>
        i === 0 || Number(a[i - 1].sellingPrice) >= Number(p.sellingPrice),
    ),
  );
  assert.equal(parseQuery({ min: "NaN" }).min, "");
});
test("pagination clamps negative, fractional, non-finite and excessive pages", () => {
  assert.equal(queryCatalogue(products, { page: "Infinity" }).query.page, 1);
  assert.equal(queryCatalogue(products, { page: "-99" }).query.page, 1);
  assert.equal(queryCatalogue(products, { page: "2.8" }).query.page, 2);
  const last = queryCatalogue(products, { page: "9999" });
  assert.equal(last.query.page, last.totalPages);
  assert.equal(last.end, 112);
});
test("pagination preserves filters and source collection context", () => {
  const query = parseQuery({
    q: "MCB",
    category: "mcb-distribution-box",
    collection: "featured-products",
    min: "10",
    max: "9000",
    sort: "price-asc",
    availability: "listed-available",
  });
  const params = new URL(catalogueHref(query, { page: 2 }), "http://localhost")
    .searchParams;
  for (const key of [
    "q",
    "category",
    "collection",
    "min",
    "max",
    "sort",
    "availability",
  ])
    assert.equal(params.get(key), String(query[key as keyof typeof query]));
  assert.equal(params.get("page"), "2");
});
test("stock filtering uses source availability without inventing quantities", () => {
  const result = queryCatalogue(products, { availability: "listed-available" });
  assert.ok(result.items.every((p) => p.variants.some((v) => v.available)));
  assert.equal("quantity" in result.items[0], false);
});
test("product enquiry follows selected variant, quantity and encoded URLs", () => {
  const p = products.find(
    (p) => p.slug === "domestic-submersible-pump-starter",
  )!;
  const v = p.variants.find((v) => v.sku === "SSP 174")!;
  const message = productEnquiry(p, v.id, 12);
  assert.match(message, /SSP 174/);
  assert.match(message, /Requested quantity: 12/);
  assert.match(message, /511.00/);
  assert.equal(
    new URL(enquiryLinks(message).whatsapp).searchParams.get("text"),
    message,
  );
  assert.throws(() => productEnquiry(p, "missing", 1));
});
test("invalid enquiry quantities are rejected", () => {
  for (const value of ["", 0, -1, 1.5, 10001, "NaN"])
    assert.throws(() => enquiryQuantity(value));
  assert.equal(enquiryQuantity("20"), 20);
});
test("trade enquiry validates contact information and preserves requirements", () => {
  const d = {
    name: "Test Buyer",
    company: "Test Company",
    phone: "9876543210",
    email: "buyer@example.com",
    city: "Mansa",
    gstin: "",
    requirements: "MCB boxes, 20 units",
  };
  const message = tradeEnquiry(d);
  assert.match(message, /Product enquiry/);
  assert.match(message, /MCB boxes, 20 units/);
  assert.throws(() => tradeEnquiry({ ...d, email: "invalid" }));
  assert.throws(() => tradeEnquiry({ ...d, phone: "123" }));
  assert.throws(() => tradeEnquiry({ ...d, gstin: "bad" }));
});
