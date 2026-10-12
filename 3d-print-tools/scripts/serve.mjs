// Minimal static server for the exported site (used by Playwright and
// for local previews). Resolves "/foo" to "/foo.html" like most static hosts.
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const dir = process.argv[2] ?? "out";
const port = Number(process.argv[3] ?? 4173);
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
  ".wasm": "application/wasm", ".txt": "text/plain", ".xml": "application/xml",
  ".ttf": "font/ttf", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json",
};

async function resolve(p) {
  const candidates = [p, `${p}.html`, join(p, "index.html")];
  for (const c of candidates) {
    try { if ((await stat(c)).isFile()) return c; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0]);
  const file = await resolve(join(dir, normalize(url).replace(/^(\.\.[/\\])+/, "")));
  if (!file) {
    res.writeHead(404, { "content-type": "text/html" });
    res.end(await readFile(join(dir, "404.html")).catch(() => "Not found"));
    return;
  }
  // gzip text assets like a real static host would (keeps Lighthouse numbers realistic).
  const body = await readFile(file);
  const type = types[extname(file)] ?? "application/octet-stream";
  const compress = /text|javascript|json|svg|xml|wasm/.test(type) && /gzip/.test(req.headers["accept-encoding"] ?? "");
  res.writeHead(200, { "content-type": type, ...(compress ? { "content-encoding": "gzip" } : {}) });
  res.end(compress ? gzipSync(body) : body);
}).listen(port, () => console.log(`serving ${dir} on http://localhost:${port}`));
