"use client";

import { useEffect, useRef } from "react";

/** A quiet signal field, rendered only when the hero is on screen. */
export default function HeroSignals() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d", { alpha: true });
    const host = el?.parentElement;
    if (!el || !ctx || !host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0, height = 0, frame = 0, lastPaint = 0;
    let visible = false;
    let light = document.documentElement.dataset.theme === "light";
    let elapsed = 0;

    function paint(time: number) {
      if (!el || !ctx) return;
      ctx.clearRect(0, 0, width, height);
      const gap = width < 761 ? 12 : 9;
      const colour = light ? "103,95,80" : "116,116,125";
      const accent = light ? "151,106,0" : "255,196,37";
      for (let row = 0, y = 8; y < height; row++, y += gap) {
        for (let col = 0, x = 8; x < width; col++, x += gap) {
          const wave = Math.sin(x * .009 + y * .006 - time * .45);
          const ripple = Math.cos(y * .014 - x * .003 + time * .3);
          const edge = Math.min(1, Math.min(x, width - x) / 100);
          const centre = 1 - .65 * Math.exp(-(((x - width / 2) / (width * .3)) ** 2 + ((y - height * .48) / (height * .32)) ** 2));
          const alpha = (.07 + (wave + 1) * .042 + (ripple + 1) * .018) * edge * centre;
          ctx.fillStyle = `rgba(${colour},${alpha})`;
          ctx.fillRect(x, y + wave * 3, 1.3, 1.3);
          if ((row * 31 + col * 17) % 139 === 0) {
            const pulse = Math.max(0, Math.sin(time * .7 + row + col));
            ctx.fillStyle = `rgba(${accent},${(.12 + pulse * .42) * edge})`;
            ctx.fillRect(x - .4, y + wave * 3 - .4, 2.1, 2.1);
          }
        }
      }
    }

    function tick(now: number) {
      frame = 0;
      if (!visible || document.hidden || reduced.matches) return;
      // Thirty paints per second keeps the decorative field inexpensive on phones.
      if (now - lastPaint >= 1000 / 30) {
        elapsed += Math.min((now - lastPaint) / 1000, .05);
        lastPaint = now;
        paint(elapsed);
      }
      frame = requestAnimationFrame(tick);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      frame = 0;
      el?.setAttribute("data-animated", String(visible && !document.hidden && !reduced.matches));
      paint(reduced.matches ? 0 : elapsed);
      if (visible && !document.hidden && !reduced.matches) {
        lastPaint = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }

    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      el.width = Math.round(width * ratio);
      el.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      refresh();
    });
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      host.dataset.heroVisible = String(visible);
      refresh();
    });
    const theme = new MutationObserver(() => {
      light = document.documentElement.dataset.theme === "light";
      refresh();
    });
    resize.observe(host);
    visibility.observe(host);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    reduced.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      theme.disconnect();
      reduced.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return <canvas className="hero-signals" ref={canvas} aria-hidden="true" />;
}
