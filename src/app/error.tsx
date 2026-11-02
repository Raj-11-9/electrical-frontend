"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="wrap page-body">
      <div className="availability-state">
        <h1>Something interrupted the connection.</h1>
        <p>Please try loading this page again, or return to the products.</p>
        <div className="product-actions">
          <button className="button primary" onClick={reset}>
            Try again
          </button>
          <Link className="button outline" href="/shop">
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
