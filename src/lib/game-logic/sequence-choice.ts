import { BoardCell, Position } from '@/types/game'
import { BOARD_SIZE } from '@/lib/constants'

const SEQUENCE_LENGTH = 5

// Direction vectors
const DIRECTIONS = [
  { dx: 1, dy: 0, name: 'horizontal' },
  { dx: 0, dy: 1, name: 'vertical' },
  { dx: 1, dy: 1, name: 'diagonal-down' },
  { dx: 1, dy: -1, name: 'diagonal-up' },
]

/**
 * Detect if placing a chip creates an ambiguous sequence choice
 * Returns null if no ambiguity, or an object with the choice options
 */
export function detectAmbiguousSequence(
  board: BoardCell[][],
  x: number,
  y: number,
  team: number
): {
  direction: string
  option1: Position[]
  option2: Position[]
} | null {
  const cell = board[y][x]
  if (!cell.chip || cell.chip !== team) return null

  for (const direction of DIRECTIONS) {
    const run = getCompleteRun(board, x, y, direction.dx, direction.dy, team)
    
    // Only 6 chips creates ambiguity (2 valid windows: 0-4 and 1-5)
    if (run.length === 6) {
      const chipIndex = run.findIndex(pos => pos.x === x && pos.y === y)
      
      // If chip is in middle (positions 1-4), we have ambiguity
      if (chipIndex >= 1 && chipIndex <= 4) {
        return {
          direction: direction.name,
          option1: run.slice(0, SEQUENCE_LENGTH),
          option2: run.slice(1, 6),
        }
      }
    }
  }

  return null
}

function getCompleteRun(
  board: BoardCell[][],
  startX: number,
  startY: number,
  dx: number,
  dy: number,
  team: number
): Position[] {
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
  
  const positions: Position[] = []
  let x = backX
  let y = backY
  
  while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
    const cell = board[y][x]
    if (cell.isFreeSpace || cell.chip === team) {
      positions.push({ x, y })
    } else {
      break
    }
    x += dx
    y += dy
  }
  
  return positions
}
