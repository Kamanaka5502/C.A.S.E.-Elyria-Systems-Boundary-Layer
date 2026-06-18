import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';

const root = join(process.cwd(), 'release', 'case_v22_rerun_clean_release');
const port = Number(process.env.PORT || 8080);

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8']
]);

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/ui/';
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = normalize(join(root, pathname));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const st = statSync(filePath);
    if (!st.isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type': types.get(extname(filePath)) || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`C.A.S.E. Boundary Layer listening at http://localhost:${port}/ui/`);
});
