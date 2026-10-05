type OriginRequest = Pick<Request, "method" | "url" | "headers">;

export function allowsRequestOrigin(request: OriginRequest): boolean {
  if (request.method === "GET" || request.method === "HEAD") return true;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (origin === null) return true;

  try {
    const expected = new URL(request.url);
    const host = request.headers.get("host");
    // NextURL normalizes loopback addresses and may use an internal hostname.
    // Host is the authority addressed by the browser; forwarded-host is ignored.
    if (host !== null) {
      if (host.length > 300 || !/^[a-z\d.:[\]-]+$/i.test(host)) return false;
      const authority = new URL(`${expected.protocol}//${host}`);
      if (authority.username || authority.password || authority.pathname !== "/" || authority.search || authority.hash) return false;
      expected.host = authority.host;
    }
    const supplied = new URL(origin);
    return supplied.origin === origin && supplied.origin === expected.origin;
  } catch {
    return false;
  }
}
