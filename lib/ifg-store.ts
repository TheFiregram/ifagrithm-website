// Client for the IFAGRITHM network store, which lives on the Contabo box
// behind nginx. TLS is verified against a pinned private CA (the server
// cert carries an IP SAN), so the raw-IP endpoint is as trustworthy as a
// named domain — and when the boss's domain arrives, only the envs change.
import { Agent, request } from "undici";

const STORE_URL = (process.env.IFG_STORE_URL || "").replace(/\/+$/, "");
const STORE_SECRET = process.env.IFG_STORE_SECRET || "";
const CA_PEM = (process.env.IFG_CA_CERT || "").replace(/\\n/g, "\n");

let agent: Agent | null = null;

function storeAgent(): Agent {
  if (!agent) {
    agent = CA_PEM
      ? new Agent({ connect: { ca: CA_PEM } })
      : new Agent();
  }
  return agent;
}

export type StoreApplication = {
  id: number;
  created_at: string;
  full_name: string;
  x_handle: string;
  telegram: string;
  email: string;
  country: string;
  role: string;
  desks: string[];
  links: string;
  context: string;
  why: string;
  status: string;
  tier: string | null;
  claim_token: string | null;
  serial: string;
};

async function call<T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown; clientIp?: string }): Promise<{ status: number; data: T }> {
  if (!storeConfigured()) throw new Error("Store is not configured.");
  const { statusCode, body } = await request(`${STORE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "content-type": "application/json",
      "x-ifg-secret": STORE_SECRET,
      ...(init?.clientIp ? { "x-ifg-client-ip": init.clientIp } : {}),
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    dispatcher: storeAgent(),
    headersTimeout: 10000, bodyTimeout: 10000,
    signal: AbortSignal.timeout(25000),
  });
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of body) {
    size += chunk.length;
    if (size > 10 * 1024 * 1024) { body.destroy(); throw new Error("Store response is too large."); }
    chunks.push(Buffer.from(chunk));
  }
  const data: unknown = JSON.parse(Buffer.concat(chunks, size).toString("utf8"));
  if (data === null || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid store response.");
  return { status: statusCode, data: data as T };
}

export function storeConfigured(): boolean {
  if (!STORE_SECRET) return false;
  try {
    const url = new URL(STORE_URL);
    return url.protocol === "https:" && !url.username && !url.password && !url.search && !url.hash;
  } catch { return false; }
}

export function submitApplication(application: Record<string, unknown>, clientIp?: string) {
  return call<{ ok?: boolean; id?: number; error?: string }>("/apply", { method: "POST", body: application, clientIp });
}

export function listApplications() {
  return call<{ applications?: StoreApplication[]; error?: string }>("/applications");
}

export function approveApplication(id: number, tier: string) {
  return call<{ ok?: boolean; claim_url?: string; mail?: { skipped: boolean }; mail_error?: string; error?: string }>(
    "/approve", { method: "POST", body: { id, tier } }
  );
}

export function rejectApplication(id: number) {
  return call<{ ok?: boolean; mail?: { skipped: boolean }; error?: string }>("/reject", { method: "POST", body: { id } });
}

export function resolveClaim(token: string) {
  return call<{ serial: string; name: string; x_handle?: string; role: string; desk: string; tier?: string; error?: string }>(`/claim/${token}`);
}

export function submitEnquiry(enquiry: Record<string, unknown>, clientIp?: string){return call<{ok?:boolean;id?:number;error?:string}>("/enquiries",{method:"POST",body:enquiry,clientIp});}
export function listEnquiries(){return call<{enquiries?:{id:number;created_at:string;name:string;email:string;company:string;question:string}[];error?:string}>("/enquiries");}
