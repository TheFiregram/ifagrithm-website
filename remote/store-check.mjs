// direct store call the way lib/ifg-store.ts does it
import { Agent, request } from "undici";
import { readFileSync } from "node:fs";

const ca = readFileSync(new URL("./ifg-ca.crt", import.meta.url));
const secret = process.env.STORE_SECRET;
if (!secret) throw new Error("Set STORE_SECRET before checking the store.");
const agent = new Agent({ connect: { ca } });
try {
const { statusCode, body } = await request("https://217.77.4.143/applications", {
  headers: { "x-ifg-secret": secret },
  dispatcher: agent,
  signal: AbortSignal.timeout(10000),
});
console.log("status:", statusCode);
const result = await body.json();
console.log("application count:", Array.isArray(result.applications) ? result.applications.length : "unavailable");
} finally { await agent.close(); }
