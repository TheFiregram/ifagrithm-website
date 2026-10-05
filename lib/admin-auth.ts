// Admin session for /admin: one shared password, an HMAC-signed cookie,
// nothing else. Runs only in server route handlers.
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { SESSION_SECONDS, signSession, validAdminPassword, verifySession } from "./admin-session";

const COOKIE = "ifg_admin";

function password(): string {
  return process.env.ADMIN_PASSWORD || "";
}

export function passwordConfigured(): boolean {
  return validAdminPassword(password());
}

export async function checkPassword(candidate: string): Promise<boolean> {
  if (!passwordConfigured() || candidate.length > 1024) return false;
  const a = Buffer.from(String(candidate ?? ""));
  const b = Buffer.from(password());
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (!ok) return false;
  const store = await cookies();
  store.set(COOKIE, signSession(password(), Date.now() + SESSION_SECONDS * 1000), {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return true;
}

export async function sessionValid(): Promise<boolean> {
  const store = await cookies();
  return verifySession(password(), store.get(COOKIE)?.value);
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
