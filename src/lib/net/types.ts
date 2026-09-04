export type PeerId = string
export interface Peer {
  id: PeerId
  name: string
  joinTime: number
}
export type Msg =
  | { t: 'hello'; peerId: string; name: string; joinTime: number }
  | { t: 'requestState'; from: string }
  | { t: 'stateSync'; fullState: any; version: number; hostId: string; peers: Peer[]; joinOrder: string[] }
  | { t: 'action'; action: any; from: string }
  | { t: 'rename'; peerId: string; newName: string }
  | { t: 'roomFull'; salaId: string }
  | { t: 'hostChanged'; newHostId: string }
