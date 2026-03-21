import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { safePublicPath } from './lib/safe-public-path.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicRoot = resolve(__dirname, 'public');

const mimeByExt = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  const filePath = safePublicPath(req.url ?? '/', publicRoot);
  if (!filePath) {
    res.writeHead(400);
    res.end();
    return;
  }

  try {
    const body = await readFile(filePath);
    const ext = extname(filePath);
    const type = mimeByExt[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': body.length });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(body);
    }
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(500);
      res.end('Server error');
    }
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => {
  console.log(`Serving ${publicRoot}`);
  console.log(`http://localhost:${port}/`);
});
