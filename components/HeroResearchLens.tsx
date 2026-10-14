"use client";

import { useEffect, useState } from "react";

const areas = ["Market intelligence", "User behaviour", "Business analytics", "Ecosystem research"];

/** Small, decorative research signal. The full meaning remains in the static hero copy. */
export default function HeroResearchLens({ running }: { running: boolean }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!running) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(current => (current + 1) % areas.length);
    }, 2900);
    return () => window.clearInterval(timer);
  }, [running]);

  return <div className="hero-lens hero-enter" aria-label="Areas of research: market intelligence, user behaviour, business analytics and ecosystem research">
    <span className="hero-lens-label" aria-hidden="true">RESEARCH AREAS <span className="hero-lens-dot"/></span>
    <div className="hero-lens-areas" aria-hidden="true">
      {areas.map((area, index) => <span key={area} className={`hero-lens-area${active === index ? " is-current" : ""}`}>{area}</span>)}
    </div>
    <div className="hero-lens-progress" aria-hidden="true" data-running={running}><span key={active}/></div>
  </div>;
}
