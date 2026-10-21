import { onView, startRouter } from './router.js';
import { watchConnection } from './utils/network.js';
import { handleRedirect } from './services/auth.js';
import { initScanView } from './modules/qr-scanner.js';
import { initScoreboard } from './modules/scoreboard.js';
import { initCardView } from './modules/card-view.js';
import { initCardForm } from './modules/card-form.js';
import { initUploadStatus } from './modules/upload-status.js';

async function boot() {
  watchConnection();
  await handleRedirect().catch(() => {});

  const turno = initScoreboard();
  onView('turno', turno);
  onView('escanear', initScanView());
  onView('carta', initCardView());
  onView('contribuciones', initUploadStatus());
  initCardForm();

  startRouter();
}

boot();
