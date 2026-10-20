import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";

export function createStaticPreview(output) {
  const root = resolve(output);
  return createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
      let file = resolve(root, `.${pathname}`);
      if (!file.startsWith(root + sep) && file !== root) throw new Error("outside output");
      if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
      const info = await stat(file);
      const mediaTypes = { ".mp4": "video/mp4", ".webm": "video/webm", ".vtt": "text/vtt; charset=utf-8" };
      const mediaType = mediaTypes[extname(file)];
      if (mediaType) {
        const headers = { "Content-Type": mediaType, "Accept-Ranges": "bytes", "Cache-Control": "no-store" };
        let start = 0, end = info.size - 1, partial = false;
        if (req.headers.range) {
          const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
          if (!range || (!range[1] && !range[2])) { res.writeHead(416, { ...headers, "Content-Range": `bytes */${info.size}` }); res.end(); return; }
          start = range[1] ? Number(range[1]) : Math.max(0, info.size - Number(range[2]));
          end = range[1] && range[2] ? Math.min(Number(range[2]), end) : end;
          if (start > end || start >= info.size) { res.writeHead(416, { ...headers, "Content-Range": `bytes */${info.size}` }); res.end(); return; }
          partial = true;
        }
        res.writeHead(partial ? 206 : 200, { ...headers, "Content-Length": end - start + 1, ...(partial ? { "Content-Range": `bytes ${start}-${end}/${info.size}` } : {}) });
        if (req.method === "HEAD") res.end();
        else { const stream = createReadStream(file, { start, end }); stream.on("error", () => res.destroy()); res.on("close", () => stream.destroy()); stream.pipe(res); }
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": ({ ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" })[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
      res.end(body);
    } catch { res.writeHead(404); res.end("Not found"); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.EDITING_PREVIEW_PORT ?? 4317);
  const server = createStaticPreview(process.env.EDITING_STATIC_DIR ?? "out");
  server.listen(port, "127.0.0.1", () => console.log(`Local editing preview: http://127.0.0.1:${port}/ex-ai/editing/`));
}
