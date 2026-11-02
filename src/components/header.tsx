"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  House,
  MessageCircle,
  FileText,
  Phone,
  Menu,
  X,
  Zap,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { categories } from "@/lib/taxonomy";
import { CartLink } from "./cart-link";
import { Brand } from "./brand";
import { AccountLink } from "./account-link";
export function Header({
  announcement,
  whatsapp,
}: {
  announcement?: string;
  whatsapp?: string;
}) {
  const [open, setOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const dropdown = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const close = () => {
    setOpen(false);
    if (dropdown.current) dropdown.current.open = false;
  };
  useEffect(() => {
    setOpen(false);
    if (dropdown.current) dropdown.current.open = false;
  }, [pathname]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const outside = (event: PointerEvent) => {
      if (header.current && !header.current.contains(event.target as Node))
        close();
    };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return (
    <>
      <header ref={header} className="store-header">
        <div className="header-main wrap">
          <Brand />
          <form className="search" action="/shop">
            <Search size={19} />
            <input
              name="q"
              aria-label="Search products by name or SKU"
              placeholder="Search products, categories or SKU…"
            />
            <button aria-label="Submit search">
              <ArrowUpRight size={20} />
            </button>
          </form>
          <div className="header-actions">
            <Link className="mobile-home-link" href="/" aria-label="Go to Home">
              <House size={20} />
            </Link>
            <AccountLink />
            <CartLink />
            <Link className="header-action quote-action" href="/bulk-enquiry" aria-label="Request a quotation" aria-current={pathname === "/bulk-enquiry" ? "page" : undefined} title="Get a quote">
              <i className="header-action-icon"><FileText size={21} strokeWidth={1.7} /></i>
              <span>Get a quote</span>
            </Link>
            <Link
              className="header-action header-order"
              href={
                whatsapp
                  ? "https://wa.me/" + whatsapp.replace(/\D/g, "")
                  : "/contact"
              }
              aria-label="Contact SRV on WhatsApp"
              title="WhatsApp order"
            >
              <i className="header-action-icon whatsapp-action-icon"><MessageCircle size={27} strokeWidth={1.6} /><Phone className="whatsapp-phone" size={12} strokeWidth={2} /></i>
              <span>WhatsApp order</span>
            </Link>
            <button
              className="mobile-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
              aria-expanded={open}
              aria-controls="primary-navigation"
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <nav
          className={"nav wrap " + (open ? "is-open" : "")}
          aria-label="Main navigation"
          id="primary-navigation"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) close();
          }}
        >
          <details className="category-menu" ref={dropdown}>
            <summary>
              <Menu size={17} />
              All categories
              <ChevronDown size={14} />
            </summary>
            <div>
              {categories.map((c) => (
                <Link key={c.slug} href={"/shop?category=" + c.slug}>
                  {c.name}
                </Link>
              ))}
            </div>
          </details>
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            Home
          </Link>
          <Link href="/shop" aria-current={pathname === "/shop" ? "page" : undefined}>Products</Link>
          <Link href="/#best-sellers">Best sellers</Link>

          <Link href="/#recommendations">For you</Link>
          <Link href="/contact" aria-current={pathname === "/contact" ? "page" : undefined}>Help & contact</Link>
          <Link href="/track-order" aria-current={pathname === "/track-order" ? "page" : undefined}>Track order</Link>
          <Link
            className="nav-contact"
            href={
              whatsapp
                ? "https://wa.me/" + whatsapp.replace(/\D/g, "")
                : "/contact"
            }
          >
            Let’s talk <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <div className="mobile-order-bar">
        <Link href="/shop">
          <Search size={18} /> Find products
        </Link>
        <Link
          href={
            whatsapp
              ? "https://wa.me/" + whatsapp.replace(/\D/g, "")
              : "/contact"
          }
        >
          <MessageCircle size={18} /> WhatsApp order
        </Link>
      </div>
    </>
  );
}
