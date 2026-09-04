import { describe, expect, it } from 'vitest'
import { DEFAULT_GAME_ID, getGameModule, getGameOptions } from '../../src/lib/game/registry'

describe('game registry', () => {
  it('resuelve los juegos registrados y rechaza ids desconocidos', () => {
    expect(DEFAULT_GAME_ID).toBe('trivia')
    expect(getGameModule('trivia')?.id).toBe('trivia')
    expect(getGameModule('votacion')?.id).toBe('votacion')
    expect(getGameModule('desconocido')).toBeNull()
  })

  it('expone las opciones para el selector del lobby', () => {
    expect(getGameOptions()).toEqual([
      { id: 'trivia', nombre: 'Trivia' },
      { id: 'votacion', nombre: 'Votación' }
    ])
  })
})
