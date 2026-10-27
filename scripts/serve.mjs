import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
await fs.access(path.join(output, 'index.html'));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    let filename = path.resolve(output, '.' + decodeURIComponent(url.pathname));
    if (!filename.startsWith(output + path.sep) && filename !== output) { response.writeHead(403); response.end('Forbidden'); return; }
    const stat = await fs.stat(filename);
    if (stat.isDirectory()) filename = path.join(filename, 'index.html');
    const bytes = await fs.readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : bytes);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(await fs.readFile(path.join(output, '404.html')));
  }
});
const preferredPort = Number(process.env.PORT || 4321);
server.listen(preferredPort, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
const stop = () => server.close(() => process.exit(0));
process.on('SIGTERM', stop); process.on('SIGINT', stop);
