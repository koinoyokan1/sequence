import { BoardCell, Card, Position, MoveType } from '@/types/game'
import { getJackType, cardToString, isSameCard } from './cards'
import { findCardPositions, canPlaceChip, getCellChip, isFreeSpace } from './board'
import { canRemoveChip } from './sequence'
import type { Sequence } from '@/types/game'

export interface MoveValidation {
  valid: boolean
  reason?: string
  positions?: Position[]
  moveType?: MoveType
}

export function validateMove(
  board: BoardCell[][],
  card: Card,
  position: Position,
  currentTeam: number,
  sequences: Sequence[]
): MoveValidation {
  const { x, y } = position
  const jackType = getJackType(card)
  
  // Handle one-eyed jack (remove opponent's chip)
  if (jackType === 'one-eyed') {
    return validateOneEyedJack(board, position, currentTeam, sequences)
  }
  
  // Handle two-eyed jack (wild card)
  if (jackType === 'two-eyed') {
    return validateTwoEyedJack(board, position)
  }
  
  // Handle regular card
  return validateRegularCard(board, card, position)
}

function validateOneEyedJack(
  board: BoardCell[][],
  position: Position,
  currentTeam: number,
  sequences: Sequence[]
): MoveValidation {
  const { x, y } = position
  const chip = getCellChip(board, x, y)
  
  // Must remove an opponent's chip
  if (chip === null) {
    return {
      valid: false,
      reason: 'Must select an opponent\'s chip to remove',
    }
  }
  
  if (chip === currentTeam) {
    return {
      valid: false,
      reason: 'Cannot remove your own chip',
    }
  }
  
  // Cannot remove chips in completed sequences
  if (!canRemoveChip(board, x, y, sequences)) {
    return {
      valid: false,
      reason: 'Cannot remove chips that are part of a completed sequence',
    }
  }
  
  // Cannot remove from free spaces
  if (isFreeSpace(board, x, y)) {
    return {
      valid: false,
      reason: 'Cannot remove chips from free spaces',
    }
  }
  
  return {
    valid: true,
    positions: [position],
    moveType: 'remove',
  }
}

function validateTwoEyedJack(
  board: BoardCell[][],
  position: Position
): MoveValidation {
  const { x, y } = position
  
  // Can place on any empty space (except corners which are always free)
  if (!canPlaceChip(board, x, y)) {
    return {
      valid: false,
      reason: 'Position is already occupied',
    }
  }
  
  // Cannot place on corners (they're free spaces, not placeable)
  if (isFreeSpace(board, x, y)) {
    return {
      valid: false,
      reason: 'Cannot place chips on corner free spaces',
    }
  }
  
  return {
    valid: true,
    positions: [position],
    moveType: 'place',
  }
}

function validateRegularCard(
  board: BoardCell[][],
  card: Card,
  position: Position
): MoveValidation {
  const { x, y } = position
  
  // Find all positions where this card can be played
  const validPositions = findCardPositions(board, card)
  
  if (validPositions.length === 0) {
    return {
      valid: false,
      reason: 'This card has no valid positions on the board',
    }
  }
  
  // Check if the selected position matches one of the card positions
  const matchesCard = validPositions.some(pos => pos.x === x && pos.y === y)
  
  if (!matchesCard) {
    return {
      valid: false,
      reason: 'Selected position does not match the card',
    }
  }
  
  // Check if position is available
  if (!canPlaceChip(board, x, y)) {
    return {
      valid: false,
      reason: 'Position is already occupied',
    }
  }
  
  return {
    valid: true,
    positions: validPositions,
    moveType: 'place',
  }
}

export function isCardPlayable(
  board: BoardCell[][],
  card: Card,
  sequences: Sequence[]
): boolean {
  const jackType = getJackType(card)
  
  // One-eyed jack is playable if there are removable opponent chips
  if (jackType === 'one-eyed') {
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const chip = getCellChip(board, x, y)
        if (chip !== null && !isFreeSpace(board, x, y) && canRemoveChip(board, x, y, sequences)) {
          return true
        }
      }
    }
    return false
  }
  
  // Two-eyed jack is playable if there are any empty spaces
  if (jackType === 'two-eyed') {
    return board.some(row => row.some(cell => !cell.isFreeSpace && cell.chip === null))
  }
  
  // Regular card is playable if at least one of its positions is available
  const positions = findCardPositions(board, card)
  return positions.some(pos => canPlaceChip(board, pos.x, pos.y))
}

export function hasPlayableCard(
  hand: Card[],
  board: BoardCell[][],
  sequences: Sequence[]
): boolean {
  return hand.some(card => isCardPlayable(board, card, sequences))
}
