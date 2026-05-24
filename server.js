import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number.parseInt(process.env.PORT || "4173", 10);
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${port}`).pathname);
  const normalized = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalized === "/" ? "index.html" : normalized);

  if (!filePath.startsWith(root)) {
    return null;
  }

  if (existsSync(filePath) && statSync(filePath).isFile()) {
    return filePath;
  }

  return join(root, "index.html");
}

createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  response.writeHead(200, { "Content-Type": types[extname(filePath)] || "text/plain" });
  createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Office / WFH Recorder running at http://127.0.0.1:${port}`);
});
