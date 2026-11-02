"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/enquiry";
import { PhoneInput } from "./phone-input";
import { normalizeIndianPhone } from "@/lib/phone";
import { ArrowRight, ArrowUpRight, Eye, EyeOff, CircleUserRound, PackageCheck, ShoppingBag, Sparkles, LoaderCircle, LockKeyhole, LogOut, Mail, Headphones, Truck, Check } from "lucide-react";
export async function commerce(path: string, data?: unknown) {
  const r = await fetch("/api/commerce/" + path, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  }).catch(() => { throw Error("Could not reach the store. Check your connection and retry; your cart is safe."); });
  const body = await r.json().catch(() => { throw Error("The store returned an unexpected response. Please retry shortly."); });
  if (!r.ok)
    throw Error(
      Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message || "Request failed",
    );
  if (["login", "register", "logout"].includes(path)) window.dispatchEvent(new Event("srv-auth"));
  return body;
}
export function OrderSummary({ order }: { order: any }) {
  return (
    <article className="saved-order">
      <div>
        <h2>{order.number}</h2>
        <strong>{order.status}</strong>
        <span>
          Payment: {order.payments.map((p: any) => p.status).join(", ")}
        </span>
      </div>
      <p>
        {formatINR(order.total)} ·{" "}
        {new Date(order.createdAt).toLocaleDateString("en-IN")}
      </p>
      <ul>
        {order.items.map((i: any, n: number) => (
          <li key={n}>
            {i.name} · {i.sku} × {i.quantity}
          </li>
        ))}
      </ul>
      {order.shipments.map((s: any, n: number) => (
        <p key={n}>
          Carrier: {s.carrier} · Tracking: {s.trackingNumber}
        </p>
      ))}
      <Link href={"/track-order?number=" + encodeURIComponent(order.number)}
        onClick={()=>{try{sessionStorage.setItem("srv-track-"+order.number,order.trackingToken)}catch{}}}>
        Track this order
      </Link>
      <details>
        <summary>Your private tracking code</summary>
        <p className="tracking-code">{order.trackingToken}</p>
        <small>
          Keep this code private. Use it with your order number to track without
          signing in.
        </small>
      </details>
    </article>
  );
}
export function AccountView({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("login"),
    [profile, setProfile] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    commerce("me")
      .then(profile => { setProfile(profile); if (returnTo) router.replace(returnTo); })
      .catch((e) => {
        if (!/sign in|session/i.test(e.message)) setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [returnTo, router]);
  if (loading) return <div className="account-loading" role="status"><LoaderCircle size={25} /><h1>A moment for your account.</h1><p>Checking your sign-in details…</p></div>;
  return (
    <>
      {profile ? (
        <>
          <section className="profile-banner">
            <div className="profile-identity"><span className="profile-avatar" aria-hidden="true">{(profile.customer?.name || profile.email).trim().split(/\s+/).slice(0, 2).map((part: string) => Array.from(part)[0]).join("").toUpperCase()}</span><div><span className="profile-kicker">YOUR OWN LITTLE CORNER OF SRV</span><h1>Welcome, {profile.customer?.name || profile.email}</h1><p><Mail size={14} />{profile.email}</p><span className="profile-signed-in"><Check size={12} /> Signed in to your account</span></div></div>
            <button
              className="profile-signout"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await commerce("logout", {});
                  setProfile(null);
                  setError("");
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <LogOut size={16} /> {busy ? "Signing out…" : "Sign out"}
            </button>
          </section>
          <div className="account-quicklinks"><Link href="#your-orders"><span className="account-shortcut-icon"><PackageCheck size={23} /></span><div><strong>{profile.orders.length} {profile.orders.length === 1 ? "order" : "orders"}</strong><small>All your purchases, together</small></div><ArrowUpRight size={18} /></Link><Link href="/track-order"><span className="account-shortcut-icon"><Truck size={23} /></span><div><strong>Follow your delivery</strong><small>Check your order’s progress</small></div><ArrowUpRight size={18} /></Link><Link href="/contact"><span className="account-shortcut-icon"><Headphones size={23} /></span><div><strong>We’re here to help</strong><small>Get a hand with your order</small></div><ArrowUpRight size={18} /></Link></div>
          <div className="account-orders-heading" id="your-orders"><div><span className="eyebrow">YOUR PURCHASES</span><h2>Your orders</h2></div><Link href="/shop">Discover more products <ArrowRight size={15} /></Link></div>
          {profile.orders.length ? (
            profile.orders.map((o: any) => (
              <OrderSummary order={o} key={o.number} />
            ))
          ) : (
            <div className="commerce-empty account-orders-empty">
              <span className="orders-empty-icon"><ShoppingBag size={34} strokeWidth={1.4} /></span><span className="eyebrow">YOUR NEXT DISCOVERY IS WAITING</span><h3>Good things start with a first pick.</h3>
              <p>Your orders will appear here once you make a purchase. Find something for your space today.</p>
              <Link href="/shop" className="button primary">
                Find your next essential <ArrowUpRight size={17} />
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="auth-layout">
          <aside className="auth-story"><span className="auth-eyebrow"><Sparkles size={15} /> YOUR SPACE. YOUR POSSIBILITIES.</span><div className="auth-story-copy"><span className="auth-story-icon"><ShoppingBag size={36} strokeWidth={1.3} /></span><h2>Good choices.<br />Better connections.</h2><p>Your favourite essentials and your next great project, brought a little closer.</p></div><div className="auth-benefits"><div><PackageCheck size={20} /><span><strong>Your orders, together</strong><small>Find your purchase details in one place.</small></span></div><div><CircleUserRound size={20} /><span><strong>A space that’s yours</strong><small>Manage your account and follow your orders.</small></span></div></div><Link href="/shop">Discover electrical products <ArrowUpRight size={17} /></Link><span className="auth-story-decoration" aria-hidden="true" /></aside>
        <form
          className="commerce-form account-form auth-form"
          aria-busy={busy}
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              const details = new FormData(e.currentTarget);
              if (mode === "register") {
                const phone = String(details.get("phone") || "");
                details.set("phone", normalizeIndianPhone(phone));
              }
              await commerce(
                mode,
                Object.fromEntries(details),
              );
              router.replace("/");
              router.refresh();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {returnTo && <div className="checkout-login-notice" role="status"><LockKeyhole size={19} /><div><strong>Please log in first to place your order.</strong><p>Sign in or create an account. You’ll go to the home page after signing in; your products will stay saved.</p></div></div>}
          <div className="auth-form-heading"><span className="auth-form-icon"><LockKeyhole size={21} /></span><span className="auth-eyebrow">WELCOME TO SRV ELECTRICALS</span><h1>{mode === "login" ? "Good to see you again." : "Make yourself at home."}</h1><p>{mode === "login" ? "Sign in to your account and pick up where you left off." : "Create your account to keep your orders and details together."}</p></div>
          <div className="account-tabs">
            <button
              type="button"
              aria-pressed={mode === "login"}
              disabled={busy}
              onClick={() => {
                setMode("login");
                setError("");
                setShowPassword(false);
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              aria-pressed={mode === "register"}
              disabled={busy}
              onClick={() => {
                setMode("register");
                setError("");
                setShowPassword(false);
              }}
            >
              Create account
            </button>
          </div>
          {mode === "register" && (
            <>
              <label>
                Your name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  placeholder="Your full name"
                  disabled={busy}
                />
              </label>
              <label>Phone number<PhoneInput disabled={busy} /></label>
            </>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={150}
              placeholder="you@example.com"
              disabled={busy}
            />
          </label>
          <div className="auth-password-group">
            <label htmlFor="account-password">Password</label>
            <div className="auth-password-field">
            <input
              id="account-password"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={mode === "register" ? 8 : undefined}
              maxLength={72}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              required
              placeholder={mode === "register" ? "Choose a password" : "Enter your password"}
              aria-describedby="account-password-help"
              disabled={busy}
            />
            <button type="button" className="auth-password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </div>
          <small id="account-password-help">{mode === "register" ? "Use at least 8 characters. " : ""}Never share your password.</small>
          {error && <p className="form-error auth-error" role="alert">{error}</p>}
          <button className="button primary" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
            {busy ? <LoaderCircle className="auth-spinner" size={18} /> : <ArrowRight size={18} />}
          </button>
          <p className="auth-legal">Read our <Link href="/terms">Terms & conditions</Link> and <Link href="/privacy-policy">Privacy policy</Link> for details about your account and information.</p>
          <div className="auth-help">Need a hand? <Link href="/contact">Talk to our team <ArrowUpRight size={13} /></Link></div>
        </form>
        </div>
      )}
      {error && profile && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
