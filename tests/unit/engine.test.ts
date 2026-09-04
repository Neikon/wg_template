import { describe, it, expect } from 'vitest'
import { createInitialState, reducer } from '../../src/lib/game/trivia/engine'

describe('trivia engine', () => {
  const peers = [{id:'a',name:'p1',joinTime:1},{id:'b',name:'p2',joinTime:2}]
  it('startGame moves to pregunta', () => {
    let s = createInitialState(peers)
    expect(s.phase).toBe('lobby')
    s = reducer(s,{t:'startGame'} as any,{isHost:true,peerId:'a'})
    expect(s.phase).toBe('pregunta')
    expect(s.preguntaIdx).toBe(0)
    expect(s.timer).toBe(20)
  })
  it('non-host cannot start', () => {
    let s = createInitialState(peers)
    s = reducer(s,{t:'startGame'} as any,{isHost:false,peerId:'b'})
    expect(s.phase).toBe('lobby')
  })
  it('answer records', () => {
    let s = createInitialState(peers)
    s = reducer(s,{t:'startGame'} as any,{isHost:true,peerId:'a'})
    s = reducer(s,{t:'answer', opcion:2} as any,{isHost:true,peerId:'b'})
    expect(s.respuestas['b']).toBe(2)
  })
  it('prevents double answer', () => {
    let s = createInitialState(peers)
    s = reducer(s,{t:'startGame'} as any,{isHost:true,peerId:'a'})
    s = reducer(s,{t:'answer', opcion:1} as any,{isHost:false,peerId:'b'})
    const v = s.version
    s = reducer(s,{t:'answer', opcion:2} as any,{isHost:false,peerId:'b'})
    expect(s.respuestas['b']).toBe(1)
    expect(s.version).toBe(v)
  })
  it('tick counts down and moves to resultados when zero', () => {
    let s = createInitialState(peers)
    s = reducer(s,{t:'startGame'} as any,{isHost:true,peerId:'a'})
    // answer correct for b (pregunta 0 correcta=1)
    s = reducer(s,{t:'answer', opcion:1} as any,{isHost:false,peerId:'b'})
    s = reducer(s,{t:'answer', opcion:0} as any,{isHost:false,peerId:'a'})
    // 20 ticks
    for(let i=0;i<20;i++) s = reducer(s,{t:'tick'} as any,{isHost:true,peerId:'a'})
    expect(s.phase).toBe('resultados')
    expect(s.puntuaciones['b']).toBe(100)
    expect(s.puntuaciones['a']).toBe(0)
  })
  it('nextQuestion advances or finishes', () => {
    let s = createInitialState(peers)
    s = reducer(s,{t:'startGame'} as any,{isHost:true,peerId:'a'})
    for(let i=0;i<20;i++) s = reducer(s,{t:'tick'} as any,{isHost:true,peerId:'a'})
    expect(s.phase).toBe('resultados')
    s = reducer(s,{t:'nextQuestion'} as any,{isHost:true,peerId:'a'})
    expect(s.phase).toBe('pregunta')
    expect(s.preguntaIdx).toBe(1)
  })
})

