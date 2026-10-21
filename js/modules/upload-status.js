// Estado de publicación de las contribuciones en Commons
import { $, escapeHtml } from '../utils/dom.js';
import { CONFIG } from '../config.js';
import { getState, setState } from '../state.js';
import { getFileStatus } from '../services/commons-api.js';

const ETIQUETA = { subiendo: 'Subiendo', publicado: 'Publicado', pendiente: 'Pendiente', error: 'Error' };

function render() {
  const { contribuciones } = getState();
  $('#lista-contribuciones').innerHTML = contribuciones.length
    ? contribuciones
        .map((c) => {
          const clase = c.estado === 'subiendo' ? 'pendiente' : c.estado;
          const enlace = c.estado === 'publicado'
            ? `<a href="${CONFIG.commonsWeb}File:${encodeURIComponent(c.archivo)}" target="_blank" rel="noopener">${escapeHtml(c.titulo)}</a>`
            : escapeHtml(c.titulo);
          return `<li><span>${enlace}</span><span class="estado estado--${clase}" title="${escapeHtml(c.error ?? '')}">${ETIQUETA[c.estado]}</span></li>`;
        })
        .join('')
    : '<li>Aún no has creado cartas.</li>';
}

// Vuelve a preguntar a Commons por las que no están confirmadas
async function refrescar() {
  const pendientes = getState().contribuciones.filter((c) => c.estado !== 'publicado' && c.estado !== 'error');
  for (const c of pendientes) {
    try {
      const { estado } = await getFileStatus(c.archivo);
      setState((s) => ({ contribuciones: s.contribuciones.map((x) => (x.id === c.id ? { ...x, estado } : x)) }));
    } catch {
      /* se reintenta la próxima vez que se abra la vista */
    }
  }
  render();
}

export function initUploadStatus() {
  return {
    enter: () => {
      render();
      refrescar();
    },
  };
}
