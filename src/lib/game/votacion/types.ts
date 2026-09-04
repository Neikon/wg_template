export interface VotacionState {
  phase: 'lobby' | 'votacion'
  votos: Record<string, number>
  participantes: string[]
  version: number
  gameId: 'votacion'
}

export type VotacionAction =
  | { t: 'startGame'; juegoId?: 'votacion' }
  | { t: 'votar'; opcion: number }
  | { t: 'restart' }
  | { t: 'playerJoined'; peerId: string }
