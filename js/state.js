// Store mínimo con pub/sub. Se guarda en sessionStorage solo para no perder la
// partida si el usuario recarga la página (no es modo offline).
const KEY = 'ryl-state';

const initial = {
  jugadores: [], // [{ id, nombre, puntaje }]
  turno: 0,
  contribuciones: [], // [{ id, titulo, archivo, estado, fecha, error? }]
};

let state = load();
const listeners = new Set();

function load() {
  try {
    return { ...initial, ...JSON.parse(sessionStorage.getItem(KEY)) };
  } catch {
    return structuredClone(initial);
  }
}

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sin almacenamiento: la app sigue funcionando en memoria */
  }
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
