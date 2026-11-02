"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RefreshCw, ShoppingBag, Package, Truck, CircleCheck, ArrowUpRight } from "lucide-react";
import { OrderTrackingCard } from "./order-tracking-card";

export function CustomerOrderHistory() {
  const [orders,setOrders] = useState<any[]>([]);
  const [signedIn,setSignedIn] = useState(false);
  const [busy,setBusy] = useState(true);
  const [error,setError] = useState("");
  const [filter,setFilter] = useState("all");
  const [visible,setVisible] = useState(5);
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setBusy(true);
    try {
      const response = await fetch("/api/commerce/me",{cache:"no-store",signal:controller.signal});
      if (response.status === 401 || response.status === 403) {setSignedIn(false);setOrders([]);setError("");return;}
      const data = await response.json(); if(!response.ok) throw Error(data.message || "Could not load your orders.");
      if (!Array.isArray(data.orders)) throw Error("Could not read order history.");
      if (!controller.signal.aborted) {setSignedIn(true);setOrders(data.orders);setError("");}
    } catch (cause) {if(!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load orders.");}
    finally {if(!controller.signal.aborted) setBusy(false);}
  },[]);
  useEffect(()=>{
    void refresh(); const update=()=>{if(!document.hidden) void refresh();};
    const timer=window.setInterval(update,30000); window.addEventListener("focus",update);window.addEventListener("srv-auth",update);
    return ()=>{request.current?.abort();clearInterval(timer);window.removeEventListener("focus",update);window.removeEventListener("srv-auth",update);};
  },[refresh]);
  const filtered=orders.filter(order=>filter==="all" || (filter==="active" ? !["DELIVERED","CANCELLED"].includes(order.status) : order.status===filter));
  return <section className="customer-order-history" aria-labelledby="order-history-heading"><div className="order-history-heading"><div><span className="eyebrow">PURCHASES & DELIVERY</span><h1 id="order-history-heading">Your orders<span>.</span></h1><p>See your purchases, payment details and delivery progress.</p></div><button className="button secondary" disabled={busy} onClick={()=>void refresh()}><RefreshCw size={16} className={busy ? "tracking-spinner" : undefined} />{busy?"Updating…":"Refresh orders"}</button></div>{error&&<p role="alert" className="tracking-error">{error}</p>}{signedIn ? <><div className="tracking-overview" aria-label="Order overview">{[
    { label: "Total orders", count: orders.length, icon: Package, tone: "blue", detail: "Your purchases, together" },
    { label: "In progress", count: orders.filter(order => !["DELIVERED", "CANCELLED"].includes(order.status)).length, icon: Truck, tone: "amber", detail: "From confirmation to delivery" },
    { label: "Delivered", count: orders.filter(order => order.status === "DELIVERED").length, icon: CircleCheck, tone: "green", detail: "Arrived at your doorstep" },
  ].map(({ label, count, icon: Icon, tone, detail }) => <div className={"tracking-stat " + tone} key={label}><span className="tracking-stat-icon"><Icon size={23} strokeWidth={1.6} /></span><span className="tracking-stat-label">{label}</span><strong>{count.toString().padStart(2, "0")}</strong><small>{detail}</small></div>)}</div><div className="order-history-filters" aria-label="Filter orders">{[["all","All orders"],["active","In progress"],["DELIVERED","Delivered"],["CANCELLED","Cancelled"]].map(([value,label])=><button type="button" key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setVisible(5);}}>{label} <span>{orders.filter(order=>value==="all" || (value==="active" ? !["DELIVERED","CANCELLED"].includes(order.status) : order.status===value)).length}</span></button>)}</div>{filtered.length ? <><div className="order-history-list">{filtered.slice(0,visible).map(order=><OrderTrackingCard key={order.number} order={order}/>)}</div>{visible<filtered.length&&<button className="button secondary history-show-more" onClick={()=>setVisible(n=>n+5)}>Show more orders</button>}</> : <div className="tracking-history-empty"><ShoppingBag size={32}/><h3>{orders.length ? "No orders in this view." : "Your first order starts here."}</h3><p>{orders.length ? "Choose another filter to see your orders." : "Once you place an order, its details and progress will appear here."}</p><Link className="button primary" href="/shop">Explore products</Link></div>}</> : !busy && <div className="tracking-history-empty"><span className="tracking-empty-art"><ShoppingBag size={38} strokeWidth={1.4}/><span><Truck size={19}/></span></span><h3>Sign in to see all your orders.</h3><p>Your order history is private. Sign in to see purchases and delivery progress.</p><Link className="button primary" href="/account">Sign in to your account <ArrowUpRight size={16}/></Link></div>}{busy&&!signedIn&&<div className="tracking-loading" role="status"><RefreshCw size={24} className="tracking-spinner"/><p>Loading your order journey…</p><span>Getting your latest delivery updates</span></div>}</section>;
}
