export type CartLine = { variantId: string; quantity: number };
const KEY = "srv-cart-v1";
export function readCart(): CartLine[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v)
      ? v
          .filter(
            (i) =>
              typeof i.variantId === "string" &&
              i.variantId.length < 100 &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0 &&
              i.quantity <= 10000,
          )
          .slice(0, 100)
      : [];
  } catch {
    return [];
  }
}
export function writeCart(lines: CartLine[]) {
  localStorage.setItem(KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event("srv-cart"));
}
export function addToCart(variantId: string, quantity: number) {
  const lines = readCart();
  const existing = lines.find((i) => i.variantId === variantId);
  if (existing) {
    if (existing.quantity + quantity > 10000)
      throw Error("Maximum quantity is 10,000");
    existing.quantity += quantity;
  } else {
    if (lines.length >= 100)
      throw Error("Your cart contains the maximum 100 variants");
    lines.push({ variantId, quantity });
  }
  writeCart(lines);
}
