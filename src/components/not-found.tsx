import Link from "next/link";
export default function NotFound() {
  return (
    <main className="wrap page-body">
      <h1>Page not found.</h1>
      <p>Let’s get you back to the right connection.</p>
      <Link className="button primary" href="/">
        Back to home
      </Link>
    </main>
  );
}
