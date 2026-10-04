"use client";

// Brand boot screen: the mark assembles, the wordmark steps in letter by
// letter, the tagline tracks into place, a gold line fills — then the whole
// curtain wipes up and the hero's own entrance takes over. Runs once per
// page load of the main site; skipped entirely for reduced motion.

import { useEffect, useState } from "react";

const BOOT_MS = 2600;
const EXIT_MS = 800;

export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      html.classList.add("booted");
      setGone(true);
      return;
    }

    html.classList.add("booting"); // holds the hero entrance until the curtain lifts
    document.body.style.overflow = "hidden";
    const finish = setTimeout(() => {
      html.classList.remove("booting");
      html.classList.add("booted");
      document.body.style.overflow = "";
      setLeaving(true);
      const remove = setTimeout(() => {
        setGone(true);
        html.classList.add("boot-done");
      }, EXIT_MS);
      return () => clearTimeout(remove);
    }, BOOT_MS);
    return () => {
      clearTimeout(finish);
      document.body.style.overflow = "";
      html.classList.remove("booting");
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader${leaving ? " is-leaving" : ""}`} aria-hidden="true">
      <div className="pre-core">
        <span className="pre-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ifagrithm-logo.png" alt="" />
        </span>
        <span className="pre-word">
          {[..."IFAGRITHM"].map((letter, index) => <b key={index} style={{ "--i": index } as React.CSSProperties}>{letter}</b>)}
        </span>
        <span className="pre-tag">WEB3 RESEARCH &nbsp;·&nbsp; CLEARER DECISIONS</span>
        <span className="pre-line"><i /></span>
      </div>
      <span className="pre-corner tl">EST. MMXXVI</span>
      <span className="pre-corner br">NETWORK · 001</span>
    </div>
  );
}
