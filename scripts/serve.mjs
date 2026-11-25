// Minimal static server for site/ (local preview + title capture). Usage: node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.ico': 'image/x-icon',
};

export function serve(port = 4173) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = normalize(join(site, urlPath));
    if (!file.startsWith(site)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!urlPath.endsWith('/')) return res.writeHead(301, { Location: urlPath + '/' }).end();
      file = join(file, 'index.html');
    }
    if (!existsSync(file)) {
      const nf = join(site, '404.html');
      return res.writeHead(404, { 'Content-Type': types['.html'] }).end(existsSync(nf) ? readFileSync(nf) : 'Not found');
    }
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(readFileSync(file));
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || 4173;
  await serve(port);
  console.log(`Serving site/ at http://localhost:${port}/`);
}
