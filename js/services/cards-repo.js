// Catálogo de cartas del juego físico (data/cards.json)
import { CONFIG } from '../config.js';

let cache;

async function loadAll() {
  if (!cache) {
    const res = await fetch('data/cards.json');
    if (!res.ok) throw new Error('No se pudo cargar el catálogo de cartas.');
    cache = res.json();
  }
  return cache;
}

export async function getCard(id) {
  const cards = await loadAll();
  return cards.find((c) => c.id === id) ?? null;
}

/**
 * Convierte el texto leído en el QR en un id de carta.
 * Acepta "ryl:taruya" o una URL que termine en "#/carta/taruya".
 */
export function parseQr(text) {
  const raw = text.trim();
  if (raw.startsWith(CONFIG.qrPrefix)) return raw.slice(CONFIG.qrPrefix.length);
  const match = raw.match(/#\/carta\/([\w-]+)/);
  return match ? match[1] : null;
}
