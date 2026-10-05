import { storeConfigured, submitApplication } from "@/lib/ifg-store";
import { errorResponse, jsonResponse, readJsonObject } from "@/lib/http";
import { limitRequests } from "@/lib/api-guard";
import { clientIp } from "@/lib/rate-limit";
import { validateApplication, validId } from "@/remote/validation.js";

export async function POST(request: Request) {
  const limited = limitRequests(request, "apply", 5);
  if (limited) return limited;
  try {
    const { app, errors } = validateApplication(await readJsonObject(request));
    if (errors.length || !app) return jsonResponse({ error: errors.join("; ") }, 400);
    if (!storeConfigured()) return jsonResponse({ error: "store unavailable" }, 503);
    const { status, data } = await submitApplication(app, clientIp(request));
    if (status === 201 && (data.ok !== true || !validId(data.id))) throw new Error("Invalid receipt.");
    if ([401, 403].includes(status)) return jsonResponse({ error: "store unavailable" }, 503);
    return jsonResponse(data, status);
  } catch (error) { return errorResponse(error, "store unreachable"); }
}
