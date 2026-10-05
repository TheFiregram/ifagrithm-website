const HOSTS = new Set(["unavatar.io", "pbs.twimg.com", "abs.twimg.com"]);
const MAX_BYTES = 2 * 1024 * 1024;

function rasterType(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  const prefix = Buffer.from(bytes.subarray(0, 12)).toString("ascii");
  if (prefix.startsWith("GIF87a") || prefix.startsWith("GIF89a")) return "image/gif";
  if (prefix.startsWith("RIFF") && prefix.slice(8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function fetchAvatarImage(handle: string, fetcher: typeof fetch = fetch): Promise<Response> {
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) return new Response("invalid handle", { status: 400 });
  let url = new URL(`https://unavatar.io/x/${handle}?fallback=false`);
  const signal = AbortSignal.timeout(8000);
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      if (url.protocol !== "https:" || !HOSTS.has(url.hostname) || url.port || url.username || url.password) return new Response("unsafe avatar source", { status: 502 });
      const upstream = await fetcher(url, { headers: { "user-agent": "ifagrithm-card-studio" }, cache: "no-store", redirect: "manual", signal });
      if ([301, 302, 303, 307, 308].includes(upstream.status)) {
        const location = upstream.headers.get("location");
        await upstream.body?.cancel();
        if (!location || redirects === 3) return new Response("avatar lookup failed", { status: 502 });
        url = new URL(location, url);
        continue;
      }
      if (!upstream.ok) {
        await upstream.body?.cancel();
        return new Response("no avatar found", { status: upstream.status === 404 ? 404 : 502 });
      }
      const advertisedType = upstream.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
      if (!advertisedType || !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(advertisedType)) {
        await upstream.body?.cancel();
        return new Response("unsupported image", { status: 415 });
      }
      if (Number(upstream.headers.get("content-length")) > MAX_BYTES) {
        await upstream.body?.cancel();
        return new Response("avatar is too large", { status: 413 });
      }
      const reader = upstream.body?.getReader();
      if (!reader) return new Response("no avatar found", { status: 404 });
      const chunks: Uint8Array[] = [];
      let size = 0;
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > MAX_BYTES) { await reader.cancel(); return new Response("avatar is too large", { status: 413 }); }
          chunks.push(value);
        }
      } finally { reader.releaseLock(); }
      const bytes = Buffer.concat(chunks, size);
      const type = rasterType(bytes);
      if (!type || type !== advertisedType) return new Response("unsupported image", { status: 415 });
      return new Response(bytes, { headers: {
        "content-type": type,
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; sandbox",
        "cache-control": "public, max-age=3600",
      } });
    }
  } catch { return new Response("avatar lookup failed", { status: 502 }); }
  return new Response("avatar lookup failed", { status: 502 });
}
