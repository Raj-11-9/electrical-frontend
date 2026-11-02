import type { Metadata } from "next";
import "./globals.css";
import "./premium.css";
import "./customer.css";
export const metadata: Metadata = {
  icons: {icon: [{url: "/srv-logo.png", type: "image/png"}], apple: "/srv-logo.png"},
  title: {
    default: "SRV Electricals | Electrical essentials. Expert supply.",
    template: "%s | SRV Electricals",
  },
  description:
    "Discover electrical products for your home and everyday projects. Explore products, discover your favourites and get friendly help from SRV Electricals.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
