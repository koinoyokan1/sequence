import { Suit, Rank } from '@/types/game'
import boardLayoutData from './game-logic/boardLayout.json'

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
export const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export const BOARD_SIZE = boardLayoutData.size

export const CORNER_POSITIONS = boardLayoutData.freeSpaces

// Initial hand sizes based on player count
export const HAND_SIZES: Record<number, number> = {
  2: 7,
  3: 6,
  4: 6,
}

// Sequences required to win based on player count
export const SEQUENCES_TO_WIN: Record<number, number> = {
  2: 3,
  3: 3,
  4: 3,
}

// One-eyed jacks (can remove opponent's chip)
export const ONE_EYED_JACKS = [
  { suit: 'spades' as Suit, rank: 'J' as Rank },
  { suit: 'clubs' as Suit, rank: 'J' as Rank },
]

// Two-eyed jacks (wild cards)
export const TWO_EYED_JACKS = [
  { suit: 'hearts' as Suit, rank: 'J' as Rank },
  { suit: 'diamonds' as Suit, rank: 'J' as Rank },
]

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

export const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900 dark:text-white',
  spades: 'text-gray-900 dark:text-white',
}

// Standard Sequence board layout - loaded from JSON for easy customization
// To change the board, edit src/lib/game-logic/boardLayout.json
export const BOARD_LAYOUT: (string | null)[][] = boardLayoutData.layout as (string | null)[][]

// Mapping of card to board positions
export function getCardPositions(card: string): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (BOARD_LAYOUT[y][x] === card) {
        positions.push({ x, y })
      }
    }
  }
  
  return positions
}
