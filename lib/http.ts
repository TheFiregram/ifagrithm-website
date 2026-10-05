export class RequestError extends Error {
  readonly status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export function jsonResponse(data: unknown, status = 200, headers?: HeadersInit): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("cache-control", "private, no-store");
  responseHeaders.set("x-content-type-options", "nosniff");
  return Response.json(data, { status, headers: responseHeaders });
}

export function errorResponse(error: unknown, fallback: string): Response {
  return error instanceof RequestError
    ? jsonResponse({ error: error.message }, error.status)
    : jsonResponse({ error: fallback }, 503);
}

export async function readJsonObject(request: Request, maxBytes = 32 * 1024): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestError("Use application/json.", 415);
  }
  const length = request.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > maxBytes)) {
    throw new RequestError("Request body is too large.", 413);
  }
  if (!request.body) throw new RequestError("A JSON object is required.", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; void reader.cancel().catch(() => {}); }, 10000);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (timedOut) throw new RequestError("Request timed out.", 408);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        void reader.cancel().catch(() => {});
        throw new RequestError("Request body is too large.", 413);
      }
      chunks.push(value);
    }
    const text = Buffer.concat(chunks, bytes).toString("utf8");
    let value: unknown;
    try { value = JSON.parse(text); } catch { throw new RequestError("Invalid JSON.", 400); }
    if (value === null || typeof value !== "object" || Array.isArray(value)) throw new RequestError("A JSON object is required.", 400);
    return value as Record<string, unknown>;
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
