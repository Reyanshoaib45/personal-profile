/**
 * Minimal static server for the built site.
 *
 * The @astrojs/vercel adapter does not support `astro preview`, so this serves
 * the pre-rendered output in dist/client instead. It exists purely to verify a
 * production build locally; Vercel serves the real deployment.
 *
 *   node scripts/serve.mjs [port]
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const root = resolve(process.cwd(), 'dist/client');
const port = Number(process.argv[2] ?? process.env.PORT ?? 4321);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

const notFound = `<!doctype html><html><body style="font-family:system-ui;background:#08090b;color:#ecedf1;padding:4rem"><h1>404</h1><p>Not found. Did you run <code>npm run build</code> first?</p></body></html>`;

async function resolveFile(urlPath) {
  // Strip query/hash, decode, and block traversal outside the output directory.
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  let target = resolve(join(root, normalize(clean)));

  if (!target.startsWith(root)) return null;

  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, 'index.html');
  } catch {
    // Not a directory or missing: try the trailing-slash form.
    if (!clean.endsWith('/')) {
      const candidate = join(target, 'index.html');
      try {
        await stat(candidate);
        target = candidate;
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  return target;
}

createServer(async (req, res) => {
  try {
    const file = await resolveFile(req.url ?? '/');

    if (!file) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(notFound);
      return;
    }

    const body = await readFile(file);
    res.writeHead(200, {
      'content-type': types[extname(file)] ?? 'application/octet-stream',
      'content-length': body.length,
      'cache-control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Internal error');
  }
}).listen(port, () => {
  console.log(`Static preview: http://localhost:${port}`);
  console.log(`Serving ${root}`);
});
