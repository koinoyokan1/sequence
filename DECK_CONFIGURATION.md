# Deck Configuration

## ✅ Current Setup: 2 Decks (104 cards)

The game is **already configured to use 2 standard decks** of cards.

---

## Deck Composition

### Total Cards: **104 cards**
- Deck 1: 52 cards (4 suits × 13 ranks)
- Deck 2: 52 cards (4 suits × 13 ranks)

### Standard Ranks (13 per suit):
2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A

### Standard Suits (4):
- ♥ Hearts (Red)
- ♦ Diamonds (Red)
- ♣ Clubs (Black)
- ♠ Spades (Black)

---

## Jack Cards: **8 Total**

### One-Eyed Jacks (4 cards) - Remove Opponent Chips
- J♠ (Jack of Spades) × 2
- J♣ (Jack of Clubs) × 2

**Function:** Remove any opponent's chip that is NOT in a completed sequence

### Two-Eyed Jacks (4 cards) - Wild Cards
- J♥ (Jack of Hearts) × 2
- J♦ (Jack of Diamonds) × 2

**Function:** Place your chip on any empty non-corner space

---

## Implementation

### Code Location: `src/lib/game-logic/cards.ts`

```typescript
export function createDeck(): Card[] {
  const deck: Card[] = []
  
  for (const suit of SUITS) {        // 4 suits
    for (const rank of RANKS) {      // 13 ranks
      deck.push(createCard(suit, rank))
    }
  }
  
  return deck  // 52 cards
}

export function createTwoDecks(): Card[] {
  return [...createDeck(), ...createDeck()]  // 104 cards
}
```

### Usage: `src/pages/CreateGame.tsx`

```typescript
// Create and shuffle deck
const deck = shuffleDeck(createTwoDecks())  // ✅ Using 2 decks!

// Create game deck
await supabase
  .from('game_decks')
  .insert({
    game_id: result.game_id,
    draw_pile: deck,      // 104 cards initially
    discard_pile: [],
  })
```

---

## Gameplay Distribution

### Initial Deal (2 players):
- Player 1: 7 cards
- Player 2: 7 cards
- **Draw Pile:** 90 cards (104 - 14)

### During Game:
- Cards are drawn from the draw pile
- Played cards go to the discard pile
- When draw pile is empty, discard pile is reshuffled

### With 2 Decks:
- ✅ 8 Jacks total (plenty for strategic play)
- ✅ 104 cards (enough for long games)
- ✅ Each card appears twice (2 chances to get specific cards)
- ✅ Auto-reshuffle prevents running out of cards

---

## Card Distribution Example

| Card | Count | Notes |
|------|-------|-------|
| 2♥ | 2 | Appears on board twice |
| J♠ | 2 | One-eyed Jack (remove chip) |
| J♥ | 2 | Two-eyed Jack (wild card) |
| A♣ | 2 | Appears on board twice |

**Every card in the deck appears exactly twice** (except corner spaces which use any card as wild)

---

## Why 2 Decks?

### Official Sequence Rules:
The official Sequence board game uses **2 standard 52-card decks** (104 cards total).

### Benefits:
1. **Longer Games:** 104 cards support extended gameplay
2. **Strategic Depth:** 8 Jacks provide more tactical options
3. **Board Coverage:** Each card position has 2 matching cards in deck
4. **No Card Shortage:** Enough cards for multiple players and long games
5. **Reshuffle Buffer:** Discard pile provides continuous play

---

## Verification

Run this test to verify deck composition:

```bash
node /tmp/verify_deck.js
```

**Output:**
```
Total cards in 2 decks: 104
Total Jacks: 8

Jack breakdown:
  - Jhearts
  - Jdiamonds
  - Jclubs
  - Jspades
  - Jhearts
  - Jdiamonds
  - Jclubs
  - Jspades

Jack types:
  One-eyed (remove chips): 4
  Two-eyed (wild card): 4
```

---

## Summary

✅ **The game is correctly configured with 2 decks (104 cards)**  
✅ **8 Jacks total (4 one-eyed, 4 two-eyed)**  
✅ **Follows official Sequence game rules**  
✅ **No changes needed - working as intended!**
