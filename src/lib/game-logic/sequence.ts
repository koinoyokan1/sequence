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
  const checkedRuns = new Set<string>()

  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = board[y][x]

      // Only check from positions with chips or free spaces
      if (cell.chip === null && !cell.isFreeSpace) continue

      // If it's a free space, check sequences for both teams
      const teamsToCheck = cell.isFreeSpace ? [1, 2] : [cell.chip!]

      for (const team of teamsToCheck) {
        // Check all directions
        for (const direction of DIRECTIONS) {
          const sequences = checkSequencesFromPosition(board, x, y, direction.dx, direction.dy, team, checkedRuns)
          allSequences.push(...sequences)
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

function checkSequencesFromPosition(
  board: BoardCell[][],
  startX: number,
  startY: number,
  dx: number,
  dy: number,
  team: number,
  checkedRuns: Set<string>
): Sequence[] {
  // First, go backwards to find the start of the run
  let backX = startX
  let backY = startY

  while (backX - dx >= 0 && backX - dx < BOARD_SIZE &&
         backY - dy >= 0 && backY - dy < BOARD_SIZE) {
    const cell = board[backY - dy][backX - dx]
    if (cell.isFreeSpace || cell.chip === team) {
      backX -= dx
      backY -= dy
    } else {
      break
    }
  }

  // Now collect all positions from the start
  const positions: Position[] = []
  let x = backX
  let y = backY

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

  // Check if we've already processed this run
  const runId = `${backX},${backY}-${dx},${dy}-${team}`
  if (checkedRuns.has(runId)) {
    return []
  }
  checkedRuns.add(runId)

  if (positions.length < SEQUENCE_LENGTH) {
    return []
  }

  const sequences: Sequence[] = []

  // For 9+ consecutive positions, create 2 sequences
  // First sequence: positions 0-4
  // Second sequence: positions 4-8 (sharing position 4)
  if (positions.length >= 9) {
    sequences.push({
      positions: positions.slice(0, SEQUENCE_LENGTH),
      team,
      id: generateSequenceId(positions.slice(0, SEQUENCE_LENGTH)),
    })
    sequences.push({
      positions: positions.slice(4, 9),
      team,
      id: generateSequenceId(positions.slice(4, 9)),
    })
  } else {
    // For 5-8 consecutive positions, create 1 sequence from the first 5
    sequences.push({
      positions: positions.slice(0, SEQUENCE_LENGTH),
      team,
      id: generateSequenceId(positions.slice(0, SEQUENCE_LENGTH)),
    })
  }

  return sequences
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
  _board: BoardCell[][],
  x: number,
  y: number,
  sequences: Sequence[]
): boolean {
  // Cannot remove chips that are part of a completed sequence
  return !isPositionInSequence(sequences, x, y)
}
