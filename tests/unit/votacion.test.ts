import { describe, expect, it } from 'vitest'
import { createInitialState, reducer } from '../../src/lib/game/votacion/engine'

describe('votacion engine', () => {
  const peers = [{ id: 'a' }, { id: 'b' }]

  it('crea la partida, permite votar e ignora el voto doble', () => {
    let state = createInitialState(peers)
    expect(state.phase).toBe('lobby')

    state = reducer(state, { t: 'startGame', juegoId: 'votacion' }, { isHost: true, peerId: 'a' })
    expect(state.phase).toBe('votacion')

    state = reducer(state, { t: 'votar', opcion: 1 }, { isHost: false, peerId: 'b' })
    expect(state.votos.b).toBe(1)
    const versionTrasVotar = state.version

    state = reducer(state, { t: 'votar', opcion: 2 }, { isHost: false, peerId: 'b' })
    expect(state.votos.b).toBe(1)
    expect(state.version).toBe(versionTrasVotar)
  })

  it('solo el host puede iniciar o reiniciar', () => {
    let state = createInitialState(peers)
    state = reducer(state, { t: 'startGame' }, { isHost: false, peerId: 'b' })
    expect(state.phase).toBe('lobby')

    state = reducer(state, { t: 'startGame' }, { isHost: true, peerId: 'a' })
    const startedVersion = state.version
    state = reducer(state, { t: 'restart' }, { isHost: false, peerId: 'b' })
    expect(state.version).toBe(startedVersion)

    state = reducer(state, { t: 'restart' }, { isHost: true, peerId: 'a' })
    expect(state.phase).toBe('lobby')
    expect(state.version).toBe(startedVersion + 1)
  })
})
