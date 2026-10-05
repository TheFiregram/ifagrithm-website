"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

const words = ["users", "market", "growth", "next move"];

export default function RotatingHeadline({ running }: { running: boolean }) {
  const [word, setWord] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const holder = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let active = true;
    const fit = () => {
      const el=holder.current;
      const sample=el?.querySelectorAll<HTMLElement>("[data-word-measure]")[word];
      if(active&&el&&sample)el.style.width=`${sample.getBoundingClientRect().width}px`;
    };
    fit();
    document.fonts.ready.then(fit);
    window.addEventListener("resize",fit);
    return()=>{active=false;window.removeEventListener("resize",fit);};
  },[word]);

  useEffect(() => {
    if (!running) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const cycle = () => {
      if (!active || media.matches) return;
      if (document.hidden || window.scrollY > window.innerHeight || holder.current?.matches(":hover")) {
        timer = setTimeout(cycle, 500);
        return;
      }
      setLeaving(true);
      timer = setTimeout(() => {
        if (!active) return;
        setWord(index => (index + 1) % words.length);
        setLeaving(false);
        timer = setTimeout(cycle, 3100);
      }, 300);
    };
    timer = setTimeout(cycle, 3600);
    const changed=()=>{clearTimeout(timer);setLeaving(false);if(!media.matches)timer=setTimeout(cycle,3100);};
    media.addEventListener("change",changed);
    return () => { active = false; clearTimeout(timer); media.removeEventListener("change",changed); };
  }, [running]);

  return <h1 className="hero-headline hero-enter" aria-label="Understand your users, market, growth, and next move."><span aria-hidden="true">Understand your </span><span className="rotating-word" ref={holder} aria-hidden="true" style={{ "--word-length": words[word].length } as CSSProperties}><span className="word-measures">{words.map(sample=><span data-word-measure key={sample}>{sample}.</span>)}</span><span key={word} className={`rotating-letters${leaving ? " is-leaving" : ""}`}>{[...`${words[word]}.`].map((letter, index) => <span key={index} style={{ "--letter": index, "--reverse-letter": words[word].length - index } as CSSProperties}>{letter === " " ? "\u00a0" : letter}</span>)}</span><span className="word-track"><span key={`sweep-${word}`} /></span></span></h1>;
}
