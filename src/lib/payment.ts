export const PAYMENT_OPTIONS = [
  { id: "RAZORPAY", title: "Pay online", description: "Choose UPI, credit / debit card or net banking in secure Razorpay checkout." },
  { id: "COD", title: "Cash on delivery", description: "Pay when your order arrives. No online payment required." },
] as const;

export function availablePaymentMethods(methods: unknown): string[] {
  return PAYMENT_OPTIONS.filter(option => Array.isArray(methods) && methods.includes(option.id)).map(option => option.id);
}
export function selectPaymentMethod(methods: unknown, previous: string): string {
  const available = availablePaymentMethods(methods);
  return available.includes(previous) ? previous : available[0] || "";
}
