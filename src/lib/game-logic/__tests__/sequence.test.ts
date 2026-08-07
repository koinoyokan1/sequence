import { describe, it, expect } from 'vitest'
import { detectSequences, hasWon } from '../sequence'
import { createInitialBoard } from '../board'
import type { BoardCell } from '@/types/game'

// Helper to create a board with chips at specific positions
function createBoardWithChips(chips: { x: number; y: number; team: number }[]): BoardCell[][] {
  const board = createInitialBoard()

  chips.forEach(({ x, y, team }) => {
    board[y][x].chip = team
  })

  return board
}

describe('Sequence Detection - Core Cases', () => {
  it('should detect a horizontal sequence of 5', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(1)
    expect(sequences[0].positions.length).toBe(5)
  })

  it('should detect a vertical sequence of 5', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 2 },
      { x: 1, y: 2, team: 2 },
      { x: 1, y: 3, team: 2 },
      { x: 1, y: 4, team: 2 },
      { x: 1, y: 5, team: 2 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(2)
  })

  it('should detect a diagonal sequence (down-right)', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 4, team: 1 },
      { x: 5, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(1)
  })

  it('should detect a diagonal sequence (up-right)', () => {
    const board = createBoardWithChips([
      { x: 1, y: 5, team: 2 },
      { x: 2, y: 4, team: 2 },
      { x: 3, y: 3, team: 2 },
      { x: 4, y: 2, team: 2 },
      { x: 5, y: 1, team: 2 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(2)
  })
})

describe('Sequence Detection - Edge Cases', () => {
  it('should NOT count 4 chips as a sequence', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(0)
  })

  it('should NOT count 6 chips in a row as 2 sequences', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      { x: 6, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    // Should only count as 1 sequence, not 2 overlapping ones
    expect(sequences.length).toBe(1)
  })

  it('should handle broken sequences (gap in middle)', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      // Gap at x: 3
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      { x: 6, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(0) // No valid 5-in-a-row
  })

  it('should handle opponent chip blocking sequence', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 2 }, // Opponent
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(0)
  })
})


describe('Sequence Detection - T and X Shapes', () => {
  it('should detect 2 sequences in a T-shape (sharing 1 cell)', () => {
    const board = createBoardWithChips([
      // Horizontal line
      { x: 1, y: 3, team: 1 },
      { x: 2, y: 3, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 3, team: 1 },
      { x: 5, y: 3, team: 1 },
      // Vertical line (shares x:3, y:3)
      { x: 3, y: 1, team: 1 },
      { x: 3, y: 2, team: 1 },
      // x:3, y:3 already placed
      { x: 3, y: 4, team: 1 },
      { x: 3, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2) // Both sequences valid
  })

  it('should detect 2 sequences in an X-shape (sharing 1 cell)', () => {
    const board = createBoardWithChips([
      // Diagonal 1 (down-right)
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 4, team: 1 },
      { x: 5, y: 5, team: 1 },
      // Diagonal 2 (up-right, shares x:3, y:3)
      { x: 1, y: 5, team: 1 },
      { x: 2, y: 4, team: 1 },
      // x:3, y:3 already placed
      { x: 4, y: 2, team: 1 },
      { x: 5, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2) // Both diagonal sequences valid
  })

  it('should allow L-shape sequences sharing only 1 cell', () => {
    const board = createBoardWithChips([
      // Horizontal bottom of L
      { x: 1, y: 5, team: 1 },
      { x: 2, y: 5, team: 1 },
      { x: 3, y: 5, team: 1 },
      { x: 4, y: 5, team: 1 },
      { x: 5, y: 5, team: 1 },
      // Vertical part of L (shares only x:5, y:5)
      { x: 5, y: 1, team: 1 },
      { x: 5, y: 2, team: 1 },
      { x: 5, y: 3, team: 1 },
      { x: 5, y: 4, team: 1 },
      // x:5, y:5 already placed
    ])

    const sequences = detectSequences(board)
    // Both sequences are valid (share only 1 cell)
    expect(sequences.length).toBe(2)
  })
})

describe('Win Condition', () => {
  it('should win with exactly 3 sequences', () => {
    const board = createBoardWithChips([
      // Seq 1
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      // Seq 2
      { x: 1, y: 3, team: 1 },
      { x: 2, y: 3, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 3, team: 1 },
      { x: 5, y: 3, team: 1 },
      // Seq 3
      { x: 7, y: 1, team: 1 },
      { x: 7, y: 2, team: 1 },
      { x: 7, y: 3, team: 1 },
      { x: 7, y: 4, team: 1 },
      { x: 7, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(hasWon(sequences, 1, 3)).toBe(true)
    expect(hasWon(sequences, 2, 3)).toBe(false)
  })

  it('should NOT win with only 2 sequences', () => {
    const board = createBoardWithChips([
      // Seq 1
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      // Seq 2
      { x: 1, y: 3, team: 1 },
      { x: 2, y: 3, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 3, team: 1 },
      { x: 5, y: 3, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(hasWon(sequences, 1, 3)).toBe(false)
  })
})

describe('Overlap Rule - Max 1 Common Cell', () => {
  it('should allow 2 sequences sharing exactly 1 cell', () => {
    const board = createBoardWithChips([
      // Horizontal
      { x: 1, y: 3, team: 1 },
      { x: 2, y: 3, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 3, team: 1 },
      { x: 5, y: 3, team: 1 },
      // Vertical (shares only x:3, y:3)
      { x: 3, y: 1, team: 1 },
      { x: 3, y: 2, team: 1 },
      { x: 3, y: 4, team: 1 },
      { x: 3, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2)
  })

  it('should reject 2 sequences sharing 2+ cells', () => {
    const board = createBoardWithChips([
      // Horizontal line: (1,1) to (5,1)
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      // Horizontal line: (3,1) to (7,1) - shares (3,1), (4,1), (5,1)
      { x: 6, y: 1, team: 1 },
      { x: 7, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    // Should only count the first sequence detected
    expect(sequences.length).toBe(1)
  })

  it('should handle 3 sequences with valid overlaps (max 1 each)', () => {
    const board = createBoardWithChips([
      // All three sequences meet at center (4, 4)
      // Horizontal through center
      { x: 2, y: 4, team: 1 },
      { x: 3, y: 4, team: 1 },
      { x: 4, y: 4, team: 1 },
      { x: 5, y: 4, team: 1 },
      { x: 6, y: 4, team: 1 },
      // Vertical through center
      { x: 4, y: 2, team: 1 },
      { x: 4, y: 3, team: 1 },
      // center at 4,4
      { x: 4, y: 5, team: 1 },
      { x: 4, y: 6, team: 1 },
      // Diagonal through center
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      // center at 4,4
      { x: 5, y: 5, team: 1 },
      { x: 6, y: 6, team: 1 },
    ])

    const sequences = detectSequences(board)
    // All share only 1 cell (4,4) - should all be valid
    expect(sequences.length).toBe(3)
  })
})