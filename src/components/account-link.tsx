"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogIn, ChevronRight } from "lucide-react";

export function AccountLink() {
  const pathname = usePathname();
  const [label, setLabel] = useState("Login");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let controller: AbortController | undefined;
    let active = true;
    const refresh = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const response = await fetch("/api/commerce/me", { cache: "no-store", signal: request.signal });
        if (!response.ok) {
          if (active && !request.signal.aborted) { setLabel("Login"); setSignedIn(false); }
          return;
        }
        const profile = await response.json();
        if (!active || request.signal.aborted) return;
        const name = typeof profile.customer?.name === "string" ? profile.customer.name.trim().split(/\s+/)[0] : "";
        setLabel(name || "My account");
        setSignedIn(true);
      } catch {
        // Transient network failures leave the current header label intact.
      }
    };
    void refresh();
    window.addEventListener("srv-auth", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.removeEventListener("srv-auth", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [pathname]);

  return <Link className={"header-action login-action" + (signedIn ? " signed-in-action" : "")} href="/account" aria-label={signedIn ? `${label}, view your account` : "Login to your account"} aria-current={pathname === "/account" ? "page" : undefined} title={signedIn ? `${label} — My account` : "Login"}>
    <i className="header-action-icon">{signedIn ? <><b className="account-initial" aria-hidden="true">{label === "My account" ? "SRV" : Array.from(label)[0]?.toLocaleUpperCase()}</b><em className="account-presence" aria-hidden="true" /></> : <LogIn size={20} strokeWidth={1.8} />}</i>
    <span className="account-link-name">{signedIn && <small className="account-greeting">Welcome back</small>}<span>{label}</span></span>
    {signedIn && <ChevronRight className="account-link-chevron" size={13} aria-hidden="true" />}
  </Link>;
}
