import { create } from 'zustand'
import type { Game, Player, Card, BoardCell, Sequence, Position } from '@/types/game'

interface GameState {
  // Game data
  gameId: string | null
  playerId: string | null
  game: Game | null
  players: Player[]
  myHand: Card[]
  boardState: BoardCell[][]
  sequences: Sequence[]
  
  // UI state
  selectedCard: Card | null
  highlightedPositions: Position[]
  isMyTurn: boolean
  
  // Actions
  setGameId: (id: string | null) => void
  setPlayerId: (id: string | null) => void
  setGame: (game: Game | null) => void
  setPlayers: (players: Player[]) => void
  setMyHand: (cards: Card[]) => void
  setBoardState: (board: BoardCell[][]) => void
  setSequences: (sequences: Sequence[]) => void
  setSelectedCard: (card: Card | null) => void
  setHighlightedPositions: (positions: Position[]) => void
  updateIsMyTurn: () => void
  reset: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  gameId: localStorage.getItem('sequence_game_id'),
  playerId: localStorage.getItem('sequence_player_id'),
  game: null,
  players: [],
  myHand: [],
  boardState: [],
  sequences: [],
  selectedCard: null,
  highlightedPositions: [],
  isMyTurn: false,
  
  // Actions
  setGameId: (id) => {
    set({ gameId: id })
    if (id) {
      localStorage.setItem('sequence_game_id', id)
    } else {
      localStorage.removeItem('sequence_game_id')
    }
  },
  setPlayerId: (id) => {
    set({ playerId: id })
    if (id) {
      localStorage.setItem('sequence_player_id', id)
    } else {
      localStorage.removeItem('sequence_player_id')
    }
  },
  setGame: (game) => {
    set({ game })
    get().updateIsMyTurn()
  },
  setPlayers: (players) => {
    set({ players })
    get().updateIsMyTurn()
  },
  setMyHand: (cards) => set({ myHand: cards }),
  setBoardState: (board) => set({ boardState: board }),
  setSequences: (sequences) => set({ sequences }),
  setSelectedCard: (card) => set({ selectedCard: card }),
  setHighlightedPositions: (positions) => set({ highlightedPositions: positions }),
  
  updateIsMyTurn: () => {
    const { game, playerId, players } = get()
    if (!game || !playerId || players.length === 0) {
      set({ isMyTurn: false })
      return
    }
    
    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) {
      set({ isMyTurn: false })
      return
    }
    
    set({ isMyTurn: game.current_turn === currentPlayer.position })
  },
  
  reset: () => set({
    gameId: null,
    playerId: null,
    game: null,
    players: [],
    myHand: [],
    boardState: [],
    sequences: [],
    selectedCard: null,
    highlightedPositions: [],
    isMyTurn: false,
  }),
}))
