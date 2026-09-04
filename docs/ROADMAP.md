# Roadmap — wg_template (plantilla fiesta P2P)

> Estado a 2026-09-04: trivia jugable lobby → preguntas → resultados → final, con
> lobby/juego separados, QR, avance al responder todos, e2e Playwright y deploy en Pages.
> Los puntos 1–5 salen de la revisión "¿qué le falta como plantilla?".

---

## 1. Guía "crea tu juego" + juego de ejemplo mínimo

**Problema:** el contrato `GameModule` (`createInitialState` + `reducer` + componente
Svelte) existe en `src/lib/game/types.ts`, pero no está documentado y la trivia
(~200 líneas entre engine, preguntas y vista) es demasiado grande para copiar como ejemplo.

**Objetivo:** que añadir un juego nuevo sea seguir una guía de 3 pasos con un ejemplo
trivial de referencia (propuesta: "votación" — 1 fase, 1 acción `votar`, sin timer).

**Plan de acción:**
- [ ] **1.1** Crear `src/lib/game/votacion/` con `types.ts`, `engine.ts`, `Votacion.svelte`
  siguiendo `GameModule` (reducer puro, versionado +1 por transición).
- [ ] **1.2** Registrarlo en `src/lib/game/registry.ts` sin tocar `currentGame`.
- [ ] **1.3** Añadir `tests/unit/votacion.test.ts` (crear → votar → doble voto ignorado),
  espejo de `tests/unit/engine.test.ts`.
- [ ] **1.4** Escribir `docs/NUEVO-JUEGO.md`: contrato `GameModule`, reglas del reducer
  (puro, solo el host muta, `version+1`), cómo registrar en el `registry`, cómo añadir
  tests y cómo probarlo en local con `?juego=` (ver punto 2).
- [ ] **1.5** Verificación: `npm run check`, `npm run test`, `npm run build`,
  `npm run test:e2e` en verde antes de subir.

**Criterio de done:** una persona nueva crea un juego siguiendo solo `docs/NUEVO-JUEGO.md`
sin tocar `src/lib/net/` ni `src/routes/`.

---

## 2. Desacoplar `Room` del juego concreto (selector en lobby)

**Problema:** `src/routes/Room.svelte` importa `createInitialState`/`reducer` de la
trivia directamente y `currentGame` es una constante en el `registry`. Añadir un juego
hoy obliga a tocar la capa de red/UI, que debería ser agnóstica.

**Objetivo:** `Room` resuelve engine + componente desde el `registry` según el juego
elegido; el enlace de sala lo transporta (`#/sala/<id>?juego=votacion`); el lobby
muestra un selector (solo host, antes de empezar).

**Plan de acción:**
- [ ] **2.1** Añadir al protocolo `Msg` (`src/lib/net/types.ts`) el campo `juegoId` en
  `stateSync` y en la acción `startGame` (p. ej. `{ t:'startGame', juego }`).
- [ ] **2.2** Refactor `Room.svelte`: sustituir imports de trivia por
  `registry[juegoId].createInitialState` / `.reducer`; el componente se resuelve en
  `Game.svelte` (ya lo hace vía `currentGame` → parametrizar por prop).
- [ ] **2.3** Lobby: selector de juego (lista de `Object.keys(registry)`) visible para
  el host en `phase==='lobby'`; al cambiarlo antes de empezar, se reinicia el estado
  con `createInitialState` del juego elegido y se difunde.
- [ ] **2.4** Invitados: aceptan el `juegoId` del host vía `stateSync`; si no lo tienen
  registrado, mostrar "juego no disponible" en vez de romper.
- [ ] **2.5** Tests: unitario de resolución del registry + e2e (crear sala con
  `?juego=votacion`, visible su vista; volver a trivia).
- [ ] **2.6** Verificación completa en local + prueba manual en navegador (2 pestañas).

**Criterio de done:** jugar una partida de votación sin modificar `Room.svelte`,
`Game.svelte` ni `src/lib/net/`.

---

## 3. Configuración de partida en el lobby

**Problema:** parámetros quemados en código (10 preguntas, 20 s por pregunta, lista fija
de `questions.ts`). Una plantilla debe exponerlos.

**Objetivo:** el host configura antes de empezar: nº de preguntas, segundos por
pregunta y categoría/tema. Viaja en el `startGame` y queda registrado en el estado.

**Plan de acción:**
- [ ] **3.1** Extender `TriviaState` con `config: { numPreguntas, segundos, categoria }`
  y la acción `startGame` con esos campos (con valores por defecto = comportamiento actual).
- [ ] **3.2** Lobby (host): 3 controles (número, segundos, selector de categoría según
  las disponibles en `questions.ts`, reorganizadas por tema).
- [ ] **3.3** Engine: `startGame` aplica la config; `tick`/`nextQuestion` la respetan
  (fin cuando `preguntaIdx >= numPreguntas`).
- [ ] **3.4** Tests unitarios: config por defecto intacta + partida corta (p. ej. 2
  preguntas, 5 s) de principio a fin vía reducer.
- [ ] **3.5** e2e: configurar partida corta como host y verificar que termina en 2 preguntas.
- [ ] **3.6** Verificación completa en local antes de subir.

**Criterio de done:** partidas de distinta duración/tema sin tocar código.
**Depende de:** nada (puede hacerse antes o después del punto 2; si se hace después,
la config viaja dentro del `startGame` genérico).

---

## 4. Bug: segunda sala sin recargar reutiliza la anterior

**Problema (reproducido manualmente):** crear sala → salir → crear otra sin recargar
mantiene `salaId`, peers y conexión Trystero de la sala vieja. `Room.svelte` solo se
inicializa en `onMount` y `App.svelte` no re-monta `Room` al cambiar el hash entre
salas (`roomStore` conserva `v.salaId` y lo reimpone sobre el parseado).

**Objetivo:** cambiar de sala = estado limpio (leave + init + join nuevos).

**Plan de acción:**
- [ ] **4.1** En `Room.svelte`, extraer la inicialización a `setup(salaId)` con su
  `teardown()` (`trystero.leave()`, `clearInterval`, unsubscribes) y re-ejecutarla
  cuando el `salaId` del hash cambie (suscripción a `hashchange` o `$:` reactivo).
- [ ] **4.2** Alternativa/complemento en `App.svelte`: forzar remontaje con
  `{#key salaId}<Room />{/key}`. Elegir la más simple que pase los tests.
- [ ] **4.3** Revisar `initRoom`/`roomStore`: no reimponer `salaId` viejo del store
  sobre el recién parseado.
- [ ] **4.4** e2e de regresión: crear sala A → salir → crear sala B → el lobby muestra
  el código B, 1/20 jugadores y enlace de B.
- [ ] **4.5** Verificación completa en local antes de subir.

**Criterio de done:** el test 4.4 pasa y la prueba manual de 2 salas seguidas muestra
datos correctos.

---

## 5. E2E de 2 jugadores (sync host ↔ invitado)

**Problema:** el e2e actual usa 1 solo peer; el sync real (`hello`/`requestState`/
`stateSync`/`action`) solo se ha probado a mano. Para una plantilla P2P, el test de
2 jugadores es la red de seguridad principal.

**Objetivo:** test Playwright con dos contextos (host + invitado) en la misma sala:
el invitado ve jugadores y preguntas, responde, y el host lo refleja.

**Plan de acción:**
- [ ] **5.1** Nuevo spec `tests/e2e/dos-jugadores.spec.ts`: contexto A crea sala
  (extrae `salaId` de la URL), contexto B abre `#/sala/<id>` como invitado.
- [ ] **5.2** Aserciones: B ve su nombre en la lista de A; A empieza; ambos ven
  "Pregunta 1"; B responde; A ve "1/2 han respondido".
- [ ] **5.3** Hacerlo tolerante a red: reintentos/timeouts amplios y `test.skip` si no
  hay conectividad a trackers (variable `E2E_P2P=1` para exigirlo en local con red).
- [ ] **5.4** Documentar en el plan/spec que la red P2P real no se puede verificar en
  contenedores sin salida externa (como este), solo en local/CI con red.
- [ ] **5.5** Verificación: `test:e2e` en verde en entorno con red antes de subir.

**Criterio de done:** el spec pasa en local con red y se salta limpiamente sin ella.
**Depende de:** punto 4 (salas limpias) para resultados fiables.

---

## Orden sugerido

1. **Punto 4** (bug real, bloquea probar el resto con fluidez) → **1** (documenta el
   contrato antes de refactorizar) → **2** (desacople) → **3** (config) → **5** (2 peers,
   necesita 4 y red).
