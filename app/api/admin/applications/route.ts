import { jsonResponse } from "@/lib/http";
import { sessionValid } from "@/lib/admin-auth";
import { listApplications } from "@/lib/ifg-store";

export async function GET() {
  if (!(await sessionValid())) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }
  try {
    const { status, data } = await listApplications();
    return jsonResponse(data, status);
  } catch {
    return jsonResponse({ error: "store unreachable" }, 503);
  }
}
