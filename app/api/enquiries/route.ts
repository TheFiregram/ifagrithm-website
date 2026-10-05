import { storeConfigured, submitEnquiry } from "@/lib/ifg-store";
import { errorResponse, jsonResponse, readJsonObject } from "@/lib/http";
import { limitRequests } from "@/lib/api-guard";
import { clientIp } from "@/lib/rate-limit";
import { validateEnquiry, validId } from "@/remote/validation.js";

export async function POST(request: Request) {
  const limited = limitRequests(request, "enquiry", 5);
  if (limited) return limited;
  try {
    const { enquiry, errors } = validateEnquiry(await readJsonObject(request));
    if (errors.length || !enquiry) return jsonResponse({ error: errors.join("; ") }, 400);
    if (!storeConfigured()) return jsonResponse({ error: "Enquiry storage is unavailable." }, 503);
    const { status, data } = await submitEnquiry(enquiry, clientIp(request));
    if (status === 201 && (data.ok !== true || !validId(data.id))) throw new Error("Invalid receipt.");
    if ([401, 403].includes(status)) return jsonResponse({ error: "Enquiry storage is unavailable." }, 503);
    return jsonResponse(data, status);
  } catch (error) { return errorResponse(error, "Could not save your enquiry."); }
}
