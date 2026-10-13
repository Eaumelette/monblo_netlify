import inject from 'light-my-request';
import app from '../../app.js';

// Fonction Netlify au format moderne (Request -> Response). Ce format est
// nécessaire pour que Netlify fournisse automatiquement la connexion à
// Netlify Database (le format Lambda "exports.handler" ne la reçoit pas).
// La requête est rejouée en mémoire sur l'application Express.
export default async (req) => {
  const url = new URL(req.url);
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  const response = await inject(app, {
    method: req.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(req.headers),
    payload: hasBody ? Buffer.from(await req.arrayBuffer()) : undefined,
    remoteAddress: req.headers.get('x-nf-client-connection-ip') || undefined
  });

  const headers = new Headers();
  for (const [name, value] of Object.entries(response.headers)) {
    // Ces en-têtes sont recalculés par la plateforme
    if (name === 'content-length' || name === 'transfer-encoding' || name === 'connection') {
      continue;
    }
    for (const item of Array.isArray(value) ? value : [value]) {
      headers.append(name, String(item));
    }
  }

  const noBody = req.method === 'HEAD' || [204, 304].includes(response.statusCode);
  return new Response(noBody ? null : response.rawPayload, {
    status: response.statusCode,
    headers
  });
};

// Toutes les URL passent par Express, sauf les fichiers présents dans
// "public" (CSS, JS) qui restent servis directement par le CDN.
export const config = {
  path: '/*',
  preferStatic: true
};
