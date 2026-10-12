// Minimal static server for the exported site (used by Playwright and
// for local previews). Resolves "/foo" to "/foo.html" like most static hosts.
import { createServer } from "node:http";
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
  res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
  res.end(await readFile(file));
}).listen(port, () => console.log(`serving ${dir} on http://localhost:${port}`));
