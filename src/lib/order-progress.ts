export const ORDER_STEPS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;
export const ORDER_LABELS: Record<string, string> = { PENDING: "Order placed", CONFIRMED: "Confirmed", SHIPPED: "Shipped", DELIVERED: "Delivered", CANCELLED: "Cancelled" };
export function orderProgress(status: string) {
  return status === "CANCELLED" ? -1 : ORDER_STEPS.findIndex(step => step === status);
}
