import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";
export default function config(phase: string): NextConfig {
  const development = phase === PHASE_DEVELOPMENT_SERVER;
  const csp = [
    "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:", "font-src 'self' data:",
    `connect-src 'self' data: blob:${development ? " ws: wss:" : ""}`,
    "form-action 'self' mailto: https://mail.google.com",
  ].join("; ");
  return {
    reactStrictMode: true, poweredByHeader: false,
    distDir: development ? ".next-dev" : ".next",
    images: { unoptimized: true }, outputFileTracingRoot: process.cwd(),
    async headers() { return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: csp },
      ] },
      { source: "/network", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ]; },
  };
}
