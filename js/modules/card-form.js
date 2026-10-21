// Creación de cartas y envío a Wikimedia Commons
import { $, toast } from '../utils/dom.js';
import { CONFIG } from '../config.js';
import { setState } from '../state.js';
import { navigate } from '../router.js';
import { uploadFile, buildFilePage } from '../services/commons-api.js';
import { getAccessToken, isConfigured, login } from '../services/auth.js';

const MAX_MB = 15;

function validar(form) {
  const errores = {};
  const foto = form.foto.files[0];
  if (!foto) errores.foto = 'Toma o elige una foto de la carta.';
  else if (!foto.type.startsWith('image/')) errores.foto = 'El archivo debe ser una imagen.';
  else if (foto.size > MAX_MB * 1024 * 1024) errores.foto = `La imagen supera ${MAX_MB} MB.`;
  if (form.titulo.value.trim().length < 3) errores.titulo = 'Escribe un título (mínimo 3 caracteres).';
  if (!form.categoria.value) errores.categoria = 'Selecciona una categoría.';
  if (form.descripcion.value.trim().length < 10) errores.descripcion = 'Describe la carta (mínimo 10 caracteres).';
  return errores;
}

function mostrarErrores(form, errores) {
  form.querySelectorAll('[data-error]').forEach((p) => {
    const msg = errores[p.dataset.error];
    p.textContent = msg ?? '';
    p.hidden = !msg;
    form[p.dataset.error]?.setAttribute('aria-invalid', String(Boolean(msg)));
  });
  const primero = Object.keys(errores)[0];
  if (primero) form[primero]?.focus();
}

function nombreArchivo(titulo, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const limpio = titulo.replace(/[#<>[\]|{}/:]/g, '').trim();
  return `Ríos y Lugares - ${limpio} - ${Date.now()}.${ext}`;
}

async function enviar(form) {
  const errores = validar(form);
  mostrarErrores(form, errores);
  if (Object.keys(errores).length) return;

  if (!isConfigured()) {
    toast('Subida a Commons aún no configurada (falta OAuth).', 4000);
    return;
  }
  const token = getAccessToken();
  if (!token) {
    toast('Inicia sesión en Wikimedia para publicar.');
    return login();
  }

  const file = form.foto.files[0];
  const datos = {
    titulo: form.titulo.value.trim(),
    categoria: form.categoria.value,
    descripcion: form.descripcion.value.trim(),
  };
  const filename = nombreArchivo(datos.titulo, file);
  const id = crypto.randomUUID();
  const boton = form.querySelector('[type="submit"]');

  setState((s) => ({ contribuciones: [{ id, titulo: datos.titulo, archivo: filename, estado: 'subiendo', fecha: Date.now() }, ...s.contribuciones] }));
  boton.disabled = true;

  try {
    await uploadFile({ file, filename, text: buildFilePage(datos), comment: 'Carta creada con Ríos y Lugares' }, token);
    actualizar(id, { estado: 'publicado' });
    toast('¡Carta enviada a Wikimedia Commons!');
    form.reset();
    $('#foto-preview').hidden = true;
    navigate('contribuciones');
  } catch (err) {
    actualizar(id, { estado: 'error', error: err.message });
    toast(`Error al subir: ${err.message}`, 4000);
  } finally {
    boton.disabled = false;
  }
}

function actualizar(id, patch) {
  setState((s) => ({ contribuciones: s.contribuciones.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
}

export function initCardForm() {
  const form = $('#form-carta');
  const select = form.categoria;
  CONFIG.categoriasCarta.forEach((c) => select.add(new Option(c, c)));

  form.foto.addEventListener('change', () => {
    const file = form.foto.files[0];
    const preview = $('#foto-preview');
    if (preview.src) URL.revokeObjectURL(preview.src);
    preview.hidden = !file;
    if (file) preview.src = URL.createObjectURL(file);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    enviar(form);
  });
}
