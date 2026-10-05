export class RequestError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

export function readJson(req, max = 32 * 1024) {
  if (req.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") return Promise.reject(new RequestError("Use application/json.", 415));
  if (Number(req.headers["content-length"]) > max) return Promise.reject(new RequestError("Request body is too large.", 413));
  return new Promise((resolve, reject) => {
    let size = 0, settled = false;
    const chunks = [];
    const fail = error => { if (settled) return; settled = true; clearTimeout(timer); chunks.length = 0; reject(error); };
    const timer = setTimeout(() => fail(new RequestError("Request timed out.", 408)), 10000);
    req.on("data", chunk => {
      if (settled) return;
      size += chunk.length;
      if (size > max) { fail(new RequestError("Request body is too large.", 413)); return; }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (settled) return;
      let body;
      try { body = JSON.parse(Buffer.concat(chunks, size).toString("utf8")); }
      catch { fail(new RequestError("Invalid JSON.", 400)); return; }
      if (body === null || typeof body !== "object" || Array.isArray(body)) { fail(new RequestError("A JSON object is required.", 400)); return; }
      settled = true;
      clearTimeout(timer);
      resolve(body);
    });
    req.on("aborted", () => fail(new RequestError("Request aborted.", 400)));
    req.on("error", () => fail(new RequestError("Could not read request.", 400)));
  });
}
