import type { TriviaState, TriviaAction } from './types'
import { QUESTIONS } from './questions'

export function createInitialState(peers: {id:string}[]): TriviaState {
  const puntuaciones: Record<string,number> = {}
  for (const p of peers) puntuaciones[p.id]=0
  return {
    phase: 'lobby',
    preguntaIdx: 0,
    respuestas: {},
    puntuaciones,
    timer: 20,
    version: 0,
    gameId: 'trivia'
  }
}

function toResultados(state: TriviaState): TriviaState {
  const correcta = QUESTIONS[state.preguntaIdx].correcta
  const nextPunt = { ...state.puntuaciones }
  for (const [pid, ans] of Object.entries(state.respuestas)) {
    if (ans === correcta) nextPunt[pid] = (nextPunt[pid]||0)+100
  }
  return { ...state, phase: 'resultados', timer: 5, puntuaciones: nextPunt, version: state.version+1 }
}

export function reducer(state: TriviaState, action: TriviaAction, ctx:{isHost:boolean, peerId:string}): TriviaState {
  // solo host puede iniciar y avanzar, pero answer puede venir de cualquier peer (validado por host)
  if (action.t === 'startGame') {
    if (!ctx.isHost) return state
    if (state.phase !== 'lobby' && state.phase !== 'final') return state
    // asegurar puntuaciones para todos los peers conocidos (se rellenará al sincronizar)
    return { ...state, phase: 'pregunta', preguntaIdx: 0, respuestas: {}, timer: 20, version: state.version+1 }
  }
  if (action.t === 'answer') {
    if (state.phase !== 'pregunta') return state
    if (state.respuestas[ctx.peerId] !== undefined) return state
    if (state.timer <= 0) return state
    // validar opcion rango
    if (action.opcion <0 || action.opcion>3) return state
    const respuestas = { ...state.respuestas, [ctx.peerId]: action.opcion }
    const withAnswer = { ...state, respuestas, version: state.version+1 }
    // si ya han respondido todos los jugadores conocidos, pasar a resultados sin esperar al timer
    const todos = Object.keys(withAnswer.puntuaciones)
    if (todos.length > 0 && todos.every(pid => respuestas[pid] !== undefined)) {
      return toResultados(withAnswer)
    }
    return withAnswer
  }
  if (action.t === 'tick') {
    if (!ctx.isHost) return state
    if (state.phase !== 'pregunta') return state
    const nt = state.timer -1
    if (nt <= 0) {
      // auto pasar a resultados, calcular puntos
      return toResultados(state)
    }
    return { ...state, timer: nt, version: state.version+1 }
  }
  if (action.t === 'nextQuestion') {
    if (!ctx.isHost) return state
    if (state.phase !== 'resultados') return state
    const ni = state.preguntaIdx +1
    if (ni >= QUESTIONS.length) {
      return { ...state, phase: 'final', version: state.version+1 }
    }
    return { ...state, phase: 'pregunta', preguntaIdx: ni, respuestas: {}, timer: 20, version: state.version+1 }
  }
  if (action.t === 'restart') {
    if (!ctx.isHost) return state
    return createInitialState(Object.keys(state.puntuaciones).map(id=>({id})))
  }
  return state
}
