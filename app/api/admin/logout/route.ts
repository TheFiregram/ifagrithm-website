import { jsonResponse } from "@/lib/http";
import { clearSession } from "@/lib/admin-auth";

export async function POST() {
  await clearSession();
  return jsonResponse({ ok: true });
}
