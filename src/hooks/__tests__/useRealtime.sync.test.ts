/**
 * Tests for realtime synchronization between multiple clients
 * Validates that all players see consistent state
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRealtime } from '../useRealtime'
import { useGameStore } from '@/stores/gameStore'
import { supabase } from '@/lib/supabase'

// Mock Supabase
vi.mock('@/lib/supabase')
vi.mock('@/stores/gameStore')

describe('useRealtime - Multi-Client Synchronization', () => {
  let mockSetGame: ReturnType<typeof vi.fn>
  let mockSetBoardState: ReturnType<typeof vi.fn>
  let mockSetSequences: ReturnType<typeof vi.fn>
  let mockSetPlayers: ReturnType<typeof vi.fn>
  let mockAddChatMessage: ReturnType<typeof vi.fn>
  let realtimeCallbacks: any = {}

  beforeEach(() => {
    vi.clearAllMocks()

    mockSetGame = vi.fn()
    mockSetBoardState = vi.fn()
    mockSetSequences = vi.fn()
    mockSetPlayers = vi.fn()
    mockAddChatMessage = vi.fn()

    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        setGame: mockSetGame,
        setBoardState: mockSetBoardState,
        setSequences: mockSetSequences,
        setPlayers: mockSetPlayers,
        addChatMessage: mockAddChatMessage,
      }
      return selector(state)
    })

    // Mock Supabase realtime channel
    const mockChannel = {
      on: vi.fn((_event, config, callback) => {
        const key = `${config.table}_${config.event}`
        realtimeCallbacks[key] = callback
        return mockChannel
      }),
      subscribe: vi.fn((callback?: any) => {
        if (callback) {
          setTimeout(() => callback('SUBSCRIBED'), 0)
        }
        return mockChannel
      }),
    }

    vi.mocked(supabase).channel = vi.fn(() => mockChannel) as any
    vi.mocked(supabase).removeChannel = vi.fn()
    vi.mocked(supabase).from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    })
  })

  describe('Database Update Synchronization', () => {
    it('should apply all database updates regardless of turn number', () => {
      const gameId = 'test-game-123'
      renderHook(() => useRealtime(gameId))

      const updates = [
        { current_turn: 0, board_state: [], sequences: [] },
        { current_turn: 1, board_state: [], sequences: [] },
        { current_turn: 0, board_state: [], sequences: [] }, // Out of order
        { current_turn: 2, board_state: [], sequences: [] },
      ]

      // Simulate realtime updates coming in
      updates.forEach(update => {
        const callback = realtimeCallbacks['games_*']
        callback({ new: update, eventType: 'UPDATE' })
      })

      // All updates should be applied (no filtering)
      expect(mockSetGame).toHaveBeenCalledTimes(4)
      expect(mockSetBoardState).toHaveBeenCalledTimes(4)
      expect(mockSetSequences).toHaveBeenCalledTimes(4)
    })

    it('should handle INSERT events', () => {
      const gameId = 'test-game-123'
      renderHook(() => useRealtime(gameId))

      const newGame = {
        current_turn: 0,
        board_state: [],
        sequences: [],
      }

      const callback = realtimeCallbacks['games_*']
      callback({ new: newGame, eventType: 'INSERT' })

      expect(mockSetGame).toHaveBeenCalledWith(newGame)
      expect(mockSetBoardState).toHaveBeenCalledWith([])
      expect(mockSetSequences).toHaveBeenCalledWith([])
    })

    it('should handle DELETE events', () => {
      const gameId = 'test-game-123'
      renderHook(() => useRealtime(gameId))

      const deletedGame = {
        current_turn: 5,
        board_state: [],
        sequences: [],
      }

      const callback = realtimeCallbacks['games_*']
      callback({ new: deletedGame, eventType: 'DELETE' })

      // DELETE events should still update state
      expect(mockSetGame).toHaveBeenCalledWith(deletedGame)
    })
  })

  describe('Concurrent Player Updates', () => {
    it('should handle simultaneous updates from multiple players', async () => {
      const gameId = 'test-game-123'
      renderHook(() => useRealtime(gameId))

      const callback = realtimeCallbacks['games_*']

      // Simulate two players making moves at nearly the same time
      const player1Update = {
        current_turn: 1,
        board_state: [/* player 1 board */],
        sequences: [],
      }

      const player2Update = {
        current_turn: 2,
        board_state: [/* player 2 board */],
        sequences: [],
      }

      // Fire updates rapidly
      callback({ new: player1Update, eventType: 'UPDATE' })
      callback({ new: player2Update, eventType: 'UPDATE' })

      // Both should be applied
      expect(mockSetGame).toHaveBeenCalledTimes(2)
      expect(mockSetGame).toHaveBeenNthCalledWith(1, player1Update)
      expect(mockSetGame).toHaveBeenNthCalledWith(2, player2Update)
    })

    it('should handle updates arriving out of order', () => {
      const gameId = 'test-game-123'
      renderHook(() => useRealtime(gameId))

      const callback = realtimeCallbacks['games_*']

      // Updates arrive: turn 2, then turn 1, then turn 3
      const updates = [
        { current_turn: 2, board_state: [], sequences: [] },
        { current_turn: 1, board_state: [], sequences: [] },
        { current_turn: 3, board_state: [], sequences: [] },
      ]

      updates.forEach(update => {
        callback({ new: update, eventType: 'UPDATE' })
      })

      // All should be applied in the order received (database is source of truth)
      expect(mockSetGame).toHaveBeenCalledTimes(3)
      expect(mockSetGame).toHaveBeenNthCalledWith(1, updates[0])
      expect(mockSetGame).toHaveBeenNthCalledWith(2, updates[1])
      expect(mockSetGame).toHaveBeenNthCalledWith(3, updates[2])
    })
  })

  describe('Player List Synchronization', () => {
    it('should refetch players on any player change', async () => {
      const gameId = 'test-game-123'
      const mockPlayers = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
      ]

      vi.mocked(supabase).from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPlayers,
              error: null,
            }),
          }),
        }),
      })

      renderHook(() => useRealtime(gameId))

      const callback = realtimeCallbacks['players_*']
      
      await callback({ new: { id: 'p2' }, eventType: 'UPDATE' })

      // Should refetch and update players
      expect(mockSetPlayers).toHaveBeenCalledWith(mockPlayers)
    })
  })
})
