import { NextResponse } from "next/server";
import { checkPassword, passwordConfigured } from "@/lib/admin-auth";

const attempts = new Map<string,{count:number;until:number}>();
export async function POST(request: Request) {
  const key=request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now=Date.now();
  const entry=attempts.get(key);
  if(entry && entry.until>now && entry.count>=10)return NextResponse.json({error:"Too many login attempts. Try again in a minute."},{status:429});
  attempts.set(key,{count:entry && entry.until>now ? entry.count+1 : 1,until:entry && entry.until>now ? entry.until : now+60000});
  if(attempts.size>1000)for(const [id,item] of attempts)if(item.until<now)attempts.delete(id);

  if (!passwordConfigured()) {
    return NextResponse.json({ error: "admin password not configured" }, { status: 503 });
  }
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  if (!(await checkPassword(String(body.password ?? "")))) {
    return NextResponse.json({ error: "wrong password" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
