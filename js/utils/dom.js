export const $ = (sel, root = document) => root.querySelector(sel);

// Rellena todos los [data-bind="clave"] dentro de root con el texto dado
export function bind(root, values) {
  Object.entries(values).forEach(([key, value]) => {
    root.querySelectorAll(`[data-bind="${key}"]`).forEach((el) => {
      el.textContent = value ?? '';
    });
  });
}

let toastTimer;
export function toast(message, ms = 2500) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}

export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
