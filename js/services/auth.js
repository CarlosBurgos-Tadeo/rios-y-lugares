// Inicio de sesión con Wikimedia mediante OAuth 2.0 + PKCE (cliente público, sin secreto)
import { CONFIG } from '../config.js';

const TOKEN_KEY = 'ryl-wm-token';
const VERIFIER_KEY = 'ryl-wm-verifier';

const redirectUri = () => `${location.origin}${location.pathname}`;

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function getAccessToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isConfigured() {
  return Boolean(CONFIG.oauth.clientId);
}

export async function login() {
  if (!isConfigured()) throw new Error('Falta configurar el client_id de OAuth de Wikimedia.');
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const url = new URL(CONFIG.oauth.authorizeUrl);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: CONFIG.oauth.clientId,
    redirect_uri: redirectUri(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: location.hash || '#/crear',
  });
  location.assign(url);
}

/** Llamar al arrancar: si volvemos de Wikimedia con ?code=, lo cambia por un token. */
export async function handleRedirect() {
  const params = new URLSearchParams(location.search);
  const code = params.get('code');
  if (!code) return;

  const res = await fetch(CONFIG.oauth.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CONFIG.oauth.clientId,
      redirect_uri: redirectUri(),
      code_verifier: sessionStorage.getItem(VERIFIER_KEY) ?? '',
    }),
  });
  const data = await res.json();
  if (data.access_token) sessionStorage.setItem(TOKEN_KEY, data.access_token);
  sessionStorage.removeItem(VERIFIER_KEY);

  // Limpiar ?code= de la URL y volver a la vista donde estaba el usuario
  history.replaceState(null, '', `${redirectUri()}${params.get('state') ?? ''}`);
}
