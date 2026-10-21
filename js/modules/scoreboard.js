// Sistema de puntajes de la partida física
import { $, bind, escapeHtml } from '../utils/dom.js';
import { getState, setState, subscribe } from '../state.js';
import { navigate } from '../router.js';

export const jugadorActual = () => {
  const { jugadores, turno } = getState();
  return jugadores[turno] ?? null;
};

export function sumarPuntos(delta, jugadorId = jugadorActual()?.id) {
  setState((s) => ({
    jugadores: s.jugadores.map((j) => (j.id === jugadorId ? { ...j, puntaje: j.puntaje + delta } : j)),
  }));
  const el = $('#puntaje-actual');
  el.classList.remove('is-bump');
  void el.offsetWidth; // reinicia la animación
  el.classList.add('is-bump');
}

function cambiarTurno() {
  setState((s) => ({ turno: (s.turno + 1) % Math.max(s.jugadores.length, 1) }));
}

function agregarJugador(nombre) {
  setState((s) => ({ jugadores: [...s.jugadores, { id: crypto.randomUUID(), nombre, puntaje: 0 }] }));
}

function quitarJugador(id) {
  setState((s) => ({ jugadores: s.jugadores.filter((j) => j.id !== id), turno: 0 }));
}

function renderLista(ul, { jugadores, turno }, conBorrar) {
  ul.innerHTML = jugadores
    .map(
      (j, i) => `<li ${!conBorrar && i === turno ? 'aria-current="true"' : ''}>
        <span>${escapeHtml(j.nombre)}</span>
        ${conBorrar
          ? `<button type="button" data-quitar="${j.id}" aria-label="Quitar a ${escapeHtml(j.nombre)}">✕</button>`
          : `<strong>${j.puntaje}</strong>`}
      </li>`
    )
    .join('');
}

function render(state) {
  const actual = state.jugadores[state.turno];
  bind(document, { 'jugador-actual': actual?.nombre ?? '—' });
  $('#puntaje-actual').textContent = actual?.puntaje ?? 0;
  renderLista($('#marcador'), state, false);
  renderLista($('#lista-jugadores'), state, true);
  $('#btn-comenzar').disabled = state.jugadores.length === 0;
}

export function initScoreboard() {
  $('#form-jugador').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = e.target.nombre;
    const nombre = input.value.trim();
    if (nombre) agregarJugador(nombre);
    input.value = '';
    input.focus();
  });

  $('#lista-jugadores').addEventListener('click', (e) => {
    const id = e.target.closest('[data-quitar]')?.dataset.quitar;
    if (id) quitarJugador(id);
  });

  $('#btn-comenzar').addEventListener('click', () => {
    setState((s) => ({ turno: 0, jugadores: s.jugadores.map((j) => ({ ...j, puntaje: 0 })) }));
    navigate('turno');
  });

  $('[data-view="turno"]').addEventListener('click', (e) => {
    const delta = e.target.closest('[data-delta]')?.dataset.delta;
    if (delta) sumarPuntos(Number(delta));
  });

  $('#btn-cambiar-turno').addEventListener('click', cambiarTurno);

  subscribe(render);
  render(getState());

  return {
    enter: () => {
      if (!getState().jugadores.length) navigate('jugadores');
    },
  };
}
