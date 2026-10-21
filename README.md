# Ríos y Lugares — App de acompañamiento (MVP)

Proyecto con Wikimedia Colombia. Equipo: Felipe Restrepo Rojas, Catalina Ruiz Montenegro, Carlos Burgos Lugo.

Web app **mobile-first** que acompaña al juego de mesa físico. **Requiere internet**: no hay modo offline, Service Workers ni IndexedDB.

## Cómo ejecutar

Usa HTML, CSS y JS (ES Modules) sin paso de compilación. Los módulos no cargan con `file://`, así que necesitas un servidor local:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Luego abre http://localhost:5500. También sirve la extensión "Live Server" de VS Code.

**Para probar en el celular:** la cámara exige **HTTPS**. Hay dos opciones:
- Desplegar en Netlify o GitHub Pages: arrastras la carpeta y listo.
- Usar un túnel tipo `cloudflared tunnel --url http://localhost:5500`.

## Estructura

```
index.html            Shell con todas las vistas (<section data-view="...">)
css/
  tokens.css          Variables extraídas de Figma (colores, tipografía, radios, sombras)
  base.css · layout.css · components.css
  views/              scan.css · score.css · card.css
js/
  main.js             Arranque y registro de vistas
  router.js           Hash router (#/inicio, #/jugadores, #/turno, #/escanear, #/carta/:id, #/crear, #/contribuciones)
  state.js            Store pub/sub (jugadores, turno, contribuciones)
  config.js           Endpoints, OAuth, licencia, prefijo de los QR
  services/           commons-api.js · auth.js (OAuth2 PKCE) · cards-repo.js
  modules/            qr-scanner.js · scoreboard.js · card-view.js · card-form.js · upload-status.js
  utils/              dom.js · network.js
data/cards.json       Catálogo de cartas (puntos, efecto, búsqueda en Commons)
assets/               SVG descargados de Figma
```

## Mapa Figma → código

| Vista | Nodo Figma (página 8) |
|---|---|
| `#/turno` | `427:1789` Partida rápida - turno |
| `#/escanear` | `427:1881` QR - grupo |
| `#/carta/:id` | `427:1922` Evento - grupo |
| `#/crear` | `458:4035` Generar contribución - carta |
| `#/jugadores` | `427:1668` Agregar integrantes |

## Formato de los QR

Cada carta lleva un QR con el texto `ryl:<id>` (por ejemplo `ryl:bocachico`). También se acepta una URL que termine en `#/carta/<id>`. Los `id` están en `data/cards.json`.

## Pendientes

- [ ] Registrar el consumidor **OAuth 2.0** en Meta-Wiki y pegar el `clientId` en `js/config.js`. La aprobación puede tardar varios días.
- [ ] Confirmar los puntos, efectos y textos bioculturales de cada carta en `data/cards.json`.
- [ ] Imprimir los QR de las cartas.
- [ ] Revisar con el equipo si el puntaje se usa en un solo dispositivo (así está hoy) o sincronizado entre varios.
