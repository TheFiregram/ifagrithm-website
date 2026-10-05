"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type IntroStage = "pending" | "opening" | "revealing" | "ready";

export default function IntroScreen({ onStageChange }: { onStageChange: (stage: IntroStage) => void }) {
  const cover = useRef<HTMLDivElement>(null);
  const lightImage = useRef<HTMLImageElement>(null);
  const darkImage = useRef<HTMLImageElement>(null);
  const [phase, setPhase] = useState("waiting");
  const [circular, setCircular] = useState(true);

  useEffect(() => {
    const el = cover.current;
    const picture = document.documentElement.dataset.theme === "dark" ? darkImage.current : lightImage.current;
    if (!el || !picture) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let active = true, started = false, entered = false, finished = false;

    function finish() {
      if (!active || finished) return;
      finished = true;
      onStageChange("ready");
    }
    function exit() {
      if (!active || finished) return;
      setPhase("exiting");
      onStageChange("revealing");
    }
    function start() {
      if (!active || started || finished) return;
      started = true;
      clearTimeout(loadLimit);
      if (reduced.matches) { finish(); return; }
      setPhase("entering");
      onStageChange("opening");
      // A missing animation event must never leave the page covered.
      timers.push(setTimeout(finish, 4000));
    }
    function animationEnded(event: AnimationEvent) {
      if (!active || finished) return;
      if (event.animationName === "intro-picture-in" && !entered) {
        entered = true;
        setPhase("holding");
        timers.push(setTimeout(exit, 1000));
      }
      if (event.target === el && (event.animationName === "intro-circle-out" || event.animationName === "intro-fade-out")) finish();
    }
    const preferenceChanged = () => { if (reduced.matches) finish(); };
    const loadLimit = setTimeout(finish, 5000);
    root.style.overflow = "hidden";
    setCircular("registerProperty" in CSS);
    el.addEventListener("animationend", animationEnded);
    reduced.addEventListener("change", preferenceChanged);
    if (reduced.matches) finish();
    else picture.decode().then(start).catch(finish);

    return () => {
      active = false;
      clearTimeout(loadLimit);
      timers.forEach(clearTimeout);
      el.removeEventListener("animationend", animationEnded);
      reduced.removeEventListener("change", preferenceChanged);
      root.style.overflow = previousOverflow;
    };
  }, [onStageChange]);

  return <>
    <div ref={cover} className={`intro-screen phase-${phase}`} data-circular={circular} role="status" aria-label="IFAGRITHM">
      <div className="intro-art">
        <Image ref={lightImage} className="intro-logo-light" src="/assets/intro-brand-light.webp" alt="IFAGRITHM" width={1254} height={1254} priority />
        <Image ref={darkImage} className="intro-logo-dark" src="/assets/intro-brand.jpg" alt="IFAGRITHM" width={1280} height={1280} priority />
      </div>
    </div>
    <noscript><style>{`.intro-screen{display:none!important}.site-content .hero *,.site-content .header-inner,[data-reveal-section] .enter-item,.faq-row,.method-row,.method-avatar,.pixel-heart i{animation:none!important;opacity:1!important;filter:none!important;transform:none!important}.features-scroll,.method-scroll,.focus-scroll,.faq-scroll,.outro-scroll{height:auto!important}.features-sticky,.method-sticky,.focus-sticky,.faq-sticky,.outro-sticky{position:relative!important;height:auto!important;min-height:600px}.feature-card{display:block!important;max-height:none!important}.feature-copy-stack{min-height:0!important}.feature-copy{position:relative!important;opacity:1!important;filter:none!important;transform:none!important;margin:40px 0}.feature-right,.feature-rail{display:none!important}.faq-answer{grid-template-rows:1fr!important;opacity:1!important}html{overflow:auto!important}`}</style></noscript>
  </>;
}
