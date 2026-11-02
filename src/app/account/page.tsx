export const dynamic="force-dynamic";
import {getHome} from "@/lib/catalog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AccountView } from "@/components/customer-account";
import Link from "next/link";
import "./account.css";
export const metadata = { title: "My account" };
export default async function Page({ searchParams }: { searchParams: Promise<{ reason?: string; next?: string }> }) {
  const query = await searchParams;
  const returnTo = query.reason === "checkout" && query.next && (query.next === "/checkout" || query.next.startsWith("/checkout?")) ? query.next : undefined;
  const data=await getHome();
  return (
    <>
      <Header whatsapp={data.settings.whatsappNumber}/>
      <main id="main" className="wrap commerce-page account-page">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/ Your account</span></nav>
        <AccountView returnTo={returnTo} />
      </main>
      <Footer />
    </>
  );
}
