export interface TriviaState {
  phase: 'lobby' | 'pregunta' | 'resultados' | 'final'
  preguntaIdx: number
  respuestas: Record<string, number> // peerId -> opcion idx
  puntuaciones: Record<string, number>
  timer: number
  version: number
  gameId: 'trivia'
}
export type TriviaAction =
  | { t: 'startGame' }
  | { t: 'answer'; opcion: number }
  | { t: 'nextQuestion' }
  | { t: 'tick' }
  | { t: 'restart' }
