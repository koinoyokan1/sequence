/**
 * Edge case and corner case tests for useGame
 * Tests network failures, concurrent moves, invalid states, etc.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGame } from '../useGame'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase')
vi.mock('@/stores/gameStore')
vi.mock('@/stores/uiStore')

describe('useGame - Edge Cases and Corner Cases', () => {
  const mockGameId = 'test-game-123'
  const mockPlayerId = 'player-1'
  
  const mockGame = {
    id: mockGameId,
    current_turn: 0,
    board_state: Array(10).fill(null).map(() => Array(10).fill({ chip: null, isFreeSpace: false })),
    sequences: [],
    status: 'playing',
    sequences_required: 2,
  }

  const mockPlayers = [
    { id: mockPlayerId, position: 0, team: 1, name: 'Player 1' },
  ]

  const mockCard = {
    id: 'card-1',
    rank: 'A',
    suit: 'hearts',
  }

  let mockAddToast: ReturnType<typeof vi.fn>
  let mockSetLoading: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockAddToast = vi.fn()
    mockSetLoading = vi.fn()

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
        addToast: mockAddToast,
        setLoading: mockSetLoading,
      }
      return selector(state)
    })
  })

  describe('Network Failures', () => {
    it('should handle deck fetch network error', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      } as any)

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 0, y: 0 })
      })

      expect(mockAddToast).toHaveBeenCalledWith('Failed to play card', 'error')
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })

    it('should handle RPC network timeout', async () => {
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

      vi.mocked(supabase.rpc).mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        ) as any
      )

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 0, y: 0 })
      })

      expect(mockAddToast).toHaveBeenCalledWith('Failed to play card', 'error')
    })

    it('should handle database connection loss during RPC', async () => {
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
        data: null,
        error: { message: 'Connection lost', code: 'PGRST301' },
      } as any)

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 0, y: 0 })
      })

      expect(mockAddToast).toHaveBeenCalledWith('Failed to play card', 'error')
    })
  })

  describe('Invalid Game States', () => {
    it('should prevent move when not player turn', async () => {
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
          isMyTurn: false,  // Override
          setGame: vi.fn(),
          setBoardState: vi.fn(),
          setSequences: vi.fn(),
          setMyHand: vi.fn(),
          setSelectedCard: vi.fn(),
          setHighlightedPositions: vi.fn(),
        }
        return selector(state)
      })

      const { result} = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 0, y: 0 })
      })

      expect(mockAddToast).toHaveBeenCalledWith('Cannot play card right now', 'error')
      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('should prevent move when no card selected', async () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: mockGame,
          players: mockPlayers,
          myHand: [mockCard],
          boardState: mockGame.board_state,
          sequences: [],
          selectedCard: null,  // Override
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

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 0, y: 0 })
      })

      expect(mockAddToast).toHaveBeenCalledWith('Cannot play card right now', 'error')
      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('should prevent move when game is null', async () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        const state = {
          gameId: mockGameId,
          playerId: mockPlayerId,
          game: null,  // Override
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

      const { result } = renderHook(() => useGame())

      await act(async () => {
        await result.current.playCard({ x: 0, y: 0 })
      })

      expect(mockAddToast).toHaveBeenCalledWith('Cannot play card right now', 'error')
    })
  })

  describe('Concurrent Move Attempts', () => {
    it('should handle double-click on same card', async () => {
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

      // Fire two moves simultaneously
      await act(async () => {
        await Promise.all([
          result.current.playCard({ x: 0, y: 0 }),
          result.current.playCard({ x: 0, y: 0 }),
        ])
      })

      // Should have made two RPC calls (no deduplication currently)
      expect(supabase.rpc).toHaveBeenCalledTimes(2)
    })
  })

  describe('Empty Deck Scenarios', () => {
    it('should handle empty draw pile gracefully', async () => {
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
        await result.current.playCard({ x: 0, y: 0 })
      })

      // Should complete without error even with no cards
      expect(mockSetLoading).toHaveBeenCalledWith(false)
    })
  })
})
