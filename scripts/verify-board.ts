/**
 * Verify that the board layout matches Sequence game rules:
 * - All cards from 2 decks appear exactly once, EXCEPT Jacks
 * - Jacks do NOT appear on the board
 * - 4 corner positions are free spaces (null)
 */

import boardLayoutData from '../src/lib/game-logic/boardLayout.json'

const boardLayout = boardLayoutData.layout

interface CardCount {
  card: string
  count: number
}

function verifyBoardLayout() {
  const cardCounts = new Map<string, number>()
  
  // Count all cards on the board
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const card = boardLayout[y][x]
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
  const errors: string[] = []
  const missing: string[] = []
  const extra: string[] = []
  
  for (const card of expectedCards) {
    const count = cardCounts.get(card) || 0
    if (count === 0) {
      missing.push(card)
    } else if (count !== 2) {
      errors.push(`${card}: appears ${count} times (expected 2)`)
    }
  }
  
  // Check for unexpected cards (like Jacks or typos)
  for (const [card, count] of cardCounts.entries()) {
    if (!expectedCards.has(card)) {
      extra.push(`${card}: appears ${count} times (should NOT be on board)`)
    }
  }
  
  // Count free spaces
  let freeSpaceCount = 0
  if (boardLayout[0][0] === null) freeSpaceCount++
  if (boardLayout[0][9] === null) freeSpaceCount++
  if (boardLayout[9][0] === null) freeSpaceCount++
  if (boardLayout[9][9] === null) freeSpaceCount++
  
  // Report results
  console.log('Board Layout Verification')
  console.log('=========================')
  console.log(`Free spaces (corners): ${freeSpaceCount}/4`)
  console.log(`Total cards on board: ${Array.from(cardCounts.values()).reduce((a, b) => a + b, 0)}`)
  console.log(`Expected: ${expectedCards.size * 2} (48 unique cards × 2 = 96 cards)`)
  console.log()
  
  if (errors.length === 0 && missing.length === 0 && extra.length === 0 && freeSpaceCount === 4) {
    console.log('✅ Board layout is VALID!')
    console.log('✅ All cards from 2 decks appear exactly twice')
    console.log('✅ No Jacks on the board')
    console.log('✅ 4 corner free spaces')
  } else {
    console.log('❌ Board layout has ERRORS:')
    if (freeSpaceCount !== 4) {
      console.log(`  - Expected 4 corner free spaces, found ${freeSpaceCount}`)
    }
    if (missing.length > 0) {
      console.log(`  - Missing cards (${missing.length}):`, missing.join(', '))
    }
    if (errors.length > 0) {
      console.log(`  - Incorrect counts (${errors.length}):`)
      errors.forEach(err => console.log(`    ${err}`))
    }
    if (extra.length > 0) {
      console.log(`  - Unexpected cards (${extra.length}):`)
      extra.forEach(err => console.log(`    ${err}`))
    }
  }
  
  // Show card count summary
  console.log('\nCard Count Summary:')
  const sortedCards = Array.from(cardCounts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  for (const [card, count] of sortedCards) {
    const status = count === 2 ? '✅' : '❌'
    console.log(`  ${status} ${card}: ${count}`)
  }
}

verifyBoardLayout()
