# wg_template — Plantilla Fiesta P2P

Plantilla base para juegos de fiesta multijugador en navegador. **Sin servidor ni base de datos**, 100% estática en GitHub Pages (1–20 jugadores, turnos).

- **Stack:** Svelte + Vite + TypeScript + Trystero (WebRTC P2P via trackers públicos)
- **Flujo:** Crear sala → compartir enlace `#/sala/<id>` → lobby → juego
- **Demo incluido:** Trivia 10 preguntas
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

## Crear tu propio juego en 5 pasos

1. Crea carpeta `src/lib/game/miJuego/` con:
   - `types.ts` (estado y acciones)
   - `engine.ts` (`createInitialState(peers)` + `reducer(state, action, ctx)`)
   - `MiJuego.svelte` (UI, recibe `onAction`)

2. Implementa el módulo (ejemplo trivia: ver `src/lib/game/trivia/engine.ts`):

```ts
export function createInitialState(peers){ return {phase:'lobby', version:0} }
export function reducer(state, action, {isHost, peerId}){
  if (action.t==='miAccion' && isHost) return {...state, version: state.version+1}
  return state
}
```

3. Registra en `src/lib/game/registry.ts`:

```ts
import * as miJuego from './miJuego/engine'
import MiJuegoComp from './miJuego/MiJuego.svelte'
export const registry = {
  trivia: { id:'trivia', ...trivia, Component: TriviaComp },
  miJuego: { id:'miJuego', createInitialState: miJuego.createInitialState, reducer: miJuego.reducer, Component: MiJuegoComp }
}
export const currentGame = 'miJuego'
```

4. Cambia `currentGame` o permite elegir juego en lobby.

5. `npm run build` y prueba con 2 pestañas.

## Deploy a GitHub Pages

- El workflow `.github/workflows/pages.yml` hace build y deploy automático al pushear a `main`.
- Configura `Settings → Pages → Source: GitHub Actions`.
- `vite.config.ts` usa `VITE_BASE=/wg_template/` — cambia al nombre de tu repo.

## Estructura

```
src/lib/net/      # P2P (Trystero adapter, helpers)
src/lib/stores/   # roomStore, gameStore
src/lib/game/     # engine + trivia demo + registry
src/routes/       # Landing, Room, Game
src/components/   # PlayerList, ShareLink, NameInput
```

## Límites

- 20 jugadores max (mesh P2P)
- Host autoritativo, mensajes JSON pequeños
- Sin persistencia (recargar pierde sala)

Licencia MIT — clona y modifica libremente.
