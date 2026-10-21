// Cliente mínimo de la Action API de Wikimedia Commons
import { CONFIG } from '../config.js';
import { assertOnline } from '../utils/network.js';

async function apiGet(params) {
  assertOnline();
  // origin=* → petición anónima con CORS (lecturas públicas)
  const url = new URL(CONFIG.commonsApi);
  url.search = new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Commons respondió ${res.status}`);
  return res.json();
}

/** Busca la primera imagen en Commons que coincida con el texto (p. ej. el nombre científico). */
export async function findImage(query, width = 600) {
  const data = await apiGet({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '1',
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: String(width),
  });
  const page = data.query?.pages?.[0];
  if (!page) return null;
  const info = page.imageinfo[0];
  return { title: page.title, thumb: info.thumburl ?? info.url, page: info.descriptionurl };
}

/** Comprueba si un archivo ya está publicado en Commons. */
export async function getFileStatus(filename) {
  const data = await apiGet({ action: 'query', titles: `File:${filename}`, prop: 'imageinfo', iiprop: 'url|timestamp' });
  const page = data.query.pages[0];
  if (page.missing) return { estado: 'pendiente' };
  return { estado: 'publicado', url: page.imageinfo?.[0]?.descriptionurl };
}

// ---------- Escritura (requiere token OAuth 2.0 del usuario) ----------

function authedEndpoint() {
  // Peticiones autenticadas entre orígenes: MediaWiki las acepta con el
  // parámetro crossorigin + cabecera Authorization: Bearer. Si el navegador
  // las bloquea, se usa el proxy configurado.
  const base = CONFIG.uploadProxyUrl || CONFIG.commonsApi;
  const url = new URL(base);
  if (!CONFIG.uploadProxyUrl) url.searchParams.set('crossorigin', '');
  return url;
}

async function getCsrfToken(accessToken) {
  const url = authedEndpoint();
  url.searchParams.set('action', 'query');
  url.searchParams.set('meta', 'tokens');
  url.searchParams.set('format', 'json');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await res.json();
  const token = data.query?.tokens?.csrftoken;
  if (!token || token === '+\\') throw new Error('Sesión de Wikimedia no válida.');
  return token;
}

/**
 * Sube una imagen a Commons.
 * @param {{ file: File, filename: string, text: string, comment: string }} upload
 * @param {string} accessToken
 */
export async function uploadFile({ file, filename, text, comment }, accessToken) {
  assertOnline();
  const csrf = await getCsrfToken(accessToken);

  const body = new FormData();
  body.append('action', 'upload');
  body.append('format', 'json');
  body.append('filename', filename);
  body.append('text', text);
  body.append('comment', comment);
  body.append('ignorewarnings', '0');
  body.append('file', file, filename);
  body.append('token', csrf);

  const res = await fetch(authedEndpoint(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.info);
  if (data.upload?.result === 'Warning') {
    throw new Error(`Commons advirtió: ${Object.keys(data.upload.warnings).join(', ')}`);
  }
  return data.upload; // { result: 'Success', filename, imageinfo }
}

/** Texto de la página del archivo, con plantilla {{Information}} y licencia. */
export function buildFilePage({ titulo, descripcion, categoria, autor }) {
  const fecha = new Date().toISOString().slice(0, 10);
  return `=={{int:filedesc}}==
{{Information
|description={{es|1=${descripcion}}}
|date=${fecha}
|source={{own}}
|author=${autor ? `[[User:${autor}|${autor}]]` : '{{own}}'}
}}

=={{int:license-header}}==
${CONFIG.license}

[[Category:${CONFIG.uploadCategory}]]
<!-- Categoría de la carta: ${categoria} · Título: ${titulo} -->`;
}
