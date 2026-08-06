import { BoardCell, Sequence, Position } from '@/types/game'
import { BOARD_SIZE } from '@/lib/constants'

const SEQUENCE_LENGTH = 5

// Direction vectors for checking sequences
const DIRECTIONS = [
  { dx: 1, dy: 0 },  // horizontal
  { dx: 0, dy: 1 },  // vertical
  { dx: 1, dy: 1 },  // diagonal down-right
  { dx: 1, dy: -1 }, // diagonal up-right
]

export function detectSequences(board: BoardCell[][]): Sequence[] {
  const allSequences: Sequence[] = []
  const checkedPositions = new Set<string>()

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = board[y][x]

      // Only check from positions with chips
      if (cell.chip === null && !cell.isFreeSpace) continue

      const team = cell.chip || 0 // Free spaces can be used by either team

      // Check all directions
      for (const direction of DIRECTIONS) {
        const sequence = checkSequenceFromPosition(board, x, y, direction.dx, direction.dy, team)

        if (sequence && sequence.positions.length >= SEQUENCE_LENGTH) {
          const sequenceId = generateSequenceId(sequence.positions)

          // Avoid duplicate sequences
          if (!checkedPositions.has(sequenceId)) {
            allSequences.push({
              ...sequence,
              id: sequenceId,
            })
            checkedPositions.add(sequenceId)
          }
        }
      }
    }
  }

  // Filter out sequences that overlap by more than 1 cell
  return filterValidSequences(allSequences)
}

function filterValidSequences(sequences: Sequence[]): Sequence[] {
  // Group by team
  const teamSequences: Record<number, Sequence[]> = {}

  sequences.forEach(seq => {
    if (!teamSequences[seq.team]) {
      teamSequences[seq.team] = []
    }
    teamSequences[seq.team].push(seq)
  })

  // For each team, select valid non-overlapping sequences
  const validSequences: Sequence[] = []

  Object.keys(teamSequences).forEach(teamStr => {
    const team = parseInt(teamStr)
    const teamSeqs = teamSequences[team]

    // Sort by when they were found (earlier sequences take priority)
    const selected: Sequence[] = []

    for (const seq of teamSeqs) {
      // Check if this sequence overlaps by more than 1 cell with any selected sequence
      const canAdd = selected.every(selectedSeq => {
        const overlapCount = countOverlap(seq, selectedSeq)
        return overlapCount <= 1
      })

      if (canAdd) {
        selected.push(seq)
      }
    }

    validSequences.push(...selected)
  })

  return validSequences
}

function countOverlap(seq1: Sequence, seq2: Sequence): number {
  let count = 0

  for (const pos1 of seq1.positions) {
    for (const pos2 of seq2.positions) {
      if (pos1.x === pos2.x && pos1.y === pos2.y) {
        count++
      }
    }
  }

  return count
}

function checkSequenceFromPosition(
  board: BoardCell[][],
  startX: number,
  startY: number,
  dx: number,
  dy: number,
  team: number
): Sequence | null {
  const positions: Position[] = []
  let x = startX
  let y = startY
  
  // Collect positions in this direction
  while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
    const cell = board[y][x]
    
    // Free spaces can be used by any team
    if (cell.isFreeSpace || cell.chip === team) {
      positions.push({ x, y })
    } else {
      break
    }
    
    x += dx
    y += dy
  }
  
  if (positions.length >= SEQUENCE_LENGTH) {
    return {
      positions: positions.slice(0, SEQUENCE_LENGTH),
      team,
      id: '',
    }
  }
  
  return null
}

function generateSequenceId(positions: Position[]): string {
  // Sort positions to ensure consistent ID regardless of detection order
  const sorted = [...positions].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y
    return a.x - b.x
  })
  
  return sorted.map(p => `${p.x},${p.y}`).join('-')
}

export function isPositionInSequence(sequences: Sequence[], x: number, y: number): boolean {
  return sequences.some(seq =>
    seq.positions.some(pos => pos.x === x && pos.y === y)
  )
}

export function getSequencesByTeam(sequences: Sequence[], team: number): Sequence[] {
  return sequences.filter(seq => seq.team === team)
}

export function hasWon(sequences: Sequence[], team: number, requiredSequences: number): boolean {
  const teamSequences = getSequencesByTeam(sequences, team)
  return teamSequences.length >= requiredSequences
}

export function canRemoveChip(
  board: BoardCell[][],
  x: number,
  y: number,
  sequences: Sequence[]
): boolean {
  // Cannot remove chips that are part of a completed sequence
  return !isPositionInSequence(sequences, x, y)
}
