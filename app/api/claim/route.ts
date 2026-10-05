// Resolves a claim token for the card studio (/network?t=...).
import { jsonResponse } from "@/lib/http";
import { limitRequests } from "@/lib/api-guard";
import { resolveClaim, storeConfigured } from "@/lib/ifg-store";

export async function GET(request: Request) {
  const limited = limitRequests(request, "claim", 60);
  if (limited) return limited;
  const token = new URL(request.url).searchParams.get("t") || "";
  if (!/^[a-f0-9]{48}$/.test(token)) {
    return jsonResponse({ error: "invalid token" }, 400);
  }
  if (!storeConfigured()) {
    return jsonResponse({ error: "store unavailable" }, 503);
  }
  try {
    const { status, data } = await resolveClaim(token);
    return jsonResponse(data, status);
  } catch {
    return jsonResponse({ error: "store unreachable" }, 503);
  }
}
