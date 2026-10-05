import crypto from "node:crypto";

export const SESSION_SECONDS = 60 * 60 * 24 * 7;
export function validAdminPassword(secret: string): boolean { return secret.length >= 16 && secret.length <= 1024; }

export function signSession(secret: string, expiry: number): string {
  const mac = crypto.createHmac("sha256", secret).update(`ifg-admin:${expiry}`).digest("hex");
  return `${expiry}.${mac}`;
}

export function verifySession(secret: string, token: string | undefined, now = Date.now()): boolean {
  if (!validAdminPassword(secret) || !token || !/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expiry, mac] = token.split(".");
  const exp = Number(expiry);
  if (!Number.isSafeInteger(exp) || exp <= now || exp > now + SESSION_SECONDS * 1000) return false;
  const expected = signSession(secret, exp).split(".")[1];
  return crypto.timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex"));
}
