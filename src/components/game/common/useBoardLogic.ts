import { useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'

/**
 * Common board logic - pure business logic for board state and highlighting
 * Used by both mobile and desktop board components
 */
export function useBoardLogic() {
  const boardState = useGameStore(state => state.boardState)
  const highlightedPositions = useGameStore(state => state.highlightedPositions)
  const sequences = useGameStore(state => state.sequences)
  const isMyTurn = useGameStore(state => state.isMyTurn)

  const isHighlighted = useCallback((x: number, y: number) => {
    return highlightedPositions.some(pos => pos.x === x && pos.y === y)
  }, [highlightedPositions])

  const isInSequence = useCallback((x: number, y: number) => {
    return sequences.some(seq =>
      seq.positions.some(pos => pos.x === x && pos.y === y)
    )
  }, [sequences])

  const getCellAt = useCallback((x: number, y: number) => {
    if (y < 0 || y >= boardState.length || x < 0 || x >= boardState[0]?.length) {
      return null
    }
    return boardState[y][x]
  }, [boardState])

  return {
    boardState,
    isHighlighted,
    isInSequence,
    getCellAt,
    isMyTurn,
  }
}
