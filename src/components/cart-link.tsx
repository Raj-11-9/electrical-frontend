"use client";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { readCart } from "@/lib/cart";
export function CartLink() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () =>
      setCount(readCart().reduce((n, i) => n + i.quantity, 0));
    update();
    window.addEventListener("srv-cart", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("srv-cart", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return (
    <Link className="header-action cart-action" href="/cart" aria-label={`Cart${count ? `, ${count} items` : ""}`} aria-current={pathname === "/cart" ? "page" : undefined} title="Your cart">
      <i className="header-action-icon"><ShoppingCart size={22} strokeWidth={1.7} />{count > 0 && <b className="cart-badge">{count > 99 ? "99+" : count}</b>}</i>
      <span>Cart</span>
    </Link>
  );
}
