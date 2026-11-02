export const dynamic="force-dynamic";
import {getHome} from "@/lib/catalog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import "./tracking.css";
import { CustomerOrderHistory } from "@/components/customer-order-history";
import { Truck, ArrowUpRight } from "lucide-react";
export const metadata = { title: "Track your order" };
export default async function Page() {
  const data=await getHome();
  return (
    <>
      <Header whatsapp={data.settings.whatsappNumber}/>
      <main id="main" className="wrap commerce-page tracking-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/ Track order</span></nav>
        <div className="tracking-support-strip"><span><Truck size={19} /> Your purchases. Your progress. One place.</span><Link href="/contact">Need help with an order? <ArrowUpRight size={15} /></Link></div>
        <CustomerOrderHistory />
      </main>
      <Footer />
    </>
  );
}
