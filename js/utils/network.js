// La app requiere internet: si se pierde la conexión, se bloquea la interfaz
import { $ } from './dom.js';

export function watchConnection() {
  const overlay = $('#sin-conexion');
  const update = () => (overlay.hidden = navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

export function assertOnline() {
  if (!navigator.onLine) throw new Error('Sin conexión a internet.');
}
