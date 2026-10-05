import { sessionValid } from "@/lib/admin-auth";
import { rejectApplication } from "@/lib/ifg-store";
import { errorResponse, jsonResponse, readJsonObject } from "@/lib/http";
import { validId } from "@/remote/validation.js";

export async function POST(request: Request) {
  if (!(await sessionValid())) return jsonResponse({ error: "unauthorized" }, 401);
  try {
    const body = await readJsonObject(request, 2048);
    if (!validId(body.id)) return jsonResponse({ error: "id is required" }, 400);
    const { status, data } = await rejectApplication(body.id);
    return jsonResponse(data, status);
  } catch (error) { return errorResponse(error, "store unreachable"); }
}
