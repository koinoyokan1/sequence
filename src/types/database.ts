import type { Game, Player, PlayerHand, GameMove, GameDeck } from './game'

export interface Database {
  public: {
    Tables: {
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at'>
        Update: Partial<Omit<Game, 'id' | 'created_at'>>
      }
      players: {
        Row: Player
        Insert: Omit<Player, 'id' | 'last_seen'>
        Update: Partial<Omit<Player, 'id'>>
      }
      player_hands: {
        Row: PlayerHand
        Insert: Omit<PlayerHand, 'id'>
        Update: Partial<Omit<PlayerHand, 'id'>>
      }
      game_moves: {
        Row: GameMove
        Insert: Omit<GameMove, 'id' | 'created_at'>
        Update: Partial<Omit<GameMove, 'id' | 'created_at'>>
      }
      game_decks: {
        Row: GameDeck
        Insert: Omit<GameDeck, 'id'>
        Update: Partial<Omit<GameDeck, 'id'>>
      }
    }
    Functions: {
      create_game: {
        Args: {
          player_name: string
          team: number
        }
        Returns: {
          game_id: string
          invite_code: string
          player_id: string
        }
      }
      join_game: {
        Args: {
          invite_code: string
          player_name: string
          team: number
        }
        Returns: {
          game_id: string
          player_id: string
        }
      }
      start_game: {
        Args: {
          game_id: string
          player_id: string
        }
        Returns: {
          success: boolean
        }
      }
      play_card: {
        Args: {
          game_id: string
          player_id: string
          card: any
          position: any
        }
        Returns: {
          success: boolean
          sequences: any[]
          game_over: boolean
          winner_team?: number
        }
      }
      ready_player: {
        Args: {
          game_id: string
          player_id: string
          ready: boolean
        }
        Returns: {
          success: boolean
        }
      }
    }
  }
}
