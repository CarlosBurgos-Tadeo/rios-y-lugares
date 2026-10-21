// Escaneo de cartas con la cámara (librería html5-qrcode cargada en index.html)
import { $ } from '../utils/dom.js';
import { navigate } from '../router.js';
import { parseQr } from '../services/cards-repo.js';

let scanner = null;

const estado = (msg) => ($('#qr-estado').textContent = msg);

function setScanning(on) {
  $('#qr-placeholder').hidden = on;
  $('#btn-escanear').hidden = on;
  $('#btn-reescanear').hidden = !on;
}

export async function startScan() {
  if (!window.Html5Qrcode) return estado('No se pudo cargar el lector QR. Revisa tu conexión.');
  if (!window.isSecureContext) return estado('La cámara requiere HTTPS (o localhost).');

  await stopScan();
  scanner = new window.Html5Qrcode('qr-reader', { verbose: false });
  setScanning(true);
  estado('Buscando código…');

  try {
    await scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: (w, h) => ({ width: Math.floor(Math.min(w, h) * 0.75), height: Math.floor(Math.min(w, h) * 0.75) }) },
      async (text) => {
        const id = parseQr(text);
        if (!id) return estado('Este código no es de una carta de Ríos y Lugares.');
        navigator.vibrate?.(80);
        await stopScan();
        navigate(`carta/${encodeURIComponent(id)}`);
      },
      () => {} // fallo por fotograma: se ignora, sigue intentando
    );
  } catch (err) {
    setScanning(false);
    estado(err?.name === 'NotAllowedError' ? 'Debes permitir el acceso a la cámara.' : 'No se pudo abrir la cámara.');
  }
}

export async function stopScan() {
  if (scanner?.isScanning) await scanner.stop().catch(() => {});
  scanner?.clear?.();
  scanner = null;
}

export function initScanView() {
  $('#btn-escanear').addEventListener('click', startScan);
  $('#btn-reescanear').addEventListener('click', startScan);
  return {
    enter: () => {
      setScanning(false);
      estado('');
    },
    leave: stopScan,
  };
}
