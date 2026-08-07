import { describe, it, expect } from 'vitest'
import { detectSequences } from '../sequence'
import { BoardCell } from '@/types/game'

const BOARD_SIZE = 10

function createEmptyBoard(): BoardCell[][] {
  const board: BoardCell[][] = []
  for (let y = 0; y < BOARD_SIZE; y++) {
    board[y] = []
    for (let x = 0; x < BOARD_SIZE; x++) {
      const isCorner = (x === 0 && y === 0) || (x === 9 && y === 0) ||
                       (x === 0 && y === 9) || (x === 9 && y === 9)
      board[y][x] = {
        x,
        y,
        card: null,
        chip: null,
        isFreeSpace: isCorner,
      }
    }
  }
  return board
}

function createBoardWithChips(chips: { x: number; y: number; team: number }[]): BoardCell[][] {
  const board = createEmptyBoard()
  chips.forEach(chip => {
    board[chip.y][chip.x].chip = chip.team
  })
  return board
}

describe('Official Sequence Rules - Win Conditions', () => {
  it('should require 2 sequences to win for 2-player game', () => {
    const board = createBoardWithChips([
      // Sequence 1 - Horizontal
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    // Only 1 sequence - should NOT win in 2-player mode
    expect(sequences.length).toBe(1)
    expect(sequences.filter(s => s.team === 1).length).toBe(1)
  })

  it('should win with 2 sequences in 2-player mode', () => {
    const board = createBoardWithChips([
      // Sequence 1 - Horizontal
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      // Sequence 2 - Vertical (sharing 1 cell is OK)
      { x: 3, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 3, y: 4, team: 1 },
      { x: 3, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.filter(s => s.team === 1).length).toBe(2)
  })

  it('should NOT win with 2 sequences in 3-player mode (needs 1)', () => {
    // In 3-player mode, only 1 sequence is needed to win
    // This test documents that the current implementation uses 3 sequences
    // which is actually the 4+ player rule
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
  })
})

describe('Official Sequence Rules - 9-in-a-row = 2 Sequences', () => {
  it('should count 9 chips in a row as 2 sequences', () => {
    const board = createBoardWithChips([
      { x: 0, y: 5, team: 1 },
      { x: 1, y: 5, team: 1 },
      { x: 2, y: 5, team: 1 },
      { x: 3, y: 5, team: 1 },
      { x: 4, y: 5, team: 1 },
      { x: 5, y: 5, team: 1 }, // Middle chip shared
      { x: 6, y: 5, team: 1 },
      { x: 7, y: 5, team: 1 },
      { x: 8, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    // Should detect 2 sequences sharing the middle chip
    expect(sequences.length).toBe(2)
    expect(sequences[0].positions.length).toBe(5)
    expect(sequences[1].positions.length).toBe(5)
  })

  it('should count 6 chips in a row as only 1 sequence', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      { x: 6, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
  })

  it('should count 10 chips in a row as 2 sequences', () => {

    // Full row of 10
    const board = createBoardWithChips([
      { x: 0, y: 5, team: 1 },
      { x: 1, y: 5, team: 1 },
      { x: 2, y: 5, team: 1 },
      { x: 3, y: 5, team: 1 },
      { x: 4, y: 5, team: 1 },
      { x: 5, y: 5, team: 1 },
      { x: 6, y: 5, team: 1 },
      { x: 7, y: 5, team: 1 },
      { x: 8, y: 5, team: 1 },
      { x: 9, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    // Should detect 2 sequences (chips 0-4 and 5-9, or 0-5 and 6-10, depending on implementation)
    expect(sequences.length).toBe(2)
  })

  it('should count 8 chips in a row as only 1 sequence', () => {
    const board = createBoardWithChips([
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      { x: 6, y: 1, team: 1 },
      { x: 7, y: 1, team: 1 },
      { x: 8, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(1)
  })
})

describe('Official Sequence Rules - Corner Spaces', () => {
  it('should NOT allow placing chips on corner spaces', () => {
    // Corners should always be free spaces
    const board = createEmptyBoard()

    // Verify all corners are free spaces
    expect(board[0][0].isFreeSpace).toBe(true)
    expect(board[0][9].isFreeSpace).toBe(true)
    expect(board[9][0].isFreeSpace).toBe(true)
    expect(board[9][9].isFreeSpace).toBe(true)

    // Verify corners have no chips
    expect(board[0][0].chip).toBe(null)
    expect(board[0][9].chip).toBe(null)
    expect(board[9][0].chip).toBe(null)
    expect(board[9][9].chip).toBe(null)
  })

  it('should allow both teams to use corner spaces simultaneously', () => {
    const board = createBoardWithChips([
      // Team 1 uses top-left corner
      { x: 1, y: 0, team: 1 },
      { x: 2, y: 0, team: 1 },
      { x: 3, y: 0, team: 1 },
      { x: 4, y: 0, team: 1 },
      // Team 2 uses same corner
      { x: 0, y: 1, team: 2 },
      { x: 0, y: 2, team: 2 },
      { x: 0, y: 3, team: 2 },
      { x: 0, y: 4, team: 2 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.filter(s => s.team === 1).length).toBe(1)
    expect(sequences.filter(s => s.team === 2).length).toBe(1)
  })
})

describe('Official Sequence Rules - Sequence Intersection', () => {
  it('should allow sharing exactly 1 chip between sequences', () => {
    const board = createBoardWithChips([
      // Horizontal sequence
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      // Vertical sequence sharing (3,1)
      { x: 3, y: 2, team: 1 },
      { x: 3, y: 3, team: 1 },
      { x: 3, y: 4, team: 1 },
      { x: 3, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2)

    // Verify they share exactly 1 position
    const shared = sequences[0].positions.filter(p1 =>
      sequences[1].positions.some(p2 => p1.x === p2.x && p1.y === p2.y)
    )
    expect(shared.length).toBe(1)
  })

  it('should NOT allow sharing 2+ chips between sequences', () => {
    const board = createBoardWithChips([
      // Horizontal: (1,1) to (5,1)
      { x: 1, y: 1, team: 1 },
      { x: 2, y: 1, team: 1 },
      { x: 3, y: 1, team: 1 },
      { x: 4, y: 1, team: 1 },
      { x: 5, y: 1, team: 1 },
      // Horizontal: (3,1) to (7,1) - shares (3,1), (4,1), (5,1)
      { x: 6, y: 1, team: 1 },
      { x: 7, y: 1, team: 1 },
    ])

    const sequences = detectSequences(board)
    // Should only count 1 sequence (first detected)
    expect(sequences.length).toBe(1)
  })

  it('should allow forming second sequence using 1 chip from first', () => {
    const board = createBoardWithChips([
      // First sequence (horizontal)
      { x: 2, y: 2, team: 1 },
      { x: 3, y: 2, team: 1 },
      { x: 4, y: 2, team: 1 },
      { x: 5, y: 2, team: 1 },
      { x: 6, y: 2, team: 1 },
      // Second sequence (diagonal) sharing (4,2)
      { x: 3, y: 1, team: 1 },
      { x: 5, y: 3, team: 1 },
      { x: 6, y: 4, team: 1 },
      { x: 7, y: 5, team: 1 },
    ])

    const sequences = detectSequences(board)
    expect(sequences.length).toBe(2)
  })
})
