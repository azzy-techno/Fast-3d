// Minimal static server that behaves like GitHub Pages for measurement purposes: serves a build under a
// base path and gzips compressible types (including .glb, which Pages also compresses).
//   node tools/serve.mjs [dir=dist] [port=4173] [base=/Fast-3d/]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const dir = path.resolve(process.argv[2] ?? "dist");
const port = Number(process.argv[3] ?? 4173);
const base = (process.argv[4] ?? "/Fast-3d/").replace(/\/?$/, "/");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".hdr": "application/octet-stream",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};
const GZIP = new Set([".html", ".js", ".css", ".json", ".svg", ".glb", ".txt", ".hdr"]);
const cache = new Map();

http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    if (!u.pathname.startsWith(base)) {
      res.writeHead(302, { location: base });
      return res.end();
    }
    let rel = decodeURIComponent(u.pathname.slice(base.length)) || "index.html";
    let file = path.join(dir, rel);
    if (!file.startsWith(dir)) {
      res.writeHead(403);
      return res.end();
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, "index.html");
    const ext = path.extname(file).toLowerCase();
    const headers = { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "public, max-age=600" };
    const raw = fs.readFileSync(file);
    if (GZIP.has(ext) && /gzip/.test(req.headers["accept-encoding"] ?? "")) {
      const key = file + ":" + fs.statSync(file).mtimeMs;
      let z = cache.get(key);
      if (!z) {
        z = zlib.gzipSync(raw, { level: 6 });
        cache.set(key, z);
      }
      headers["content-encoding"] = "gzip";
      headers["content-length"] = z.length;
      res.writeHead(200, headers);
      return res.end(z);
    }
    headers["content-length"] = raw.length;
    res.writeHead(200, headers);
    res.end(raw);
  })
  .listen(port, "127.0.0.1", () => console.log(`serving ${dir} at http://127.0.0.1:${port}${base}`));
