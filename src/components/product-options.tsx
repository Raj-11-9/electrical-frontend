"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { CatalogueImage } from "./catalogue-image";
import {
  enquiryLinks,
  productEnquiry,
  enquiryQuantity,
  formatINR,
} from "@/lib/enquiry";
import type { Product } from "@/lib/catalog";
export function ProductOptions({
  product,
  initialVariantId,
}: {
  product: Product;
  initialVariantId?: string;
}) {
  const router = useRouter();
  const [cartStatus, setCartStatus] = useState("");
  function add() {
    try {
      addToCart(variantId, enquiryQuantity(quantity));
      setCartStatus("Added to cart");
    } catch (e) {
      setCartStatus((e as Error).message);
    }
  }
  const first =
    product.variants.find((v) => v.id === initialVariantId) ||
    product.variants[0];
  const [variantId, setVariantId] = useState(first.id),
    [activeImage, setActiveImage] = useState(
      first.image || product.images[0]?.url,
    ),
    [quantity, setQuantity] = useState("1"),
    [copyStatus, setCopyStatus] = useState("");
  const variant = product.variants.find((v) => v.id === variantId)!;
  let message = "",
    quantityError = "";
  let quantityTotal: number | null = null;
  try {
    const count = enquiryQuantity(quantity);
    message = productEnquiry(product, variant.id, count);
    quantityTotal = Math.round(Number(variant.price) * 100) * count / 100;
  } catch (error) {
    quantityError = (error as Error).message;
  }
  const links = enquiryLinks(
    message,
    undefined,
    undefined,
    "Product enquiry: " + product.name,
  );
  function moveImage(direction: number) {
    const index = product.images.findIndex((i) => i.url === activeImage);
    const next =
      (Math.max(0, index) + direction + product.images.length) %
      product.images.length;
    setActiveImage(product.images[next]?.url);
  }
  async function copySku() {
    try {
      await navigator.clipboard.writeText(variant.sku || "");
      setCopyStatus("SKU copied");
    } catch {
      setCopyStatus("Select the SKU text to copy it.");
    }
  }
  return (
    <div className="product-detail-grid">
      <div className="product-gallery">
        <div
          className="detail-image"
          tabIndex={0}
          aria-label="Product image gallery. Use left and right arrow keys to browse images."
          onKeyDown={(e) => {
            if (
              product.images.length > 1 &&
              ["ArrowLeft", "ArrowRight"].includes(e.key)
            ) {
              e.preventDefault();
              moveImage(e.key === "ArrowLeft" ? -1 : 1);
            }
          }}
        >
          <CatalogueImage
            key={activeImage}
            src={activeImage}
            alt={product.name}
            eager
          />
          {product.images.length > 1 && (
            <div className="gallery-controls">
              <button
                type="button"
                onClick={() => moveImage(-1)}
                aria-label="Previous product image"
              >
                <ArrowLeft size={18} />
              </button>
              <span>
                {Math.max(
                  0,
                  product.images.findIndex((i) => i.url === activeImage),
                ) + 1}{" "}
                / {product.images.length}
              </span>
              <button
                type="button"
                onClick={() => moveImage(1)}
                aria-label="Next product image"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="image-thumbnails">
          {product.images.map((image, i) => (
            <button
              type="button"
              key={image.id}
              aria-label={"View product image " + (i + 1)}
              aria-pressed={activeImage === image.url}
              onClick={() => setActiveImage(image.url)}
            >
              <CatalogueImage src={image.url} alt={image.alt} />
            </button>
          ))}
        </div>
        <div className="product-assurance">
          <CheckCircle2 size={17} />
          <span>Product details supplied by SRV Electricals</span>
        </div>
      </div>
      <div className="product-summary">
        <div className="eyebrow">SRV ELECTRICALS / {product.category.name}</div>
        <h1>{product.name}</h1>
        <div className="product-sku-row">
          <span>
            SKU: <strong>{variant.sku || "Not published"}</strong>
          </span>
          {variant.sku && (
            <button
              type="button"
              onClick={copySku}
              aria-label="Copy product SKU"
            >
              <Copy size={14} />
            </button>
          )}
          <span role="status">{copyStatus}</span>
        </div>
        <p className="detail-price">
          {formatINR(variant.price)}
          {variant.mrp && Number(variant.mrp) > Number(variant.price) && (
            <del>{formatINR(variant.mrp)}</del>
          )}
        </p>
        <span className="price-caption">
          Listed unit price · confirm applicable GST
        </span>
        <div className="variant-selection">
          <label className="variant-label" htmlFor="variant">
            Choose your variant <span>{product.variants.length} options</span>
          </label>
          <select
            id="variant"
            value={variantId}
            onChange={(e) => {
              const selected = product.variants.find(
                (v) => v.id === e.target.value,
              )!;
              setVariantId(selected.id);
              setActiveImage(selected.image || product.images[0]?.url);
              setCopyStatus("");
            }}
          >
            {product.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — {formatINR(v.price)}
              </option>
            ))}
          </select>
        </div>
        <dl className="variant-attributes">
          {Object.entries(variant.options).map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="stock-note">
          <span
            className={
              variant.available
                ? "availability-dot available"
                : "availability-dot"
            }
          />
          {variant.available ? "Listed available" : "Listed unavailable"} in the
          source products. Current stock to be confirmed.
        </div>
        <label className="variant-label" htmlFor="enquiry-quantity">
          Quantity
        </label>
        <div className="quantity-price-row">
        <input
          id="enquiry-quantity"
          className="quantity-input"
          type="number"
          min="1"
          max="10000"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          aria-invalid={!!quantityError}
          aria-describedby={quantityError ? "quantity-error" : "quantity-total"}
        />
        <div className="quantity-total" id="quantity-total" role="status" aria-live="polite" aria-atomic="true">
          <span>Product total</span>
          <strong>{quantityTotal === null ? "—" : formatINR(quantityTotal)}</strong>
          <small>{quantityTotal === null ? "Enter a valid quantity" : `${quantity} × ${formatINR(variant.price)} · GST & delivery confirmed separately`}</small>
        </div>
        </div>
        {quantityError && (
          <p className="form-error" id="quantity-error" role="alert">
            {quantityError}
          </p>
        )}
        <div className="purchase-actions">
          <button
            type="button"
            className="button secondary"
            disabled={!!quantityError}
            onClick={add}
          >
            Add to Cart
          </button>
          <button
            type="button"
            className="button primary"
            disabled={!!quantityError}
            onClick={() =>
              router.push(
                "/checkout?variant=" +
                  encodeURIComponent(variantId) +
                  "&quantity=" +
                  enquiryQuantity(quantity),
              )
            }
          >
            Buy Now
          </button>
        </div>
        {cartStatus && (
          <p className="cart-feedback" role="status">
            {cartStatus} <Link href="/cart">View cart</Link>
          </p>
        )}
        <div className="product-actions">
          {message ? (
            <>
              <a className="button primary" href={links.whatsapp}>
                <MessageCircle size={18} />
                Request order on WhatsApp
              </a>
              <a className="button outline" href={links.email}>
                <Mail size={17} />
                Email enquiry
              </a>
            </>
          ) : (
            <button className="button primary" disabled>
              Enter a valid quantity
            </button>
          )}
          <a className="product-phone" href="tel:+918837684004">
            <Phone size={15} />
            +91 88376 84004
          </a>
        </div>
        <p className="enquiry-hint">
          WhatsApp opens a prepared message. Press Send to share it with SRV.
          This is an enquiry, not a confirmed order.
        </p>
      </div>
    </div>
  );
}
