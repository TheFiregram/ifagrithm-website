import { sessionValid } from "@/lib/admin-auth";
import { listApplications } from "@/lib/ifg-store";
import { buildApplicationsWorkbook } from "@/lib/application-export";
import { jsonResponse } from "@/lib/http";

export async function GET() {
  if (!(await sessionValid())) return jsonResponse({ error: "unauthorized" }, 401);
  try {
    const result = await listApplications();
    if (result.status !== 200 || !Array.isArray(result.data.applications)) return jsonResponse({ error: "store unavailable" }, 503);
    const buffer = await buildApplicationsWorkbook(result.data.applications);
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(buffer, { headers: {
      "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "content-disposition": `attachment; filename="ifagrithm-applications-${stamp}.xlsx"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    } });
  } catch { return jsonResponse({ error: "store unreachable" }, 503); }
}
