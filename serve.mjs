// Solmara Token Radar — a tiny static server for screenshot capture.
//
// Serves a directory (default: the generated output in out/) on localhost so a browser can open
// the dashboard and take the three screenshots the gate needs (board, protocol detail, filtered
// view). No dependency, no network beyond the loopback interface.
//
//   node serve.mjs [dir] [port]
//   node serve.mjs out 8123        # then open http://localhost:8123/dashboard/

import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.argv[2] ?? 'out');
const port = Number(process.argv[3] ?? 8123);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
};

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path = normalize(join(root, decodeURIComponent(url.pathname)));
  if (!path.startsWith(root)) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
  if (!existsSync(path) || !statSync(path).isFile()) {
    res.writeHead(404);
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': TYPES[extname(path).toLowerCase()] ?? 'application/octet-stream' });
  res.end(readFileSync(path));
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`solmara radar: serving ${root} at http://localhost:${port}/dashboard/\n`);
  process.stdout.write(`solmara radar: board http://localhost:${port}/dashboard/ — detail via #p=<slug> — filtered via #q=<text>&category=<name>\n`);
});
