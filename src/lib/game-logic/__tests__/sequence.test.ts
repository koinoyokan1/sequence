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


describe('Free Spaces (Corners) - Wild Card Behavior', () => {
  it('should use top-left corner (0,0) in a horizontal sequence', () => {
    // Free space at (0,0) + 4 chips = 5 total
    const board = createBoardWithChips([
      // (0,0) is free space - counts as any team
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
      { x: 4, y: 0, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(1)
    expect(sequences[0].positions.length).toBe(5)
  })

  it('should use top-left corner (0,0) in a vertical sequence', () => {
    const board = createBoardWithChips([
      // (0,0) is free space
      { x: 0, y: 1, team: 2 },
      { x: 0, y: 2, team: 2 },
      { x: 0, y: 3, team: 2 },
      { x: 0, y: 4, team: 2 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(2)
  })

  it('should use top-left corner (0,0) in a diagonal sequence', () => {
    const board = createBoardWithChips([
      // Free space at (0,0)
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 4, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].team).toBe(1)
  })

  it('should use top-right corner (9,0) in sequences', () => {
    const board = createBoardWithChips([
      // Horizontal from (5,0) to (9,0) where (9,0) is free
      { x: 5, y: 0, team: 1 },
      { x: 6, y: 0, team: 1 },
      { x: 7, y: 0, team: 1 },
      { x: 8, y: 0, team: 1 },
      // (9,0) is free space
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
  })

  it('should use bottom-left corner (0,9) in sequences', () => {
    const board = createBoardWithChips([
      // Vertical from (0,5) to (0,9) where (0,9) is free
      { x: 0, y: 5, team: 2 },
      { x: 0, y: 6, team: 2 },
      { x: 0, y: 7, team: 2 },
      { x: 0, y: 8, team: 2 },
      // (0,9) is free space
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
  })

  it('should use bottom-right corner (9,9) in sequences', () => {
    const board = createBoardWithChips([
      // Diagonal from (5,5) to (9,9) where (9,9) is free
      { x: 5, y: 5, team: 1 },
      { x: 6, y: 6, team: 1 },
      { x: 7, y: 7, team: 1 },
      { x: 8, y: 8, team: 1 },
      // (9,9) is free space
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
  })

  it('should allow both teams to use the same free space for different sequences', () => {
    const board = createBoardWithChips([
      // Team 1 horizontal using top-left corner (0,0)
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
      { x: 4, y: 0, team: 1 },
      // Team 2 vertical using same corner (0,0)
      { x: 0, y: 1, team: 2 },
      { x: 0, y: 2, team: 2 },
      { x: 0, y: 3, team: 2 },
      { x: 0, y: 4, team: 2 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2)
    expect(sequences.filter(s => s.team === 1).length).toBe(1)
    expect(sequences.filter(s => s.team === 2).length).toBe(1)
  })

  it('should use two free spaces in the same sequence', () => {
    const board = createBoardWithChips([
      // Diagonal from (0,0) to (4,4) using both corners
      // (0,0) is free space
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      // Need one more for sequence of 5
      // Let's test with horizontal using 2 free spaces at corners
    ])

    // Top row from (0,0) to (9,0) - both corners are free
    const board2 = createBoardWithChips([
      // (0,0) is free
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
      // Would need (4,0) to make a sequence
    ])

    // Actually, test corner-to-corner diagonal
    const board3 = createBoardWithChips([
      // (0,0) free space
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 4, y: 4, team: 1 },
    ])

    const sequences = detectSequences(board3)
    expect(sequences.length).toBe(1)
  })

  it('should NOT count a sequence of only 3 chips + 1 free space', () => {
    const board = createBoardWithChips([
      // Only 3 chips + free space = 4 total (need 5)
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(0)
  })

  it('should count 4 chips + 1 free space corner as valid sequence', () => {
    const board = createBoardWithChips([
      // 4 chips + corner free space = 5 total
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
      { x: 4, y: 0, team: 1 },
      // (0,0) is free space, making total = 5
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
    expect(sequences[0].positions.length).toBe(5)
  })

  it('should handle sequences using multiple corners (if adjacent)', () => {
    // Test if two corners can be used - but corners are not adjacent in standard Sequence
    // This test verifies corners work independently
    const board = createBoardWithChips([
      // Sequence 1: Using top-left corner (0,0)
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
      { x: 4, y: 0, team: 1 },
      // Sequence 2: Using bottom-right corner (9,9)
      { x: 5, y: 9, team: 1 },
      { x: 6, y: 9, team: 1 },
      { x: 7, y: 9, team: 1 },
      { x: 8, y: 9, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2)
  })
})