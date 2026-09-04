# wg_template — Plantilla Fiesta P2P

Plantilla base para juegos de fiesta multijugador en navegador. **Sin servidor ni base de datos**, 100% estática en GitHub Pages (1–20 jugadores, turnos).

- **Stack:** Svelte + Vite + TypeScript + Trystero (WebRTC P2P via trackers públicos)
- **Flujo:** Crear sala → compartir enlace `#/sala/<id>` → lobby → juego
- **Demos incluidas:** trivia configurable y votación mínima
- **Host migration:** Si el anfitrión se va, el siguiente jugador toma el control sin perder estado

## Uso rápido

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ listo para GH Pages
npm run test     # vitest
```

## Cómo funciona sin servidor

Usa [Trystero](https://github.com/dmotz/trystero) (strategy `torrent`) que se conecta a trackers públicos gratuitos (`wss://tracker.openwebtorrent.com` etc.) como señalización temporal. **No creas cuenta ni hosteas nada** — tu código solo está en `dist/`. El `salaId` se usa como `appId` para que peers se encuentren.

Alternativa: cambiar `src/lib/net/trysteroAdapter.ts` por PeerJS si prefieres.

## Crear tu propio juego

Sigue la guía de tres pasos en [`docs/NUEVO-JUEGO.md`](docs/NUEVO-JUEGO.md). Incluye
el contrato `GameModule`, las reglas del reducer, el registro, los tests y la prueba
directa con `?juego=`. `src/lib/game/votacion/` es el ejemplo mínimo para copiar.

El anfitrión elige cualquier juego registrado desde el lobby; la selección viaja en
el enlace de invitación y se sincroniza por P2P.

## Pruebas

```bash
npm run check
npm run test
npm run build
npx playwright install --with-deps chromium  # solo la primera vez
npm run test:e2e
E2E_P2P=1 npm run test:e2e  # exige la prueba real de dos navegadores
```

La prueba P2P se salta si no logra alcanzar los trackers, salvo cuando `E2E_P2P=1`.

## Deploy a GitHub Pages

- El workflow `.github/workflows/pages.yml` hace build y deploy automático al pushear a `main`.
- Configura `Settings → Pages → Source: GitHub Actions`.
- `vite.config.ts` usa `VITE_BASE=/wg_template/` — cambia al nombre de tu repo.

## Estructura

```
src/lib/net/      # P2P (Trystero adapter, helpers)
src/lib/stores/   # roomStore, gameStore
src/lib/game/     # contrato + registry + juegos trivia/votación
src/routes/       # Landing, Room, Game
src/components/   # PlayerList, ShareLink, NameInput
```

## Límites

- 20 jugadores max (mesh P2P)
- Host autoritativo, mensajes JSON pequeños
- Sin persistencia (recargar pierde sala)

Licencia MIT — clona y modifica libremente.
