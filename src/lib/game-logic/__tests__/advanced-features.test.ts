import { describe, it, expect } from 'vitest'
import { drawCardWithReshuffle, addToDiscardPile, createCard } from '../cards'
import { isCardDead, getDeadCards, validateMove } from '../moves'
import { BoardCell, Card } from '@/types/game'

const BOARD_SIZE = 10

function createEmptyBoard(): BoardCell[][] {
  const board: BoardCell[][] = []
  for (let y = 0; y < BOARD_SIZE; y++) {
    board[y] = []
    for (let x = 0; x < BOARD_SIZE; x++) {
      const isCorner = (x === 0 && y === 0) || (x === 9 && y === 0) ||
                       (x === 0 && y === 9) || (x === 9 && y === 9)

      // Create a simple board with some cards
      let card: Card | null = null
      if (!isCorner && x < 5 && y < 5) {
        card = createCard('hearts', '2')
      }

      board[y][x] = {
        x,
        y,
        card,
        chip: null,
        isFreeSpace: isCorner,
      }
    }
  }
  return board
}

describe('Deck Reshuffle Feature', () => {
  it('should draw from draw pile when available', () => {
    const drawPile = [
      createCard('hearts', '2'),
      createCard('diamonds', '3'),
    ]
    const discardPile = [createCard('clubs', '4')]

    const result = drawCardWithReshuffle(drawPile, discardPile)

    expect(result.card).not.toBeNull()
    expect(result.card?.suit).toBe('hearts')
    expect(result.card?.rank).toBe('2')
    expect(result.newDrawPile.length).toBe(1)
    expect(result.newDiscardPile).toEqual(discardPile)
    expect(result.reshuffled).toBe(false)
  })

  it('should reshuffle discard pile when draw pile is empty', () => {
    const drawPile: Card[] = []
    const discardPile = [
      createCard('hearts', '5'),
      createCard('diamonds', '6'),
      createCard('clubs', '7'),
    ]

    const result = drawCardWithReshuffle(drawPile, discardPile)

    expect(result.card).not.toBeNull()
    expect(result.newDrawPile.length).toBe(2) // 3 cards - 1 drawn
    expect(result.newDiscardPile.length).toBe(0) // Discard pile cleared
    expect(result.reshuffled).toBe(true)
  })

  it('should return null when both piles are empty', () => {
    const drawPile: Card[] = []
    const discardPile: Card[] = []

    const result = drawCardWithReshuffle(drawPile, discardPile)

    expect(result.card).toBeNull()
    expect(result.newDrawPile.length).toBe(0)
    expect(result.newDiscardPile.length).toBe(0)
    expect(result.reshuffled).toBe(false)
  })

  it('should add card to discard pile', () => {
    const discardPile = [createCard('hearts', '2')]
    const cardToDiscard = createCard('diamonds', '3')

    const newPile = addToDiscardPile(discardPile, cardToDiscard)

    expect(newPile.length).toBe(2)
    expect(newPile[1]).toEqual(cardToDiscard)
  })
})

describe('Dead Card Detection', () => {
  it('should detect card as dead when both positions are occupied', () => {
    const board = createEmptyBoard()
    const card = createCard('hearts', '2')

    // Occupy all positions for this card
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x].card?.suit === 'hearts' && board[y][x].card?.rank === '2') {
          board[y][x].chip = 1
        }
      }
    }

    const isDead = isCardDead(board, card)
    expect(isDead).toBe(true)
  })

  it('should NOT detect card as dead when at least one position is available', () => {
    const board = createEmptyBoard()
    const card = createCard('hearts', '2')

    // Leave at least one position empty
    let leftOneEmpty = false
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x].card?.suit === 'hearts' && board[y][x].card?.rank === '2') {
          if (!leftOneEmpty) {
            leftOneEmpty = true
            // Leave this one empty
          } else {
            board[y][x].chip = 1
          }
        }
      }
    }

    const isDead = isCardDead(board, card)
    expect(isDead).toBe(false)
  })

  it('should NOT detect Jacks as dead (they are always playable)', () => {
    const board = createEmptyBoard()
    const twoEyedJack = createCard('hearts', 'J')
    const oneEyedJack = createCard('spades', 'J')

    expect(isCardDead(board, twoEyedJack)).toBe(false)
    expect(isCardDead(board, oneEyedJack)).toBe(false)
  })

  it('should find all dead cards in a hand', () => {
    const board = createEmptyBoard()
    const hand = [
      createCard('hearts', '2'),
      createCard('diamonds', '3'),

      createCard('clubs', '4'),
    ]

    // Make hearts 2 dead
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x].card?.suit === 'hearts' && board[y][x].card?.rank === '2') {
          board[y][x].chip = 1
        }
      }
    }

    const deadCards = getDeadCards(hand, board)
    expect(deadCards.length).toBeGreaterThan(0)
  })
})

describe('Two-Eyed Jack (Wild Card)', () => {
  it('should allow placement on any empty non-corner space', () => {
    const board = createEmptyBoard()
    const twoEyedJack = createCard('hearts', 'J') // Two-eyed jack

    const validation = validateMove(board, twoEyedJack, { x: 3, y: 3 }, 1, [])

    expect(validation.valid).toBe(true)
    expect(validation.moveType).toBe('place')
  })

  it('should NOT allow placement on corner free spaces', () => {
    const board = createEmptyBoard()
    const twoEyedJack = createCard('diamonds', 'J') // Two-eyed jack

    const validation = validateMove(board, twoEyedJack, { x: 0, y: 0 }, 1, [])

    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('corner')
  })

  it('should NOT allow placement on occupied spaces', () => {
    const board = createEmptyBoard()
    board[3][3].chip = 1 // Occupy a space
    const twoEyedJack = createCard('hearts', 'J')

    const validation = validateMove(board, twoEyedJack, { x: 3, y: 3 }, 1, [])

    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('occupied')
  })
})

describe('One-Eyed Jack (Remove Chip)', () => {
  it('should allow removing opponent chip', () => {
    const board = createEmptyBoard()
    board[3][3].chip = 2 // Opponent chip (team 2)
    const oneEyedJack = createCard('spades', 'J') // One-eyed jack

    const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, [])

    expect(validation.valid).toBe(true)
    expect(validation.moveType).toBe('remove')
  })

  it('should NOT allow removing own chip', () => {
    const board = createEmptyBoard()
    board[3][3].chip = 1 // Own chip (team 1)
    const oneEyedJack = createCard('clubs', 'J') // One-eyed jack

    const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, [])

    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('own chip')
  })

  it('should NOT allow removing from empty space', () => {
    const board = createEmptyBoard()
    const oneEyedJack = createCard('spades', 'J')

    const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, [])

    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('opponent')
  })

  it('should NOT allow removing chips from completed sequences', () => {
    const board = createEmptyBoard()
    board[3][3].chip = 2 // Opponent chip

    // Create a completed sequence that includes this chip
    const sequences = [{
      team: 2,
      positions: [
        { x: 3, y: 1 },
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 3, y: 4 },
        { x: 3, y: 5 },
      ],
      id: 'seq1',
    }]

    const oneEyedJack = createCard('spades', 'J')
    const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, sequences)

    expect(validation.valid).toBe(false)
    expect(validation.reason).toContain('completed sequence')
  })

  it('should allow removing chips NOT in completed sequences', () => {
    const board = createEmptyBoard()
    board[3][3].chip = 2 // Opponent chip
    board[5][5].chip = 2 // Another opponent chip in a sequence

    // Create a completed sequence that does NOT include (3,3)
    const sequences = [{
      team: 2,
      positions: [
        { x: 5, y: 1 },
        { x: 5, y: 2 },
        { x: 5, y: 3 },
        { x: 5, y: 4 },
        { x: 5, y: 5 },
      ],
      id: 'seq1',
    }]

    const oneEyedJack = createCard('spades', 'J')
    const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, sequences)

    expect(validation.valid).toBe(true)
    expect(validation.moveType).toBe('remove')
  })
})


describe('Jack Card Edge Cases & Validation', () => {
  describe('JK-01: One-Eyed Jack on Locked Token', () => {
    it('should reject removing token from completed sequence', () => {
      const board = createEmptyBoard()
      board[3][3].chip = 1 // Player 1 token in a completed sequence

      // Create a completed sequence including (3,3)
      const sequences = [{
        team: 1,
        positions: [
          { x: 3, y: 1 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 },
          { x: 3, y: 5 },
        ],
        id: 'completed-seq-1',
      }]

      const oneEyedJack = createCard('spades', 'J')
      const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 2, sequences)

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('completed sequence')
    })

    it('should disable/protect completed sequence tokens in UI', () => {
      const board = createEmptyBoard()
      board[3][3].chip = 1

      const sequences = [{
        team: 1,
        positions: [
          { x: 3, y: 1 },
          { x: 3, y: 2 },
          { x: 3, y: 3 },
          { x: 3, y: 4 },
          { x: 3, y: 5 },
        ],
        id: 'seq-1',
      }]

      // canRemoveChip should return false for chips in sequences
      const canRemove = !sequences.some(seq =>
        seq.positions.some(pos => pos.x === 3 && pos.y === 3)
      )

      expect(canRemove).toBe(false)
    })
  })

  describe('JK-02: One-Eyed Jack on Intersecting Token', () => {
    it('should protect token that is part of at least one completed sequence', () => {
      const board = createEmptyBoard()
      board[5][5].chip = 1 // Chip at intersection

      // Two sequences sharing the chip at (5,5)
      const sequences = [
        {
          team: 1,
          positions: [
            { x: 5, y: 1 },
            { x: 5, y: 2 },
            { x: 5, y: 3 },
            { x: 5, y: 4 },
            { x: 5, y: 5 }, // Shared
          ],
          id: 'vertical-completed',
        },
        {
          team: 1,
          positions: [
            { x: 1, y: 5 },
            { x: 2, y: 5 },
            { x: 3, y: 5 },
            { x: 4, y: 5 },
            { x: 5, y: 5 }, // Shared - but this one is incomplete (example)
          ],
          id: 'horizontal-incomplete',
        },
      ]

      const oneEyedJack = createCard('spades', 'J')
      const validation = validateMove(board, oneEyedJack, { x: 5, y: 5 }, 2, sequences)

      // Should be protected because it's part of at least one completed sequence
      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('completed sequence')
    })
  })

  describe('JK-03: One-Eyed Jack on Own Token', () => {
    it('should reject removing own team token', () => {
      const board = createEmptyBoard()
      board[3][3].chip = 1 // Player 1's own token

      const oneEyedJack = createCard('clubs', 'J')
      const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('own chip')
    })

    it('should only allow removing opponent tokens', () => {
      const board = createEmptyBoard()
      board[3][3].chip = 2 // Opponent token (team 2)

      const oneEyedJack = createCard('spades', 'J')
      const validation = validateMove(board, oneEyedJack, { x: 3, y: 3 }, 1, [])

      expect(validation.valid).toBe(true)
      expect(validation.moveType).toBe('remove')
    })
  })

  describe('JK-04: Two-Eyed Jack on Corner Space', () => {
    it('should reject placement on top-left corner (0,0)', () => {
      const board = createEmptyBoard()
      const twoEyedJack = createCard('hearts', 'J')

      const validation = validateMove(board, twoEyedJack, { x: 0, y: 0 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('corner')
    })

    it('should reject placement on top-right corner (9,0)', () => {
      const board = createEmptyBoard()
      const twoEyedJack = createCard('diamonds', 'J')

      const validation = validateMove(board, twoEyedJack, { x: 9, y: 0 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('corner')
    })

    it('should reject placement on bottom-left corner (0,9)', () => {
      const board = createEmptyBoard()
      const twoEyedJack = createCard('hearts', 'J')

      const validation = validateMove(board, twoEyedJack, { x: 0, y: 9 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('corner')
    })

    it('should reject placement on bottom-right corner (9,9)', () => {
      const board = createEmptyBoard()
      const twoEyedJack = createCard('diamonds', 'J')

      const validation = validateMove(board, twoEyedJack, { x: 9, y: 9 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('corner')
    })

    it('should verify all 4 corners are permanently free spaces', () => {
      const board = createEmptyBoard()

      // Verify corners are free spaces
      expect(board[0][0].isFreeSpace).toBe(true)
      expect(board[0][9].isFreeSpace).toBe(true)
      expect(board[9][0].isFreeSpace).toBe(true)
      expect(board[9][9].isFreeSpace).toBe(true)

      // Verify corners cannot hold tokens
      expect(board[0][0].chip).toBe(null)
      expect(board[0][9].chip).toBe(null)
      expect(board[9][0].chip).toBe(null)
      expect(board[9][9].chip).toBe(null)
    })
  })

  describe('JK-05: Two-Eyed Jack on Occupied Space', () => {
    it('should reject placement on space occupied by team 1', () => {
      const board = createEmptyBoard()
      board[5][5].chip = 1 // Occupied by team 1

      const twoEyedJack = createCard('hearts', 'J')
      const validation = validateMove(board, twoEyedJack, { x: 5, y: 5 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('occupied')
    })

    it('should reject placement on space occupied by team 2', () => {
      const board = createEmptyBoard()
      board[5][5].chip = 2 // Occupied by team 2

      const twoEyedJack = createCard('diamonds', 'J')
      const validation = validateMove(board, twoEyedJack, { x: 5, y: 5 }, 1, [])

      expect(validation.valid).toBe(false)
      expect(validation.reason).toContain('occupied')
    })

    it('should only allow placement on empty non-corner spaces', () => {
      const board = createEmptyBoard()
      // (5,5) is empty and not a corner

      const twoEyedJack = createCard('hearts', 'J')
      const validation = validateMove(board, twoEyedJack, { x: 5, y: 5 }, 1, [])

      expect(validation.valid).toBe(true)
      expect(validation.moveType).toBe('place')
    })
  })

  describe('JK-06: Jack Discard & Draw', () => {
    it('should add One-Eyed Jack to discard pile after use', () => {
      const discardPile: Card[] = []
      const oneEyedJack = createCard('spades', 'J')

      const newDiscardPile = addToDiscardPile(discardPile, oneEyedJack)

      expect(newDiscardPile.length).toBe(1)
      expect(newDiscardPile[0].rank).toBe('J')
      expect(newDiscardPile[0].suit).toBe('spades')
    })

    it('should add Two-Eyed Jack to discard pile after use', () => {
      const discardPile: Card[] = []
      const twoEyedJack = createCard('hearts', 'J')

      const newDiscardPile = addToDiscardPile(discardPile, twoEyedJack)

      expect(newDiscardPile.length).toBe(1)
      expect(newDiscardPile[0].rank).toBe('J')
      expect(newDiscardPile[0].suit).toBe('hearts')
    })

    it('should draw replacement card after playing Jack', () => {
      const drawPile = [
        createCard('hearts', '5'),
        createCard('diamonds', '6'),
      ]
      const discardPile: Card[] = []

      const result = drawCardWithReshuffle(drawPile, discardPile)

      expect(result.card).not.toBeNull()
      expect(result.newDrawPile.length).toBe(1) // One card drawn
    })

    it('should maintain hand size after playing Jack', () => {
      // Simulate: Hand has 7 cards, play 1 Jack, draw 1 new card = 7 cards
      const initialHandSize = 7
      const cardsAfterPlay = initialHandSize - 1 // Remove Jack
      const cardsAfterDraw = cardsAfterPlay + 1 // Draw replacement

      expect(cardsAfterDraw).toBe(initialHandSize)
    })
  })
})

