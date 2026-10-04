"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function LogoBackdrop() {
  const mark = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!mark.current) return;
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.max(0, Math.min(1, window.scrollY / maximum));
      const movement = reduced.matches ? 0 : progress;
      const visibility = .35 + Math.min(1, window.scrollY / Math.max(1, window.innerHeight * .6)) * .65;
      mark.current.style.setProperty("--logo-visibility", `${visibility}`);
      mark.current.style.setProperty("--logo-turn", `${-12 + movement * 40}deg`);
      mark.current.style.setProperty("--logo-x", `${Math.sin(movement * Math.PI * 2) * Math.min(window.innerWidth * .035, 48)}px`);
      mark.current.style.setProperty("--logo-y", `${(movement - .5) * 36}px`);
      mark.current.style.setProperty("--logo-scale", `${1 + Math.sin(movement * Math.PI) * .08}`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
    };
  }, []);
  return <div className="world-scene" aria-hidden="true"><div className="logo-scroll" ref={mark}><div className="logo-float"><Image src="/assets/brand-symbol-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 760px) 155vw, 1050px" priority /></div></div></div>;
}
