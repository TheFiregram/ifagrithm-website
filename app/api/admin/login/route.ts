import { checkPassword, passwordConfigured } from "@/lib/admin-auth";
import { errorResponse, jsonResponse, readJsonObject } from "@/lib/http";
import { limitRequests } from "@/lib/api-guard";

export async function POST(request: Request) {
  const limited = limitRequests(request, "login", 10);
  if (limited) return limited;
  if (!passwordConfigured()) return jsonResponse({ error: "admin password not configured" }, 503);
  try {
    const body = await readJsonObject(request, 2048);
    if (typeof body.password !== "string" || body.password.length > 1024) return jsonResponse({ error: "Invalid password." }, 400);
    if (!(await checkPassword(body.password))) return jsonResponse({ error: "wrong password" }, 401);
    return jsonResponse({ ok: true });
  } catch (error) { return errorResponse(error, "Sign in is unavailable."); }
}
