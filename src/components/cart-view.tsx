"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { readCart, writeCart, type CartLine } from "@/lib/cart";
import type { Product } from "@/lib/catalog";
import { formatINR } from "@/lib/enquiry";
import { CatalogueImage } from "./catalogue-image";
import { ArrowRight, ArrowUpRight, ShoppingBag, Minus, Plus, Trash2, PackageCheck, Headphones, Check } from "lucide-react";
export function CartView({ products }: { products: Product[] }) {
  const [lines, setLines] = useState<CartLine[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    setLines(readCart());
    setReady(true);
  }, []);
  function update(next: CartLine[]) {
    try {
      writeCart(next);
      setLines(next);
      setError("");
    } catch {
      setError(
        "Your browser could not save the cart. Allow site storage to continue.",
      );
    }
  }
  const rows = lines.map((line) => {
    const p = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    return { line, p, v: p?.variants.find((v) => v.id === line.variantId) };
  });
  if (!ready) return <p role="status">Loading your cart…</p>;
  if (!lines.length)
    return (
      <div className="commerce-empty cart-empty">
        <span className="cart-empty-icon"><ShoppingBag size={36} strokeWidth={1.5} /></span>
        <span className="eyebrow">ROOM FOR SOMETHING GREAT</span>
        <h2>Every great project starts with a first pick.</h2>
        <p>Discover electrical essentials for your space and add your favourites here.</p>
        <Link className="button primary" href="/shop">
          Find your first essential <ArrowUpRight size={18} />
        </Link>
      </div>
    );
  return (
    <>
      <div className="cart-workspace">
        <div className="cart-selection">
        <div className="cart-list-heading"><h2>Your selection <span>{lines.length}</span></h2><span><Check size={14} /> Saved on this browser</span></div>
        <div className="cart-lines">
          {rows.map(({ line, p, v }) => (
            <article className="cart-line" key={line.variantId}>
              <Link className="cart-image" href={p ? "/products/" + p.slug + "?variant=" + encodeURIComponent(line.variantId) : "/shop"} aria-label={p ? "View " + p.name : "Explore products"}><CatalogueImage
                src={v?.image || p?.images[0]?.url}
                alt={p?.name || "Unavailable product"}
              /></Link>
              <div className="cart-product-copy">
                <span className="cart-category">{p?.category.name || "Unavailable product"}</span>
                <Link
                  className="cart-product-view"
                  href={
                    p ? "/products/" + p.slug + "?variant=" + encodeURIComponent(line.variantId) : "/shop"
                  }
                >
                  <h2>{p?.name || "Product no longer listed"}</h2>
                </Link>
                <p>
                  {v?.name} · {v?.sku}
                </p>
                {v && <strong>{formatINR(v.price)} / unit</strong>}
                <div className="cart-line-actions"><div className="cart-quantity-control">
                  <button type="button" aria-label={"Decrease quantity for " + (p?.name || "product")} disabled={line.quantity <= 1} onClick={() => update(lines.map(i => i.variantId === line.variantId ? { ...i, quantity: i.quantity - 1 } : i))}><Minus size={14} /></button>
                  <input
                    aria-label={
                      "Quantity for " + (v?.sku || p?.name || line.variantId)
                    }
                    type="number"
                    min="1"
                    max="10000"
                    value={line.quantity}
                    onChange={(e) => {
                      const q = Number(e.target.value);
                      if (Number.isInteger(q) && q >= 1 && q <= 10000)
                        update(
                          lines.map((i) =>
                            i.variantId === line.variantId
                              ? { ...i, quantity: q }
                              : i,
                          ),
                        );
                    }}
                  />
                  <button type="button" aria-label={"Increase quantity for " + (p?.name || "product")} disabled={line.quantity >= 10000} onClick={() => update(lines.map(i => i.variantId === line.variantId ? { ...i, quantity: i.quantity + 1 } : i))}><Plus size={14} /></button>
                </div>
                <button
                  type="button"
                  className="remove-cart"
                  aria-label={"Remove " + (p?.name || "unavailable product") + " from cart"}
                  onClick={() =>
                    update(lines.filter((i) => i.variantId !== line.variantId))
                  }
                >
                  <Trash2 size={14} /> Remove
                </button>
                </div>
              </div>
              <div className="cart-line-total"><small>Item total</small><strong>
                {v ? formatINR(Number(v.price) * line.quantity) : "Unavailable"}
              </strong></div>
            </article>
          ))}
        </div>
        <div className="cart-help"><Headphones size={22} /><div><strong>A little help with your choices?</strong><p>Our team can help you find the right product.</p></div><Link href="/contact">Let’s talk <ArrowUpRight size={16} /></Link></div>
        </div>
        <aside className="checkout-summary cart-summary">
          <span className="cart-summary-eyebrow">ONE STEP CLOSER</span>
          <h2>Your order summary</h2>
          <p>{lines.reduce((n, l) => n + l.quantity, 0)} items</p>
          <dl>
            <dt>Listed item subtotal</dt>
            <dd>
              {formatINR(
                rows.reduce(
                  (n, r) => n + (r.v ? Number(r.v.price) * r.line.quantity : 0),
                  0,
                ),
              )}
            </dd>
          </dl>
          <p>
            Pricing, availability, GST and delivery are confirmed at checkout.
          </p>
          {rows.every((r) => r.v) ? (
            <Link className="button primary" href="/checkout">
              Proceed to checkout <ArrowRight size={18} />
            </Link>
          ) : (
            <p role="alert">Remove unavailable products to continue.</p>
          )}
          <Link href="/shop">Explore more products</Link>
          <div className="cart-summary-note"><PackageCheck size={19} /><span>Review your order details before confirming your purchase.</span></div>
        </aside>
      </div>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
