export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A'

export interface Card {
  suit: Suit
  rank: Rank
  id: string // unique identifier for each card instance
}

export type JackType = 'one-eyed' | 'two-eyed' | 'none'

export interface BoardCell {
  x: number
  y: number
  card: Card | null // null for corner free spaces
  chip: number | null // null = empty, 1 or 2 = team number
  isFreeSpace: boolean
}

export interface Position {
  x: number
  y: number
}

export interface Sequence {
  positions: Position[]
  team: number
  id: string
}

export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface Game {
  id: string
  invite_code: string
  status: GameStatus
  current_turn: number
  winner_team: number | null
  created_at: string
  started_at: string | null
  finished_at: string | null
  board_state: BoardCell[][]
  sequences: Sequence[]
  player_count: number
  sequences_required: number
}

export interface Player {
  id: string
  game_id: string
  user_id: string | null
  name: string
  team: number
  position: number
  is_ready: boolean
  is_host: boolean
  connected: boolean
  last_seen: string
}

export interface PlayerHand {
  id: string
  player_id: string
  game_id: string
  cards: Card[]
}

export type MoveType = 'place' | 'remove'

export interface GameMove {
  id: string
  game_id: string
  player_id: string
  move_number: number
  card_played: Card
  board_position: Position
  move_type: MoveType
  created_at: string
}

export interface GameDeck {
  id: string
  game_id: string
  draw_pile: Card[]
  discard_pile: Card[]
}

export interface PresenceData {
  player_id: string
  player_name: string
  team: number
  cursor_position: Position | null
  last_heartbeat: string
}

export interface PlayCardResult {
  success: boolean
  sequences: Sequence[]
  game_over: boolean
  winner_team?: number
  error?: string
}

export interface CreateGameResult {
  game_id: string
  invite_code: string
  player_id: string
}

export interface JoinGameResult {
  game_id: string
  player_id: string
}
