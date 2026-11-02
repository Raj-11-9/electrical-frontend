import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="wrap page-body">
      <div className="availability-state">
        <span className="eyebrow">404 / CONNECTION NOT FOUND</span>
        <h1>Let’s find the right path.</h1>
        <p>
          This page or product could not be found. Explore the full SRV
          products.
        </p>
        <Link className="button primary" href="/shop">
          Browse all products
        </Link>
      </div>
    </main>
  );
}
