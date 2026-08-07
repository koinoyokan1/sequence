import { Card, Suit, Rank, JackType } from '@/types/game'
import { SUITS, RANKS, SUIT_SYMBOLS } from '@/lib/constants'

let cardIdCounter = 0

function generateCardId(): string {
  return `card-${Date.now()}-${cardIdCounter++}`
}

export function createCard(suit: Suit, rank: Rank): Card {
  return {
    suit,
    rank,
    id: generateCardId(),
  }
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank))
    }
  }
  
  return deck
}

export function createTwoDecks(): Card[] {
  return [...createDeck(), ...createDeck()]
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

export function dealCards(deck: Card[], numPlayers: number, cardsPerPlayer: number): {
  hands: Card[][]
  remainingDeck: Card[]
} {
  const hands: Card[][] = Array.from({ length: numPlayers }, () => [])
  let deckIndex = 0
  
  // Deal cards round-robin
  for (let cardNum = 0; cardNum < cardsPerPlayer; cardNum++) {
    for (let player = 0; player < numPlayers; player++) {
      if (deckIndex < deck.length) {
        hands[player].push(deck[deckIndex++])
      }
    }
  }
  
  return {
    hands,
    remainingDeck: deck.slice(deckIndex),
  }
}

export function drawCard(deck: Card[]): { card: Card | null; remainingDeck: Card[] } {
  if (deck.length === 0) {
    return { card: null, remainingDeck: [] }
  }

  return {
    card: deck[0],
    remainingDeck: deck.slice(1),
  }
}

/**
 * Draw a card from the deck, reshuffling the discard pile if needed
 * @param drawPile - Current draw pile
 * @param discardPile - Current discard pile
 * @returns Object with drawn card, new draw pile, and new discard pile
 */
export function drawCardWithReshuffle(
  drawPile: Card[],
  discardPile: Card[]
): {
  card: Card | null
  newDrawPile: Card[]
  newDiscardPile: Card[]
  reshuffled: boolean
} {
  // If draw pile has cards, draw normally
  if (drawPile.length > 0) {
    const { card, remainingDeck } = drawCard(drawPile)
    return {
      card,
      newDrawPile: remainingDeck,
      newDiscardPile: discardPile,
      reshuffled: false,
    }
  }

  // If draw pile is empty but discard pile has cards, reshuffle
  if (discardPile.length > 0) {
    const shuffledDiscard = shuffleDeck(discardPile)
    const { card, remainingDeck } = drawCard(shuffledDiscard)
    return {
      card,
      newDrawPile: remainingDeck,
      newDiscardPile: [],
      reshuffled: true,
    }
  }

  // Both piles are empty - no cards available
  return {
    card: null,
    newDrawPile: [],
    newDiscardPile: [],
    reshuffled: false,
  }
}

/**
 * Add a card to the discard pile
 * @param discardPile - Current discard pile
 * @param card - Card to discard
 * @returns New discard pile
 */
export function addToDiscardPile(discardPile: Card[], card: Card): Card[] {
  return [...discardPile, card]
}

export function getJackType(card: Card): JackType {
  if (card.rank !== 'J') {
    return 'none'
  }
  
  // One-eyed jacks: ♠J and ♣J
  if (card.suit === 'spades' || card.suit === 'clubs') {
    return 'one-eyed'
  }
  
  // Two-eyed jacks: ♥J and ♦J
  return 'two-eyed'
}

export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`
}

export function isSameCard(card1: Card, card2: Card): boolean {
  return card1.suit === card2.suit && card1.rank === card2.rank
}

export function hasCard(hand: Card[], targetCard: Card): boolean {
  return hand.some(card => card.id === targetCard.id)
}

export function removeCardFromHand(hand: Card[], cardId: string): Card[] {
  return hand.filter(card => card.id !== cardId)
}
