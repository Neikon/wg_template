# AGENTS.md — wg_template (plantilla fiesta P2P)

> Archivo de traspaso: si retomas este proyecto en una conversación nueva (p. ej. dentro del devcontainer), empieza aquí.

## Qué es

Plantilla de juegos de fiesta multijugador en navegador, 100 % estática (GitHub Pages), sin backend ni base de datos.
Flujo: crear sala → compartir enlace `#/sala/<id>` → lobby (1–20 jugadores) → trivia demo por turnos.
Red P2P con Trystero (`torrent`, trackers públicos, sin cuentas). Host-autoritativo lógico con migración de host. UI en español.

## Dónde está la arquitectura

- **Spec (diseño + §11 estado de implementación):** `docs/superpowers/specs/2026-09-04-wg-template-fiesta-design.md`
- **Plan (tareas + estado de ejecución + Tasks 8–9 pendientes):** `docs/superpowers/plans/2026-09-04-wg-template-fiesta-implementation.md`
- **Este archivo** es solo el índice/handoff; la verdad arquitectónica vive en esos dos documentos.

## Mapa de código

- `src/App.svelte`, `src/main.ts` — entrada + router hash (`#/` → Landing, `#/sala/<id>` → Room)
- `src/routes/{Landing,Room,Game}.svelte` — páginas; `Room.svelte` contiene la lógica P2P viva (hello/requestState/stateSync/action/rename, heartbeat 2 s, timer host 1 s, `electNewHost`)
- `src/components/{PlayerList,ShareLink,NameInput}.svelte` — UI lobby
- `src/lib/net/{types,trysteroAdapter,room}.ts` — `Msg`, adapter Trystero (`appId='wg_template_v1_'+salaId`), `electNewHost`/`isRoomFull`
- `src/lib/stores/{roomStore,gameStore}.ts` — `roomStore` (sala/peers/joinOrder/isHost) + `gameStore` (aplica `stateSync` solo si versión mayor)
- `src/lib/game/{types,registry}.ts` + `src/lib/game/trivia/{types,questions,engine,Trivia}.svelte` — `GameModule` + trivia demo (10 preguntas ES, `startGame/answer/tick/nextQuestion/restart`)
- `src/lib/utils/{id,names}.ts` — `generateSalaId` (6 chars), `assignName` (`Jugador N`), `sanitizeName`
- `vite.config.ts` — `base=VITE_BASE || '/wg_template/'`, `server/preview` con `host:true, strictPort:true` (devcontainer)
- `.devcontainer/devcontainer.json` + `post-create.sh` — imagen `typescript-node:22` (trae node/npm/git, **no** `gh`; el script lo instala vía apt y luego corre `npm ci`), puertos 5173/4173
- `.github/workflows/pages.yml` — build (`VITE_BASE=/wg_template/`) + `deploy-pages@v4`
- `tests/unit/{names,id,room,engine}.test.ts` — 16 tests

## Comandos (Node 22)

```bash
npm ci            # instalar (postCreate del devcontainer ya lo hace)
npm run dev       # http://localhost:5173
npm run test      # vitest run (16 tests)
npm run check     # svelte-check + tsc
npm run build     # dist/ para Pages
```

## Estado a 2026-09-04

- ✅ Tasks 1–7 del plan hechas. Commit `d7cbeb1` en `main`, pusheado a `Neikon/wg_template` (`https://github.com/Neikon/wg_template`).
- ✅ Pages habilitado (`build_type=workflow`), run `33898722403` en success. URL: `https://neikon.github.io/wg_template/`.
- ✅ `check` 0 errores · `test` 16/16 · `build` 160 módulos, JS ~127 KB (43,7 KB gzip).
- 🟡 **Sin commitear:** `.devcontainer/` (nuevo) + `vite.config.ts` (`host:true`). Siguiente paso: commit + push + reabrir en contenedor.
- 🔴 **Bug pendiente (no tocar nada más antes):** la URL publicada muestra solo el fondo oscuro. Hipótesis principal: `src/main.ts` usa `new App({target})` (Svelte 4) con Svelte 5.56 instalado (API `mount`). Ver Task 9 del plan.

## Entorno

- Host: Bazzite (Fedora atomic) sin node local; antes se usó toolbox `Fedora-gpu` (node 22) vía podman.
- Editor del usuario: **Zed** (no VS Code). El devcontainer es estándar; ábrelo con el soporte de contenedores de Zed.
- Idioma del proyecto: ES. Restricción: nada que hostear/pagar (Trystero usa trackers públicos).

## Al retomar

1. Lee spec §11 y plan (estado + Tasks 8–9).
2. Commit/push del devcontainer si sigue pendiente.
3. Diagnostica el bug (Task 9): consola del navegador → `src/main.ts` → `mount()` → `check/test/build` → preview 2 pestañas → push → verificar Pages.
