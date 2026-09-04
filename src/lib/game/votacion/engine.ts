import type { VotacionAction, VotacionState } from './types'

export const OPCIONES = ['Pizza', 'Tacos', 'Sushi'] as const

export function createInitialState(peers: { id: string }[]): VotacionState {
  return {
    phase: 'lobby',
    votos: {},
    participantes: peers.map(peer => peer.id),
    version: 0,
    gameId: 'votacion'
  }
}

export function reducer(
  state: VotacionState,
  action: VotacionAction,
  ctx: { isHost: boolean; peerId: string }
): VotacionState {
  if (action.t === 'startGame') {
    if (!ctx.isHost || state.phase !== 'lobby') return state
    return { ...state, phase: 'votacion', votos: {}, version: state.version + 1 }
  }

  if (action.t === 'votar') {
    if (state.phase !== 'votacion') return state
    if (!Number.isInteger(action.opcion) || action.opcion < 0 || action.opcion >= OPCIONES.length) return state
    if (state.votos[ctx.peerId] !== undefined) return state
    return {
      ...state,
      votos: { ...state.votos, [ctx.peerId]: action.opcion },
      version: state.version + 1
    }
  }

  if (action.t === 'restart') {
    if (!ctx.isHost) return state
    return { ...createInitialState(state.participantes.map(id => ({ id }))), version: state.version + 1 }
  }

  if (action.t === 'playerJoined') {
    if (!ctx.isHost || state.participantes.includes(action.peerId)) return state
    return { ...state, participantes: [...state.participantes, action.peerId], version: state.version + 1 }
  }

  return state
}
