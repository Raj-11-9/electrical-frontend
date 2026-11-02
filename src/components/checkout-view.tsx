"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ShieldCheck, CreditCard, Truck, CheckCircle2 } from "lucide-react";
import { commerce, OrderSummary } from "./customer-account";
import { readCart, writeCart, type CartLine } from "@/lib/cart";
import { PAYMENT_OPTIONS, availablePaymentMethods, selectPaymentMethod } from "@/lib/payment";
import { formatINR } from "@/lib/enquiry";
import { CheckoutAddresses } from "./checkout-addresses";
import { PhoneInput } from "./phone-input";
declare global {
  interface Window {
    Razorpay: any;
  }
}
let razorpayLoader: Promise<void> | null = null;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (razorpayLoader) return razorpayLoader;
  razorpayLoader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const fail = () => {
      clearTimeout(timer);
      script.remove();
      razorpayLoader = null;
      reject(Error("Payment checkout could not load. Your order is saved; please retry payment."));
    };
    const timer = setTimeout(fail, 15000);
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      if (!window.Razorpay) { fail(); return; }
      clearTimeout(timer);
      resolve();
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return razorpayLoader;
}
export function CheckoutView() {
  const [items, setItems] = useState<CartLine[] | null>(null),
    [quote, setQuote] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState<any>(null),
    [method, setMethod] = useState(""),
    [refresh, setRefresh] = useState(0),
    [payment, setPayment] = useState<any>(null),
    [quoting, setQuoting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState("");
  const [addressReady, setAddressReady] = useState(false);
  useEffect(() => { commerce("me").then(setProfile).catch(e => setProfileError(e.message)); }, []);
  const submissionLock = useRef(false);
  const paymentLock = useRef(false);  useEffect(() => {    if (!order?.number || !order?.trackingToken || ["DELIVERED", "CANCELLED"].includes(order.status)) return;    let active = true;    const timer = setInterval(() => {      if (document.hidden) return;      commerce("track", { number: order.number, token: order.trackingToken })        .then(latest => { if (active) setOrder(latest); })        .catch(() => { /* Keep the last verified order until the next refresh. */ });    }, 15000);    return () => { active = false; clearInterval(timer); };  }, [order?.number, order?.trackingToken, order?.status]);
  const key = useRef(""),
    direct = useRef(false),
    saved = useRef(false);
  useEffect(() => {
    key.current = crypto.randomUUID();
    const query = new URLSearchParams(location.search),
      v = query.get("variant"),
      q = Number(query.get("quantity") || 1);
    const savedNumber=query.get("order");
    if(savedNumber){try{const remembered=JSON.parse(sessionStorage.getItem("srv-order-"+savedNumber)||"null");if(remembered){setOrder(remembered);setItems([]);const restoredPayment=JSON.parse(sessionStorage.getItem("srv-payment-"+savedNumber)||"null");setPayment(restoredPayment);if(restoredPayment?.items){setItems(restoredPayment.items);direct.current=!!restoredPayment.direct;}commerce("track",{number:remembered.number,token:remembered.trackingToken}).then(setOrder).catch(e=>setError(e.message));return}}catch{}}
    direct.current = !!v;
    setItems(
      v && Number.isInteger(q) && q >= 1 && q <= 10000
        ? [{ variantId: v, quantity: q }]
        : readCart(),
    );
  }, []);
  useEffect(() => {
    if (!items?.length || order) return;
    let current = true;
    setError("");
    setQuote(null);
    setQuoting(true);
    commerce("quote", { items })
      .then((q) => {
        if (current) {
          setQuote(q);
          setMethod(previous => selectPaymentMethod(q.methods, previous));
        }
      })
      .catch((e) => {
        if (current) setError(e.message);
      }).finally(() => { if (current) setQuoting(false); });
    return () => {
      current = false;
    };
  }, [items, refresh, order]);
  function clearPurchased() {
    if (saved.current) return;
    if (!direct.current) {
      try {
        const current = readCart();
        writeCart(
          current.flatMap((i) => {
            const bought =
              items?.find((b) => b.variantId === i.variantId)?.quantity || 0;
            return i.quantity > bought
              ? [{ ...i, quantity: i.quantity - bought }]
              : [];
          }),
        );
      } catch {
        /* Order is already persisted; browser storage must not hide it. */
      }
    }
    saved.current = true;
  }
  async function refreshOrder(currentOrder = order) {
    const confirmed = await commerce("track", { number: currentOrder.number, token: currentOrder.trackingToken });
    setOrder(confirmed);
    try { sessionStorage.setItem("srv-order-" + confirmed.number, JSON.stringify(confirmed)); } catch {}
    if (confirmed.payments?.some((p: any) => p.status === "PAID")) {
      setPayment(null);
      clearPurchased();
      try { sessionStorage.removeItem("srv-payment-" + confirmed.number); } catch {}
    }
    return confirmed;
  }
  async function openPayment(details: any, currentOrder = order) {
    if (paymentLock.current) return;
    paymentLock.current = true;
    setBusy(true);
    setError("");
    try {
      const latest = await refreshOrder(currentOrder);
      if (latest.payments?.some((p: any) => p.status === "PAID")) {
        paymentLock.current = false;
        setBusy(false);
        return;
      }
      await loadRazorpay();
      const checkout = new window.Razorpay({
        ...details.options,
        name: "SRV Electricals",
        prefill: details.prefill,
        theme: { color: "#1565c0" },
        handler: async (response: unknown) => {
          try {
            await commerce("payments/verify", response);
            await refreshOrder(currentOrder);
            setError("");
          } catch (e) {
            setError((e as Error).message + " Refresh payment status before trying again.");
          } finally { paymentLock.current = false; setBusy(false); }
        },
        modal: { ondismiss: () => {
          paymentLock.current = false;
          setBusy(false);
          setError("Payment window closed. Your order is saved. Refresh its status or retry payment below.");
        } },
      });
      checkout.on("payment.failed", () => {
        setError("Payment did not complete. You can try another payment method in the payment window, or close it and retry below.");
      });
      checkout.open();
    } catch (e) {
      paymentLock.current = false;
      setBusy(false);
      setError((e as Error).message);
    }
  }
  const paid = order?.payments?.some((p: any) => p.status === "PAID");
  if (items === null) return <p role="status">Loading checkout…</p>;
  if (!items.length && !order)
    return (
      <div className="commerce-empty">
        <h2>Your cart is empty.</h2>
        <Link href="/shop" className="button primary">
          Explore products
        </Link>
      </div>
    );
  return (
    <>
      <div className="checkout-intro"><span><ShieldCheck size={18} /> Secure checkout</span><p>Electrical essentials, delivered to your door.</p></div>
      <ol className="checkout-steps" aria-label="Checkout progress"><li><CheckCircle2 size={17} /> Your selection</li><li aria-current={order ? undefined : "step"}>2 · Delivery & payment</li><li aria-current={order ? "step" : undefined}>3 · Order saved</li></ol>
      {order ? (
        <>
          <div className="order-success">
            <h2>{paid ? "Payment successful. Thank you!" : "Your order has been saved."}</h2>
            <p>
              Save your order number and private tracking code below. Order
              acceptance and payment status are shown separately.
            </p>
          </div>
          <OrderSummary order={order} />
          <div className="payment-actions">
            {payment && !paid && <button type="button" className="button primary" disabled={busy} onClick={() => openPayment(payment)}>{busy ? "Processing payment…" : "Complete payment"}</button>}
            <button type="button" className="button outline" disabled={busy} onClick={async () => {
              setBusy(true); setError("");
              try { await refreshOrder(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
            }}>Refresh order status</button>
            <Link className="button outline" href="/shop">Explore more products</Link>
          </div>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <Link href="/account">View your account</Link>
        </>
      ) : (
        <div className="checkout-layout">
          <form
            id="checkout-form"
            className="commerce-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!addressReady || busy || submissionLock.current || !quote || !availablePaymentMethods(quote.methods).includes(method)) return;
              submissionLock.current = true;
              setBusy(true);
              setError("");
              const values = Object.fromEntries(new FormData(e.currentTarget));
              try {
                const payload = {
                  items,
                  method,
                  customer: {
                    name: values.name,
                    email: values.email,
                    phone: values.phone,
                  },
                  address: {
                    line1: values.line1,
                    line2: values.line2,
                    city: values.city,
                    state: values.state,
                    pinCode: values.pinCode,
                  },
                  companyName: values.companyName,
                  gstin: values.gstin,
                  notes: values.notes,
                };
                const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify(payload)));
                const fingerprint=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
                const pendingKey="srv-pending-"+fingerprint;
                try{const pending=JSON.parse(sessionStorage.getItem(pendingKey)||"null");if(pending&&Date.now()-pending.at<20*60*1000)key.current=pending.key;else{key.current=crypto.randomUUID();sessionStorage.setItem(pendingKey,JSON.stringify({key:key.current,at:Date.now()}))}}catch{}
                const result = await commerce("orders", {...payload,idempotencyKey:key.current});
                try{sessionStorage.removeItem(pendingKey)}catch{}
                setOrder(result.order);
                try{sessionStorage.setItem("srv-order-"+result.order.number,JSON.stringify(result.order));history.replaceState(null,"","/checkout?order="+encodeURIComponent(result.order.number));}catch{}
                if (result.razorpay) {
                  const nextPayment = { items, direct: direct.current, options: result.razorpay, prefill: { name: values.name, email: values.email, contact: values.phone } };
                  setPayment(nextPayment);
                  try { sessionStorage.setItem("srv-payment-" + result.order.number, JSON.stringify(nextPayment)); } catch {}
                  await openPayment(nextPayment, result.order);
                } else clearPurchased();
              } catch (e) {
                setError((e as Error).message);
              } finally {
                submissionLock.current = false;
                if (!paymentLock.current) setBusy(false);
              }
            }}
          >
            <h2>Contact & delivery</h2>
            <p>
              Your order will be saved to your signed-in account.
            </p>
            <div className="form-grid">
              {[
                ["name", "Full name", "text", "name"],
                ["phone", "Mobile number", "tel", "tel"],
                ["email", "Email address", "email", "email"],
                ["companyName", "Company (optional)", "text", "organization"],
                ["gstin", "GSTIN (optional)", "text", "off"],
              ].map(([name, label, type, auto]) => (
                <label key={name}>
                  {label}
                  {name === "phone" ? <PhoneInput key={profile?.email || "loading"} disabled={busy} defaultValue={profile?.customer?.phone || ""} /> : <input
                    key={profile?.email || "loading"}
                    defaultValue={name === "name" ? profile?.customer?.name || "" : name === "email" ? profile?.email || "" : ""}
                    name={name}
                    type={type}
                    autoComplete={auto}
                    required={!["line2", "companyName", "gstin"].includes(name)}
                    maxLength={
                      name === "pinCode" ? 6 : name === "gstin" ? 15 : 150
                    }
                    pattern={
                      name === "pinCode"
                        ? "[0-9]{6}"
                        : name === "gstin"
                          ? "[0-9A-Za-z]{15}"
                          : undefined
                    }
                  />}
                </label>
              ))}
            </div>
            {profile ? <CheckoutAddresses key={profile.email} initialAddresses={profile.addresses || []} busy={busy} onReady={setAddressReady} /> : <p role={profileError ? "alert" : "status"}>{profileError || "Loading your saved addresses…"}</p>}
            <label>
              Order notes (optional)
              <textarea name="notes" rows={3} maxLength={2000} />
            </label>
            <fieldset disabled={busy || !quote}>
              <legend>Payment method</legend>
              {PAYMENT_OPTIONS.map(option => {
                const m = option.id;
                const enabled = availablePaymentMethods(quote?.methods).includes(m);
                return (
                <label className={`payment-choice ${method === m ? "is-selected" : ""} ${!enabled ? "is-unavailable" : ""}`} key={m}>
                  <input
                    type="radio"
                    name="method"
                    value={m}
                    disabled={!enabled}
                    checked={method === m}
                    onChange={() => setMethod(m)}
                  />
                  {m === "COD" ? <Truck size={22} /> : <CreditCard size={22} />}
                  <span><strong>{option.title}</strong><small>{option.description}</small><small className="payment-availability">{quoting ? "Checking availability…" : !quote ? "Available after product verification" : enabled ? "Available" : m === "RAZORPAY" ? "Online payments are not enabled. Choose cash on delivery if available." : "Cash on delivery is not enabled for this store."}</small></span>
                </label>
              ); })}
              <p className="payment-help">Online payment options depend on availability in Razorpay. Select your preferred option in the payment window.</p>
            </fieldset>
            <p>
              Your order is saved securely before payment. We never store your
              card details.
            </p>
          </form>
          <aside className="checkout-summary">
            <h2>Order summary</h2>
            <span className="checkout-assurance"><ShieldCheck size={16} /> Verified prices & payment</span>
            {quote ? (
              <>
                <ul>
                  {quote.items.map((i: any) => (
                    <li key={i.sourceId}>
                      {i.name} · {i.variant} × {i.quantity}
                      <strong>{formatINR(i.total / 100)}</strong>
                    </li>
                  ))}
                </ul>
                <dl>
                  <dt>Subtotal</dt>
                  <dd>{formatINR(quote.subtotal / 100)}</dd>
                  <dt>GST</dt>
                  <dd>{formatINR(quote.gst / 100)}</dd>
                  <dt>Shipping</dt>
                  <dd>{formatINR(quote.shipping / 100)}</dd>
                  <dt>Total</dt>
                  <dd>
                    <strong>{formatINR(quote.total / 100)}</strong>
                  </dd>
                </dl>
                {!availablePaymentMethods(quote.methods).length && (
                  <p role="alert">
                    Payment methods have not been enabled. Please contact SRV.
                  </p>
                )}
              </>
            ) : (
              <p role="status">{error ? "Order verification needs attention." : "Verifying current prices, tax and stock…"}</p>
            )}
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button
              form="checkout-form"
              type="submit"
              className="button primary"
              disabled={!addressReady || busy || !quote || !availablePaymentMethods(quote.methods).includes(method)}
            >
              {busy
                ? "Saving your order…"
                : method === "RAZORPAY"
                  ? "Place order & pay"
                  : "Place order"}
            </button>
            {!quote && (
              <button
                type="button"
                className="button outline"
                disabled={quoting || busy}
                onClick={() => setRefresh((n) => n + 1)}
              >
                {quoting ? "Checking checkout…" : "Retry verification"}
              </button>
            )}
            <Link href="/cart">Return to cart</Link>
            <Link href="/contact">Contact SRV for help</Link>
          </aside>
        </div>
      )}
    </>
  );
}
