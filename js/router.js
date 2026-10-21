// Hash router: #/vista/parametro → muestra <section data-view="vista">
const handlers = new Map();
let current = null;

export function onView(name, { enter, leave } = {}) {
  handlers.set(name, { enter, leave });
}

export function navigate(path) {
  location.hash = `#/${path}`;
}

export function back() {
  if (history.length > 1) history.back();
  else navigate('inicio');
}

function resolve() {
  const [name = 'inicio', ...params] = location.hash.replace(/^#\/?/, '').split('/');
  const view = document.querySelector(`[data-view="${name}"]`) ? name : 'inicio';

  if (current && current !== view) handlers.get(current)?.leave?.();
  document.querySelectorAll('[data-view]').forEach((el) => {
    el.hidden = el.dataset.view !== view;
  });
  current = view;
  window.scrollTo(0, 0);
  handlers.get(view)?.enter?.(...params.map(decodeURIComponent));
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) back();
  });
  resolve();
}
