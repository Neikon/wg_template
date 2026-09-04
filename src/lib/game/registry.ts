import * as triviaEngine from './trivia/engine'
import TriviaComp from './trivia/Trivia.svelte'
import type { GameModule } from './types'

export const registry: Record<string, GameModule<any,any> & { Component:any }> = {
  trivia: {
    id: 'trivia',
    createInitialState: triviaEngine.createInitialState,
    reducer: triviaEngine.reducer,
    Component: TriviaComp
  }
}
export const currentGame = 'trivia'
