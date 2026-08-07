import { describe, it, expect } from 'vitest'
import boardLayoutData from '../boardLayout.json'

describe('Board Layout Validation', () => {
  it('should have exactly 4 corner free spaces', () => {
    const layout = boardLayoutData.layout
    const freeSpaces = boardLayoutData.freeSpaces
    
    expect(freeSpaces).toHaveLength(4)
    expect(layout[0][0]).toBeNull()
    expect(layout[0][9]).toBeNull()
    expect(layout[9][0]).toBeNull()
    expect(layout[9][9]).toBeNull()
  })
  
  it('should have all cards from 2 decks appearing exactly twice (except Jacks)', () => {
    const layout = boardLayoutData.layout
    const cardCounts = new Map<string, number>()
    
    // Count all cards on the board
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const card = layout[y][x]
        if (card !== null) {
          cardCounts.set(card, (cardCounts.get(card) || 0) + 1)
        }
      }
    }
    
    // Define all cards that should appear in 2 decks (excluding Jacks)
    const suits = ['♥', '♦', '♣', '♠']
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Q', 'K', 'A']
    
    const expectedCards = new Set<string>()
    for (const suit of suits) {
      for (const rank of ranks) {
        expectedCards.add(`${rank}${suit}`)
      }
    }
    
    // Verify each expected card appears exactly twice
    for (const card of expectedCards) {
      expect(cardCounts.get(card), `${card} should appear exactly twice`).toBe(2)
    }
    
    // Verify we have exactly 48 unique cards (13 ranks - J) × 4 suits = 48
    expect(expectedCards.size).toBe(48)
    
    // Verify total cards on board is 96 (excluding 4 corners)
    const totalCards = Array.from(cardCounts.values()).reduce((a, b) => a + b, 0)
    expect(totalCards).toBe(96)
  })
  
  it('should NOT have any Jacks on the board', () => {
    const layout = boardLayoutData.layout
    const suits = ['♥', '♦', '♣', '♠']
    
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const card = layout[y][x]
        if (card !== null) {
          for (const suit of suits) {
            expect(card).not.toBe(`J${suit}`)
          }
        }
      }
    }
  })
  
  it('should have no unexpected cards', () => {
    const layout = boardLayoutData.layout
    const cardCounts = new Map<string, number>()
    
    // Count all cards
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const card = layout[y][x]
        if (card !== null) {
          cardCounts.set(card, (cardCounts.get(card) || 0) + 1)
        }
      }
    }
    
    // Define valid cards
    const suits = ['♥', '♦', '♣', '♠']
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Q', 'K', 'A']
    const validCards = new Set<string>()
    
    for (const suit of suits) {
      for (const rank of ranks) {
        validCards.add(`${rank}${suit}`)
      }
    }
    
    // Check that all cards on the board are valid
    for (const card of cardCounts.keys()) {
      expect(validCards.has(card), `${card} is not a valid card`).toBe(true)
    }
  })
})
