export const dynamic="force-dynamic";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartView } from "@/components/cart-view";
import { getHome } from "@/lib/catalog";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import "./cart.css";
export const metadata = { title: "Your cart" };
export default async function Page() {
  const data = await getHome();
  return (
    <>
      <Header whatsapp={data.settings.whatsappNumber} />
      <main id="main" className="wrap commerce-page cart-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/ Cart</span>
        </nav>
        <div className="cart-heading"><div><span className="eyebrow"><ShoppingBag size={15} /> YOUR NEXT PROJECT STARTS HERE</span><h1>A few good choices.</h1><p>Your essentials, all in one place. Make them yours.</p></div><Link href="/shop"><ArrowLeft size={16} /> Keep exploring</Link></div>
        <CartView products={data.products} />
      </main>
      <Footer />
    </>
  );
}
