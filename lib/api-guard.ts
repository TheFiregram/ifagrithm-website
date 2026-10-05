import { jsonResponse } from "./http";
import { clientIp, requestLimits } from "./rate-limit";

export function limitRequests(request: Request, bucket: string, limit: number): Response | null {
  const retry = requestLimits.retryAfter(`${bucket}:${clientIp(request)}`, limit);
  return retry ? jsonResponse({ error: "Too many requests. Try again shortly." }, 429, { "retry-after": String(retry) }) : null;
}
