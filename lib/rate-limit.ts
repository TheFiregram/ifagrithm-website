import { isIP } from "node:net";

export function clientIp(request: Request): string {
  // Vercel overwrites this header. Do not trust it in a directly hosted process.
  const value = process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") : null;
  const ip = value?.split(",")[0].trim() ?? "";
  return isIP(ip) ? ip : "local";
}

export class RateLimiter {
  private readonly entries = new Map<string, { count: number; until: number }>();
  private readonly maxEntries: number;
  constructor(maxEntries = 10000) { this.maxEntries = maxEntries; }

  retryAfter(key: string, limit: number, windowMs = 60000, now = Date.now()): number {
    let entry = this.entries.get(key);
    if (!entry || entry.until <= now) {
      if (this.entries.size >= this.maxEntries) {
        for (const [id, value] of this.entries) if (value.until <= now) this.entries.delete(id);
        // Fail closed at capacity instead of growing forever or evicting active limits.
        if (this.entries.size >= this.maxEntries) return Math.max(1, Math.ceil(windowMs / 1000));
      }
      entry = { count: 0, until: now + windowMs };
      this.entries.set(key, entry);
    }
    if (entry.count >= limit) return Math.max(1, Math.ceil((entry.until - now) / 1000));
    entry.count++;
    return 0;
  }
}

export const requestLimits = new RateLimiter();
