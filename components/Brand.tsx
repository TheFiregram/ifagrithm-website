import Image from "next/image";

export function BrandMark({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return <span className={`brand-mark ${className}`} aria-hidden="true"><Image src="/assets/brand-symbol-transparent.png" alt="" width={1254} height={1254} sizes="(max-width: 640px) 200px, 280px" priority={priority} /></span>;
}

export function Arrow({ direction = "right" }: { direction?: "right" | "up" }) {
  return <svg className={`arrow-icon arrow-${direction}`} viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
