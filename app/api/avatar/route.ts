import { fetchAvatarImage } from "@/lib/avatar";
import { limitRequests } from "@/lib/api-guard";

export async function GET(request: Request) {
  const limited = limitRequests(request, "avatar", 20);
  if (limited) return limited;
  const handle = (new URL(request.url).searchParams.get("handle") || "").trim().replace(/^@/, "");
  return fetchAvatarImage(handle);
}
