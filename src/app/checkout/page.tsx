export const dynamic="force-dynamic";
import {getHome} from "@/lib/catalog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckoutView } from "@/components/checkout-view";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasCustomerSession } from "@/lib/customer-session";
export const metadata = { title: "Secure checkout" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach(item => params.append(key, item));
    else if (value !== undefined) params.set(key, value);
  }
  if (!await hasCustomerSession((await cookies()).get("srv-session")?.value)) {
    const next = "/checkout" + (params.size ? "?" + params.toString() : "");
    redirect("/account?reason=checkout&next=" + encodeURIComponent(next));
  }
  const data=await getHome();
  return (
    <>
      <Header whatsapp={data.settings.whatsappNumber}/>
      <main id="main" className="wrap commerce-page">
        <h1>Checkout.</h1>
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
