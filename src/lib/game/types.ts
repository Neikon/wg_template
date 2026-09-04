export interface GameModule<S,A> {
  id: string
  createInitialState(peers: any[]): S
  reducer(state: S, action: A, ctx: { isHost: boolean; peerId: string }): S
  Component?: any
}
