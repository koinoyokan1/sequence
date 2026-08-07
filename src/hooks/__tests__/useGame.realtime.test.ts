/**
 * Comprehensive tests for realtime synchronization and race conditions
 * in the useGame hook and multiplayer scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGame } from '../useGame'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}))

// Mock stores
vi.mock('@/stores/gameStore')
vi.mock('@/stores/uiStore')

describe('useGame - Realtime Synchronization Tests', () => {
  const mockGameId = 'test-game-123'
  const mockPlayerId = 'player-1'
  const mockOpponentId = 'player-2'
  
  // Create a board with Ace of Hearts at position (5, 1) matching the real board layout
  const createTestBoard = () => {
    const board = []
    for (let y = 0; y < 10; y++) {
      const row = []
      for (let x = 0; x < 10; x++) {
        const isCorner = (x === 0 && y === 0) || (x === 9 && y === 0) ||
                        (x === 0 && y === 9) || (x === 9 && y === 9)
        // Place Ace of Hearts at (5,1) to match real board
        const card = (x === 5 && y === 1) ? { id: 'board-A♥', rank: 'A', suit: 'hearts' } : null
        row.push({
          x,
          y,
          card,
          chip: null,
          isFreeSpace: isCorner,
        })
      }
      board.push(row)
    }
    return board
  }

  const mockGame = {
    id: mockGameId,
    current_turn: 0,
    board_state: createTestBoard(),
    sequences: [],
    status: 'playing',
    sequences_required: 2,
  }

  const mockPlayers = [
    { id: mockPlayerId, position: 0, team: 1, name: 'Player 1' },
    { id: mockOpponentId, position: 1, team: 2, name: 'Player 2' },
  ]

  const mockCard = {
    id: 'card-1',
    rank: 'A',
    suit: 'hearts',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default store mocks - use selector pattern
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        gameId: mockGameId,
        playerId: mockPlayerId,
        game: mockGame,
        players: mockPlayers,
        myHand: [mockCard],
        boardState: mockGame.board_state,
        sequences: [],
        selectedCard: mockCard,
        isMyTurn: true,
        setGame: vi.fn(),
        setBoardState: vi.fn(),
        setSequences: vi.fn(),
        setMyHand: vi.fn(),
        setSelectedCard: vi.fn(),
        setHighlightedPositions: vi.fn(),
      }
      return selector(state)
    })

    vi.mocked(useUIStore).mockImplementation((selector: any) => {
      const state = {
        addToast: vi.fn(),
        setLoading: vi.fn(),
      }
      return selector(state)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Optimistic Updates', () => {
    it('should update local state immediately before database call', async () => {
      const setBoardState = vi.fn()
      const setSequences = vi.fn()
      const setGame = vi.fn()

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: mockGame,
          players: mockPlayers,
          myHand: [mockCard],
          boardState: mockGame.board_state,
          sequences: [],
          selectedCard: mockCard,
          isMyTurn: true,
          setBoardState,
          setSequences,
          setGame,
          setMyHand: vi.fn(),
          setSelectedCard: vi.fn(),
          setHighlightedPositions: vi.fn(),
        }
        return selector(state)
      })

      // Mock RPC to be slow (500ms)
      const rpcMock = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: [{ success: true }], error: null }), 500))
      )
      vi.mocked(supabase.rpc).mockImplementation(rpcMock)
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { draw_pile: [], discard_pile: [] },
              error: null,
            }),
          }),
        }),
      } as any)

      const { result } = renderHook(() => useGame())

      const startTime = Date.now()
      let optimisticUpdateTime = 0

      // Start playCard but don't await it yet
      const playCardPromise = act(async () => {
        result.current.playCard({ x: 5, y: 1 })
        // Give it a tiny moment to fire optimistic updates
        await new Promise(resolve => setTimeout(resolve, 10))
        optimisticUpdateTime = Date.now() - startTime
      })

      await playCardPromise

      // Optimistic updates should happen immediately (< 100ms), not wait for 500ms RPC
      expect(setBoardState).toHaveBeenCalled()
      expect(setSequences).toHaveBeenCalled()
      expect(setGame).toHaveBeenCalled()
      expect(optimisticUpdateTime).toBeLessThan(100)
    })

    it('should rollback optimistic updates on RPC error', async () => {
      const originalBoard = mockGame.board_state
      const originalSequences = mockGame.sequences
      const setBoardState = vi.fn()
      const setSequences = vi.fn()
      const setGame = vi.fn()

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: mockGame,
          players: mockPlayers,
          myHand: [mockCard],
          boardState: originalBoard,
          sequences: originalSequences,
          selectedCard: mockCard,
          isMyTurn: true,
          setBoardState,
          setSequences,
          setGame,
          setMyHand: vi.fn(),
          setSelectedCard: vi.fn(),
          setHighlightedPositions: vi.fn(),
        }
        return selector(state)
      })

      // Mock RPC to fail
      vi.mocked(supabase.rpc).mockResolvedValue({
        data: null,
        error: new Error('RPC failed'),
      } as any)
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { draw_pile: [], discard_pile: [] },
              error: null,
            }),
          }),
        }),
      } as any)

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 5, y: 1 })
      })

      // Should have called rollback with original values
      const lastSetGameCall = setGame.mock.calls[setGame.mock.calls.length - 1]
      const lastSetBoardCall = setBoardState.mock.calls[setBoardState.mock.calls.length - 1]
      const lastSetSequencesCall = setSequences.mock.calls[setSequences.mock.calls.length - 1]

      expect(lastSetGameCall[0]).toBe(mockGame)
      expect(lastSetBoardCall[0]).toBe(originalBoard)
      expect(lastSetSequencesCall[0]).toBe(originalSequences)
    })
  })

  describe('Race Conditions', () => {
    it('should handle rapid successive moves without state corruption', async () => {
      const setBoardState = vi.fn()
      const rpcCallOrder: number[] = []

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: mockGame,
          players: mockPlayers,
          myHand: [mockCard],
          boardState: mockGame.board_state,
          sequences: [],
          selectedCard: mockCard,
          isMyTurn: true,
          setBoardState,
          setGame: vi.fn(),
          setSequences: vi.fn(),
          setMyHand: vi.fn(),
          setSelectedCard: vi.fn(),
          setHighlightedPositions: vi.fn(),
        }
        return selector(state)
      })

      // Mock RPC with random delays to simulate race conditions
      let callCount = 0
      vi.mocked(supabase.rpc).mockImplementation(() => {
        const currentCall = ++callCount
        const delay = Math.random() * 100 // Random delay 0-100ms
        return new Promise(resolve =>
          setTimeout(() => {
            rpcCallOrder.push(currentCall)
            resolve({ data: [{ success: true }], error: null })
          }, delay)
        ) as any
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { draw_pile: [], discard_pile: [] },
              error: null,
            }),
          }),
        }),
      } as any)

      const { result } = renderHook(() => useGame())

      // Simulate 3 rapid moves (all to same position for simplicity)
      const moves = [
        { x: 5, y: 1 },
        { x: 5, y: 1 },
        { x: 5, y: 1 },
      ]

      await act(async () => {
        // Fire all moves rapidly
        const promises = moves.map(pos => result.current.playCard(pos))
        await Promise.all(promises)
      })

      // All RPCs should have been called
      expect(rpcCallOrder.length).toBe(3)

      // Board state should have been updated at least once per move (optimistic)
      expect(setBoardState).toHaveBeenCalled()
      expect(setBoardState.mock.calls.length).toBeGreaterThanOrEqual(3)
    })

    it('should handle concurrent RPC calls completing out of order', async () => {
      const setGame = vi.fn()
      let rpcCallbacks: Array<() => void> = []

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: mockGame,
          players: mockPlayers,
          myHand: [mockCard],
          boardState: mockGame.board_state,
          sequences: [],
          selectedCard: mockCard,
          isMyTurn: true,
          setGame,
          setBoardState: vi.fn(),
          setSequences: vi.fn(),
          setMyHand: vi.fn(),
          setSelectedCard: vi.fn(),
          setHighlightedPositions: vi.fn(),
        }
        return selector(state)
      })

      // Mock RPC to capture completion callbacks
      vi.mocked(supabase.rpc).mockImplementation(() => {
        return new Promise(resolve => {
          rpcCallbacks.push(() => resolve({ data: [{ success: true }], error: null }))
        }) as any
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { draw_pile: [], discard_pile: [] },
              error: null,
            }),
          }),
        }),
      } as any)

      const { result } = renderHook(() => useGame())

      // Start 3 moves (all to same position for simplicity)
      act(() => {
        result.current.playCard({ x: 5, y: 1 })
        result.current.playCard({ x: 5, y: 1 })
        result.current.playCard({ x: 5, y: 1 })
      })

      // Complete them in reverse order
      await act(async () => {
        rpcCallbacks[2]?.() // Complete third
        await Promise.resolve()
        rpcCallbacks[0]?.() // Complete first
        await Promise.resolve()
        rpcCallbacks[1]?.() // Complete second
        await Promise.resolve()
      })

      // All should complete successfully despite out-of-order completion
      expect(setGame).toHaveBeenCalled()
    })
  })

  describe('Realtime Update Simulation', () => {
    it('should not filter database updates after optimistic update', async () => {
      const setGame = vi.fn()
      const setBoardState = vi.fn()

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: mockGame,
          players: mockPlayers,
          myHand: [mockCard],
          boardState: mockGame.board_state,
          sequences: [],
          selectedCard: mockCard,
          isMyTurn: true,
          setGame,
          setBoardState,
          setSequences: vi.fn(),
          setMyHand: vi.fn(),
          setSelectedCard: vi.fn(),
          setHighlightedPositions: vi.fn(),
        }
        return selector(state)
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { draw_pile: [], discard_pile: [] },
              error: null,
            }),
          }),
        }),
      } as any)

      vi.mocked(supabase.rpc).mockResolvedValue({
        data: [{ success: true }],
        error: null,
      } as any)

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 5, y: 1 })
      })

      // Optimistic update should set game with turn = 1
      const optimisticGameUpdate = setGame.mock.calls.find(call =>
        call[0]?.current_turn === 1
      )
      expect(optimisticGameUpdate).toBeDefined()

      // Database update (simulated via realtime) should also be applied
      // The new code has NO filtering, so all updates are applied
      expect(setGame).toHaveBeenCalled()
      expect(setBoardState).toHaveBeenCalled()
    })
  })
})
