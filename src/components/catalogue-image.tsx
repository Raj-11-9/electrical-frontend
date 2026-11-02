"use client";
import { useState, useEffect } from "react";
import { Package } from "lucide-react";
export function CatalogueImage({
  src,
  alt,
  eager = false,
}: {
  src?: string | null;
  alt: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(()=>setFailed(false),[src]);
  return src && !failed ? (
    <img
      src={src}
      alt={alt}
      width="600"
      height="600"
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  ) : (
    <span className="image-unavailable">
      <Package size={32} />
      <span>Image unavailable</span>
    </span>
  );
}
