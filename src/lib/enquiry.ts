import type { Product } from "./catalog";
import { normalizeIndianPhone } from "./phone";
export function enquiryQuantity(value: string | number): number {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 10000)
    throw new Error("Enter a quantity from 1 to 10,000.");
  return number;
}
export function productEnquiry(
  product: Product,
  variantId: string,
  quantity: number,
) {
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) throw new Error("Choose a valid product option.");
  const count = enquiryQuantity(quantity);
  return [
    "Product enquiry: " + product.name,
    "Variant: " + variant.name,
    "SKU: " + (variant.sku || "Not published"),
    "Requested quantity: " + count,
    "Listed unit price: INR " + variant.price,
    "Product: " + product.sourceUrl,
    "Please confirm current availability, GST, minimum order and delivery charges.",
  ].join("\n");
}
export function enquiryLinks(
  message: string,
  phone = "918837684004",
  email = "info@srvelectricals.com",
  subject = "SRV Electricals enquiry",
) {
  return {
    whatsapp:
      "https://wa.me/" +
      phone.replace(/\D/g, "") +
      "?text=" +
      encodeURIComponent(message),
    email:
      "mailto:" +
      email +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(message),
  };
}
export function formatINR(value: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export type TradeDetails = {
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
  gstin: string;
  requirements: string;
};
export function tradeEnquiry(details: TradeDetails) {
  const d = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, value.trim()]),
  ) as TradeDetails;
  if (!d.name || !d.requirements)
    throw new Error("Add your name and requirements.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))
    throw new Error("Enter a valid email address.");
  d.phone = normalizeIndianPhone(d.phone);
  if (d.gstin && !/^[0-9A-Z]{15}$/i.test(d.gstin))
    throw new Error("GSTIN must contain 15 letters and numbers.");
  return [
    "Product enquiry — SRV Electricals",
    "Name: " + d.name,
    "Company: " + (d.company || "Not provided"),
    "Email: " + d.email,
    "Phone: " + d.phone,
    "City / delivery location: " + (d.city || "To be confirmed"),
    ...(d.gstin ? ["GSTIN: " + d.gstin.toUpperCase()] : []),
    "Requirements:\n" + d.requirements,
    "Please contact me with availability, pricing, GST and delivery information.",
  ].join("\n");
}
