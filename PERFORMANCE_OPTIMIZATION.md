# Performance Optimization - Card Playing

## Problem
Playing a card was taking 2-3 seconds, showing "Playing card..." loading message for the entire duration.

## Root Cause Analysis

The `playCard` function in `src/hooks/useGame.ts` was making **4 sequential database calls**:

1. `SELECT` from `game_decks` to fetch draw/discard piles (~500ms)
2. `UPDATE` to `game_decks` to update piles (~500ms)
3. RPC call to `update_game_state` to update game state (~500ms)
4. `UPDATE` to `player_hands` to update player's hand (~500ms)

**Total latency: 2-3 seconds** due to network round trips

## Solution Implemented

### 1. Created Combined RPC Function
**File:** `supabase/migrations/006_play_card_optimized.sql`

Created `play_card_optimized()` RPC function that combines all three updates in a single database transaction:
- Updates game state (board, sequences, turn, winner)
- Updates deck (draw pile, discard pile)
- Updates player hand

This reduces 3 separate DB calls into 1 transaction.

### 2. Optimistic UI Updates
**File:** `src/hooks/useGame.ts`

Modified `playCard()` to update the UI **immediately** before making any database calls:
- Calculate new board state locally
- Detect sequences locally
- Update UI state (board, sequences, hand) instantly
- Play sound effects immediately
- Show "Syncing..." message while DB updates in background
- Rollback on error if DB sync fails

### 3. Parallelization
The remaining DB operations (fetch deck, then update everything) are now:
- Fetch deck data (required to know what card to draw)
- Single RPC call to update everything

This is the optimal approach since the RPC needs the drawn card information.

## Results

**Before:**
- 4 sequential DB calls
- 2-3 seconds total delay
- UI frozen with "Playing card..." message

**After:**
- UI updates instantly (optimistic)
- 2 DB calls (1 fetch + 1 combined RPC)
- "Syncing..." message shown briefly (~500ms) in background
- Perceived latency: **near-instant** ⚡

## Deployment Instructions

### Apply Database Migration

1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/fccmiuryjimjcqrhclmy/sql
2. Paste the contents of `supabase/migrations/006_play_card_optimized.sql`
3. Click **Run**

### Deploy Frontend

The code changes are already pushed to GitHub. The deployment will happen automatically via GitHub Actions.

Check deployment status: https://github.com/koinoyokan1/sequence/actions

## Technical Details

### Optimistic Update Pattern
```typescript
// 1. Calculate new state locally
const newBoard = placeChip(boardState, position.x, position.y, team)
const newSequences = detectSequences(newBoard)

// 2. Update UI immediately
setBoardState(newBoard)
setSequences(newSequences)
playCardPlaceSound()

// 3. Sync to database in background
try {
  await supabase.rpc('play_card_optimized', { ... })
} catch (error) {
  // 4. Rollback on error
  setBoardState(oldBoard)
  setSequences(oldSequences)
}
```

### Combined RPC Function
```sql
CREATE OR REPLACE FUNCTION play_card_optimized(
  p_game_id UUID,
  p_player_id UUID,
  p_new_board_state JSONB,
  p_new_sequences JSONB,
  p_next_turn INTEGER,
  p_game_over BOOLEAN,
  p_winner_team INTEGER,
  p_new_draw_pile JSONB,
  p_new_discard_pile JSONB,
  p_new_hand JSONB
)
```

This function updates all three tables in a single transaction, ensuring atomicity and reducing network overhead.

## Future Optimizations

1. **Incremental Sequence Detection**: Only check sequences near the newly placed chip instead of the entire 10x10 board
2. **Database Indexing**: Ensure `game_id` is indexed on all tables
3. **WebSocket Updates**: Consider using Supabase Realtime for instant opponent move updates
4. **Prefetching**: Prefetch next card while opponent is thinking

## Files Changed

- `supabase/migrations/006_play_card_optimized.sql` - New combined RPC function
- `src/hooks/useGame.ts` - Refactored `playCard()` with optimistic updates
