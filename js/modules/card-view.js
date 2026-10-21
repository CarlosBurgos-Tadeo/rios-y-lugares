// Consulta de información de la carta escaneada
import { $, bind, toast } from '../utils/dom.js';
import { getCard } from '../services/cards-repo.js';
import { findImage } from '../services/commons-api.js';
import { jugadorActual, sumarPuntos } from './scoreboard.js';
import { navigate } from '../router.js';

const view = () => $('[data-view="carta"]');
let cartaActual = null;

async function show(id) {
  const img = $('#carta-imagen');
  const link = $('#carta-commons');
  const btn = $('#btn-aplicar-carta');
  img.removeAttribute('src');
  link.hidden = true;
  btn.hidden = true;

  const carta = await getCard(id);
  cartaActual = carta;
  if (!carta) {
    bind(view(), { 'carta-nombre': 'Carta desconocida', 'carta-puntos': '', 'carta-efecto': '', 'carta-descripcion': `No hay datos para "${id}".` });
    return;
  }

  bind(view(), {
    'carta-nombre': carta.nombre,
    'carta-puntos': carta.puntos > 0 ? `+${carta.puntos}` : carta.puntos,
    'carta-efecto': carta.efecto,
    'carta-descripcion': carta.descripcion,
  });
  img.alt = carta.nombre;

  const jugador = jugadorActual();
  if (jugador && carta.puntos !== 0) {
    btn.textContent = `${carta.puntos > 0 ? 'Sumar' : 'Restar'} ${Math.abs(carta.puntos)} a ${jugador.nombre}`;
    btn.hidden = false;
  }

  try {
    const foto = await findImage(carta.commonsQuery);
    if (foto && cartaActual === carta) {
      img.src = foto.thumb;
      link.href = foto.page;
      link.hidden = false;
    }
  } catch {
    toast('No se pudo consultar Wikimedia Commons.');
  }
}

// Con partida en curso vuelve al turno; si no, al inicio
const continuar = () => navigate(jugadorActual() ? 'turno' : 'inicio');

export function initCardView() {
  $('#btn-aplicar-carta').addEventListener('click', () => {
    if (!cartaActual) return;
    sumarPuntos(cartaActual.puntos);
    toast('Puntaje actualizado');
    continuar();
  });
  $('#btn-continuar').addEventListener('click', continuar);
  return { enter: show };
}
