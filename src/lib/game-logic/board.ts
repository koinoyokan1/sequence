import { BoardCell, Card, Position } from '@/types/game'
import { BOARD_SIZE, BOARD_LAYOUT, CORNER_POSITIONS } from '@/lib/constants'
import { cardToString } from './cards'

export function createInitialBoard(): BoardCell[][] {
  const board: BoardCell[][] = []
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row: BoardCell[] = []
    
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cardString = BOARD_LAYOUT[y][x]
      const isFreeSpace = CORNER_POSITIONS.some(pos => pos.x === x && pos.y === y)
      
      row.push({
        x,
        y,
        card: cardString ? parseCardString(cardString) : null,
        chip: null,
        isFreeSpace,
      })
    }
    
    board.push(row)
  }
  
  return board
}

function parseCardString(cardStr: string): Card {
  // Parse strings like "6♦" or "10♣"
  const suitSymbols: Record<string, 'hearts' | 'diamonds' | 'clubs' | 'spades'> = {
    '♥': 'hearts',
    '♦': 'diamonds',
    '♣': 'clubs',
    '♠': 'spades',
  }
  
  const suit = suitSymbols[cardStr[cardStr.length - 1]]
  const rank = cardStr.slice(0, -1) as Card['rank']
  
  return {
    suit,
    rank,
    id: `board-${cardStr}`,
  }
}

export function isValidPosition(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE
}

export function isFreeSpace(board: BoardCell[][], x: number, y: number): boolean {
  if (!isValidPosition(x, y)) return false
  return board[y][x].isFreeSpace
}

export function getCellChip(board: BoardCell[][], x: number, y: number): number | null {
  if (!isValidPosition(x, y)) return null
  return board[y][x].chip
}

export function placeChip(board: BoardCell[][], x: number, y: number, team: number): BoardCell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  newBoard[y][x].chip = team
  return newBoard
}

export function removeChip(board: BoardCell[][], x: number, y: number): BoardCell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })))
  newBoard[y][x].chip = null
  return newBoard
}

export function findCardPositions(board: BoardCell[][], card: Card): Position[] {
  const positions: Position[] = []
  const cardStr = cardToString(card)
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = board[y][x]
      if (cell.card && cardToString(cell.card) === cardStr) {
        positions.push({ x, y })
      }
    }
  }
  
  return positions
}

export function findEmptyPositions(board: BoardCell[][]): Position[] {
  const positions: Position[] = []
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (board[y][x].chip === null) {
        positions.push({ x, y })
      }
    }
  }
  
  return positions
}

export function findOpponentChips(board: BoardCell[][], currentTeam: number): Position[] {
  const positions: Position[] = []
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const chip = board[y][x].chip
      if (chip !== null && chip !== currentTeam && !board[y][x].isFreeSpace) {
        positions.push({ x, y })
      }
    }
  }
  
  return positions
}

export function isPositionOccupied(board: BoardCell[][], x: number, y: number): boolean {
  if (!isValidPosition(x, y)) return true
  return board[y][x].chip !== null
}

export function canPlaceChip(board: BoardCell[][], x: number, y: number): boolean {
  if (!isValidPosition(x, y)) return false
  // Can place on free spaces or empty cells
  return board[y][x].isFreeSpace || !isPositionOccupied(board, x, y)
}
