import * as triviaEngine from './trivia/engine'
import TriviaComp from './trivia/Trivia.svelte'
import * as votacionEngine from './votacion/engine'
import VotacionComp from './votacion/Votacion.svelte'
import type { GameModule } from './types'

export const DEFAULT_GAME_ID = 'trivia'

export const registry: Record<string, GameModule<any, any> & { Component: any }> = {
  trivia: {
    id: 'trivia',
    nombre: 'Trivia',
    createInitialState: triviaEngine.createInitialState,
    reducer: triviaEngine.reducer,
    Component: TriviaComp
  },
  votacion: {
    id: 'votacion',
    nombre: 'Votación',
    createInitialState: votacionEngine.createInitialState,
    reducer: votacionEngine.reducer,
    Component: VotacionComp
  }
}

export function getGameModule(id: string) {
  return registry[id] ?? null
}

export function getGameOptions() {
  return Object.values(registry).map(({ id, nombre }) => ({ id, nombre }))
}
