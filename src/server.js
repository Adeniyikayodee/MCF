import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { route } from './router.js';

const PORT = Number(process.env.PORT ?? 3000);
const BAD_JSON = Symbol('bad-json');

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);

  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw === '') return undefined;

  try {
    return JSON.parse(raw);
  } catch {
    return BAD_JSON;
  }
}

export function createApp() {
  return createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
    const body = await readJsonBody(req);

    if (body === BAD_JSON) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: { code: 'invalid_input', message: 'body is not valid JSON' } }));
      return;
    }

    const query = Object.fromEntries(url.searchParams);
    const { status, payload } = route(req.method, url.pathname, query, body);

    if (status === 204) {
      res.writeHead(204);
      res.end();
      return;
    }

    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(payload));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(PORT, () => {
    console.log(`task api listening on http://localhost:${PORT}`);
  });
}
