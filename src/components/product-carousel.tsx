"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ProductCarousel({ children, interval = 3000, label = "Recommended for you" }: { children: ReactNode; interval?: number; label?: string }) {
  const railId = useId();
  const rail = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return;
    const element = rail.current;
    if (!element) return;
    const section = element.closest("section") || element;
    let timer: ReturnType<typeof setTimeout>;
    function advance() {
      if (element && !document.hidden) {
        const end = element.scrollWidth - element.clientWidth;
        const step = (element.firstElementChild?.getBoundingClientRect().width ?? 280) + 20;
        if (end > 0) element.scrollTo({ left: element.scrollLeft >= end - 4 ? 0 : element.scrollLeft + step, behavior: reducedMotion ? "instant" : "smooth" });
      }
      timer = setTimeout(advance, interval);
    }
    // Every interaction restarts the four-second hold; hovering never blocks autoplay.
    const hold = () => {
      clearTimeout(timer);
      timer = setTimeout(advance, 4000);
    };
    timer = setTimeout(advance, interval);
    section.addEventListener("pointerdown", hold, { passive: true });
    section.addEventListener("keydown", hold);
    section.addEventListener("wheel", hold, { passive: true });
    return () => {
      clearTimeout(timer);
      section.removeEventListener("pointerdown", hold);
      section.removeEventListener("keydown", hold);
      section.removeEventListener("wheel", hold);
    };
  }, [reducedMotion, interval]);

  function browse(direction: number) {
    const element = rail.current;
    if (!element) return;
    const step = (element.firstElementChild?.getBoundingClientRect().width ?? 280) + 20;
    element.scrollBy({ left: direction * step, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <div className="product-carousel" role="region" aria-roledescription="carousel" aria-label="Explore the product collection">
      <div className="carousel-toolbar">
        <span><span className="collection-indicator" /> {label.toUpperCase()} <small>Discover your next essential</small></span>
        <div className="carousel-controls">
          <button type="button" onClick={() => browse(-1)} aria-label="Previous products" aria-controls={railId}><ArrowLeft size={18} /></button>
          <button type="button" onClick={() => browse(1)} aria-label="Next products" aria-controls={railId}><ArrowRight size={18} /></button>
        </div>
      </div>
      <div className="home-product-rail" id={railId} ref={rail} tabIndex={0} aria-label="Products. Swipe or use the arrow buttons to browse.">{children}</div>
      <div className="carousel-footnote"><span>Swipe or use the arrows to explore <ArrowRight size={14} /></span></div>
    </div>
  );
}
