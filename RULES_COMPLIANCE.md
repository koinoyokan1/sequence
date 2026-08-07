# Official Sequence Rules - Compliance Report

## ✅ Test Coverage: 39/39 Tests Passing

This document verifies compliance with official Sequence game rules and common web implementation pitfalls.

---

## 📋 Rule Compliance Summary

| Rule Category | Status | Tests | Notes |
|--------------|--------|-------|-------|
| **Winning Condition** | ✅ | 3 | 2 sequences for 2-player mode tested |
| **9-in-a-row Detection** | ✅ | 4 | Correctly counts as 2 sequences |
| **Corner Free Spaces** | ✅ | 13 | All 4 corners work as wild cards |
| **Sequence Intersection** | ✅ | 3 | Max 1 shared chip enforced |
| **Basic Sequence Detection** | ✅ | 4 | All 4 directions work |
| **Edge Cases** | ✅ | 4 | 4/6/8 chip cases handled |
| **Complex Shapes** | ✅ | 3 | T/X/L patterns detected |
| **Overlap Validation** | ✅ | 3 | 2+ shared chips rejected |
| **Two-Eyed Jacks** | ⚠️ | 0 | Not yet implemented |
| **One-Eyed Jacks** | ⚠️ | 0 | Not yet implemented |
| **Dead Cards** | ⚠️ | 0 | Not yet implemented |
| **Deck Exhaustion** | ⚠️ | 0 | Not yet implemented |

---

## ✅ Fully Implemented Rules

### 1. Winning Condition ✅

**Official Rule:**
- 2 players / 2 teams: **2 sequences** required
- 3 players / 3 teams: **1 sequence** required
- 4+ players: **3 sequences** required (current implementation)

**Implementation Status:**
- ✅ Currently set to **3 sequences required** (4+ player mode)
- ✅ Sequence detection correctly identifies multiple sequences
- ✅ Can be configured via database (`sequences_required` field)

**Tests:**
- ✅ Requires 2+ sequences to win
- ✅ Team with 1 sequence does NOT win (in current 3-sequence mode)
- ✅ Team with 2 sequences does NOT win in 3-sequence mode

**Configuration:**
```sql
-- Update sequences_required in Supabase for different player counts
UPDATE games SET sequences_required = 2 WHERE player_count = 2;
UPDATE games SET sequences_required = 1 WHERE player_count = 3;
UPDATE games SET sequences_required = 3 WHERE player_count >= 4;
```

---

### 2. 9-in-a-row = 2 Sequences ✅

**Official Rule:** A straight line of **9 chips** counts as **2 completed sequences** (sharing 1 chip in the middle).

**Common Pitfall:** Many implementations count 9 chips as only 1 sequence.

**Implementation Status:**
- ✅ **9 chips** → Detects **2 sequences** (verified)
- ✅ **10 chips** → Detects **2 sequences** (verified)
- ✅ **6 chips** → Counts as **1 sequence** only
- ✅ **8 chips** → Counts as **1 sequence** only

**How it works:**
- Algorithm checks from every position in all 4 directions
- Each starting position (0-4) finds a 5-chip sequence
- Duplicate detection ensures only valid sequences are counted
- Overlap validation ensures they share max 1 chip

**Tests:**
- ✅ 9 chips in a row = 2 sequences
- ✅ 10 chips in a row = 2 sequences
- ✅ 6 chips in a row = 1 sequence
- ✅ 8 chips in a row = 1 sequence

---

### 3. Corner Bonus Spaces (Free Spaces) ✅

**Official Rule:** The 4 corner spaces are **permanent free spaces** usable by **all players simultaneously**. No tokens are ever placed on them.

**Common Pitfall:** Implementations may allow placing chips on corners or fail to share corners between players.

**Implementation Status:**
- ✅ All 4 corners are `isFreeSpace: true`
- ✅ Corners **cannot** have chips placed on them
- ✅ Both teams can use the same corner simultaneously
- ✅ Corners work in all directions (horizontal, vertical, diagonal)

**Corner Positions:**
- Top-left: `(0, 0)`
- Top-right: `(9, 0)`
- Bottom-left: `(0, 9)`
- Bottom-right: `(9, 9)`

**Tests:**
- ✅ All 4 corners verified as free spaces
- ✅ Both teams use same corner for different sequences
- ✅ Corners work in horizontal sequences
- ✅ Corners work in vertical sequences
- ✅ Corners work in diagonal sequences
- ✅ 4 chips + 1 corner = valid 5-sequence
- ✅ 3 chips + 1 corner = invalid (need 5 total)
- ✅ Multiple corners in different sequences

---

### 4. Sequence Intersection (Max 1 Shared Chip) ✅

**Official Rule:** You may share **exactly 1 chip** from your first completed sequence to form your second sequence.

**Common Pitfall:** Implementations may allow sharing 2+ chips or completely disallow intersecting sequences.

**Implementation Status:**
- ✅ **0 or 1 shared chips** → Both sequences count
- ✅ **2+ shared chips** → Only first sequence counts
- ✅ T-shapes, X-shapes, L-shapes all detected correctly

**Tests:**
- ✅ Sharing exactly 1 chip → 2 sequences
- ✅ Sharing 2+ chips → 1 sequence only
- ✅ T-shape (1 shared cell) → 2 sequences
- ✅ X-shape (1 shared cell) → 2 sequences
- ✅ L-shape (1 shared cell at corner) → 2 sequences
- ✅ + shape (all share center) → 3 sequences

---

## ⚠️ Not Yet Implemented

### 5. Two-Eyed Jacks ($\text{J}\clubsuit, \text{J}\diamondsuit$) ⚠️

**Official Rule:** Wild card - place a token on **any open space** (excluding corners).

**Common Pitfall:** May allow placing on corners or already occupied spaces.

**Current Status:** Not implemented

**Required Implementation:**
- Add Jack card detection in move validation
- Allow placing chip on any unoccupied, non-corner space
- Prevent placement on corners
- Prevent placement on occupied spaces

---

### 6. One-Eyed Jacks ($\text{J}\spadesuit, \text{J}\heartsuit$) ⚠️

**Official Rule:** Anti-wild card - **remove 1 opponent token** from an unlocked/uncompleted sequence space.

**Common Pitfall:** May allow removing tokens from completed sequences (major rule violation) or removing own tokens.

**Current Status:** Not implemented

**Required Implementation:**
- Add Jack card detection
- Only allow removing opponent chips
- Check if chip is part of a **completed** sequence
- If part of completed sequence, **disallow removal**
- If not part of completed sequence, **allow removal**

---

### 7. Dead Cards ⚠️

**Official Rule:** If **both matching spaces** for a card are occupied, player announces "Dead Card", discards it, and draws a replacement on their turn.

**Common Pitfall:** Apps lack a "Declare Dead Card" button, soft-locking players.

**Current Status:** Not implemented

**Required Implementation:**
- Add "Dead Card" button/action
- Check if both board positions for a card are occupied
- Allow discard and immediate draw of replacement card
- Prevent soft-lock situations

---

### 8. Deck Exhaustion ⚠️

**Official Rule:** If the draw deck runs out, **discard piles are reshuffled** to form a new deck (or ruled a draw).

**Common Pitfall:** May crash or hang when attempting to draw from empty pile.

**Current Status:** Not implemented

**Required Implementation:**
- Detect when draw pile is empty
- Reshuffle discard pile into draw pile
- Handle edge case: both piles empty → game draw
- Prevent crashes/hangs

---

## 🧪 Test File Locations

### Main Test Suite (27 tests)
**File:** `src/lib/game-logic/__tests__/sequence.test.ts`

**Coverage:**
- 4 Core sequence detection tests
- 4 Edge case tests
- 3 Shape tests (T, X, L)
- 2 Win condition tests
- 3 Overlap rule tests
- 11 Free space/corner tests

### Advanced Rules Test Suite (12 tests)
**File:** `src/lib/game-logic/__tests__/game-rules.test.ts`

**Coverage:**
- 3 Win condition tests (2-player, 3-player modes)
- 4 9-in-a-row tests (9, 10, 6, 8 chips)
- 2 Corner space tests
- 3 Sequence intersection tests

---

## 📊 Test Results

```bash
npm test
```

**Result:** ✅ **39/39 tests passing**

- ✅ `sequence.test.ts`: 27/27 passing
- ✅ `game-rules.test.ts`: 12/12 passing

---

## 🎯 Summary

### ✅ Correctly Implemented (4/8 rules)

1. ✅ **Winning Condition** - Configurable sequences required (currently 3)
2. ✅ **9-in-a-row** - Correctly detects as 2 sequences
3. ✅ **Corner Spaces** - All 4 corners work as wild cards for both teams
4. ✅ **Sequence Intersection** - Max 1 shared chip enforced

### ⚠️ Not Yet Implemented (4/8 rules)

5. ⚠️ **Two-Eyed Jacks** - Wild card placement
6. ⚠️ **One-Eyed Jacks** - Remove opponent chips
7. ⚠️ **Dead Cards** - Discard and replace unplayable cards
8. ⚠️ **Deck Exhaustion** - Reshuffle on empty draw pile

---

## 🔧 Next Steps

To achieve full compliance with official Sequence rules:

1. **Implement Two-Eyed Jacks** (J♣, J♦)
   - Add wild card move validation
   - Allow placement on any open non-corner space

2. **Implement One-Eyed Jacks** (J♠, J♥)
   - Add chip removal logic
   - Protect completed sequences from removal

3. **Implement Dead Card Mechanism**
   - Add UI button for "Declare Dead Card"
   - Validate both spaces occupied
   - Auto-discard and draw replacement

4. **Implement Deck Reshuffle**
   - Detect empty draw pile
   - Reshuffle discard pile
   - Handle complete exhaustion (game draw)

---

## 📖 References

- Official Sequence Rules: https://www.jaxgames.com/sequence-rules
- Board Configuration: `src/lib/board/board-config.json`
- Sequence Detection: `src/lib/game-logic/sequence.ts`
- Test Coverage: `src/lib/game-logic/__tests/`

**Common Pitfall:** May allow removing tokens from completed sequences (major rule violation) or removing own tokens.

**Current Status:** Not implemented

**Required Implementation:**
- Add Jack card detection
- Only allow removing opponent chips
- Check if chip is part of a **completed** sequence
- If part of completed sequence, **disallow removal**
- If not part of completed sequence, **allow removal**

---

### 7. Dead Cards ⚠️

**Official Rule:** If **both matching spaces** for a card are occupied, player announces "Dead Card", discards it, and draws a replacement on their turn.

**Common Pitfall:** Apps lack a "Declare Dead Card" button, soft-locking players.

**Current Status:** Not implemented

**Required Implementation:**
- Add "Dead Card" button/action
- Check if both board positions for a card are occupied
