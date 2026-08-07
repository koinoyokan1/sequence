/**
 * End-to-end integration tests for multiplayer synchronization
 * Simulates two players interacting with the same game
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGame } from '@/hooks/useGame'
import { useRealtime } from '@/hooks/useRealtime'
import { useGameStore } from '@/stores/gameStore'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase')
vi.mock('@/stores/gameStore')
vi.mock('@/stores/uiStore')

describe('Multiplayer Synchronization - Integration Tests', () => {
  let player1Store: any
  let player2Store: any
  let realtimeCallbacks: any = {}
  let databaseState: any = {
    game: null,
    decks: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    realtimeCallbacks = {}
    
    // Shared game state
    const sharedGame = {
      id: 'game-123',
      current_turn: 0,
      board_state: Array(10).fill(null).map(() => 
        Array(10).fill(null).map(() => ({ chip: null, isFreeSpace: false }))
      ),
      sequences: [],
      status: 'playing',
      sequences_required: 2,
    }

    const players = [
      { id: 'player-1', position: 0, team: 1, name: 'Player 1' },
      { id: 'player-2', position: 1, team: 2, name: 'Player 2' },
    ]

    databaseState.game = { ...sharedGame }
    databaseState.decks = {
      draw_pile: Array(50).fill(null).map((_, i) => ({ id: `card-${i}` })),
      discard_pile: [],
    }

    // Player 1 store
    player1Store = {
      gameId: 'game-123',
      playerId: 'player-1',
      game: { ...sharedGame },
      players,
      myHand: [{ id: 'card-1', rank: 'A', suit: 'hearts' }],
      boardState: sharedGame.board_state,
      sequences: [],
      selectedCard: { id: 'card-1', rank: 'A', suit: 'hearts' },
      isMyTurn: true,
      setGame: vi.fn((game) => { player1Store.game = game }),
      setBoardState: vi.fn((board) => { player1Store.boardState = board }),
      setSequences: vi.fn((seq) => { player1Store.sequences = seq }),
      setMyHand: vi.fn((hand) => { player1Store.myHand = hand }),
      setSelectedCard: vi.fn(),
      setHighlightedPositions: vi.fn(),
      setPlayers: vi.fn(),
      addChatMessage: vi.fn(),
    }

    // Player 2 store
    player2Store = {
      gameId: 'game-123',
      playerId: 'player-2',
      game: { ...sharedGame },
      players,
      myHand: [{ id: 'card-2', rank: 'K', suit: 'spades' }],
      boardState: sharedGame.board_state,
      sequences: [],
      selectedCard: null,
      isMyTurn: false,
      setGame: vi.fn((game) => { player2Store.game = game }),
      setBoardState: vi.fn((board) => { player2Store.boardState = board }),
      setSequences: vi.fn((seq) => { player2Store.sequences = seq }),
      setMyHand: vi.fn((hand) => { player2Store.myHand = hand }),
      setSelectedCard: vi.fn(),
      setHighlightedPositions: vi.fn(),
      setPlayers: vi.fn(),
      addChatMessage: vi.fn(),
    }

    // Mock Supabase RPC - updates shared database state
    vi.mocked(supabase.rpc).mockImplementation(async (name, params: any) => {
      if (name === 'play_card_optimized') {
        // Update database state
        databaseState.game.current_turn = params.p_next_turn
        databaseState.game.board_state = params.p_new_board_state
        databaseState.game.sequences = params.p_new_sequences
        databaseState.decks.draw_pile = params.p_new_draw_pile
        databaseState.decks.discard_pile = params.p_new_discard_pile

        // Simulate realtime firing to all clients
        setTimeout(() => {
          const callback = realtimeCallbacks['games_*']
          if (callback) {
            callback({
              new: { ...databaseState.game },
              eventType: 'UPDATE',
            })
          }
        }, 10)

        return { data: [{ success: true }], error: null }
      }
      return { data: null, error: null }
    })

    // Mock deck fetch
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { ...databaseState.decks },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: players,
            error: null,
          }),
        }),
      }),
    } as any)

    // Mock realtime channel
    const mockChannel = {
      on: vi.fn((event, config, callback) => {
        const key = `${config.table}_${config.event}`
        realtimeCallbacks[key] = callback
        return mockChannel
      }),
      subscribe: vi.fn((callback?: any) => {
        if (callback) setTimeout(() => callback('SUBSCRIBED'), 0)
        return mockChannel
      }),
    }

    vi.mocked(supabase).channel = vi.fn(() => mockChannel)
    vi.mocked(supabase).removeChannel = vi.fn()
  })

  it('should sync board state between two players', async () => {
    // Setup Player 1
    vi.mocked(useGameStore).mockImplementation((selector: any) => selector(player1Store))
    vi.mocked(useUIStore).mockImplementation((selector: any) => selector({ addToast: vi.fn(), setLoading: vi.fn() }))
    const { result: player1 } = renderHook(() => useGame())

    // Setup Player 2 realtime
    vi.mocked(useGameStore).mockImplementation((selector: any) => selector(player2Store))
    renderHook(() => useRealtime('game-123'))

    // Player 1 makes a move
    await act(async () => {
      await player1.current.playCard({ x: 0, y: 0 })
    })

    // Wait for realtime to propagate
    await waitFor(() => {
      expect(player2Store.setGame).toHaveBeenCalled()
    }, { timeout: 100 })

    // Verify both players see the same state
    const player1Turn = player1Store.game.current_turn
    const player2Turn = player2Store.game.current_turn

    expect(player1Turn).toBe(1)
    expect(player2Turn).toBe(1)
    expect(player1Turn).toBe(player2Turn)
  })
})
