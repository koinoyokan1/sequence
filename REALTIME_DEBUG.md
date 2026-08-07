# Realtime Synchronization Debugging

## Issue
Opponent cannot see moves in real-time. Changes only appear after refresh.

## Debugging Steps

### 1. Check Browser Console (F12)

Open both player windows and check for these logs:

**Expected logs when a move is played:**

**Player 1 (who plays the card):**
```
playCard debug: {...}
Calling play_card_optimized RPC...
RPC Success: true
```

**Player 2 (opponent):**
```
Game channel subscription status: SUBSCRIBED
Game update received via realtime: UPDATE
Applying realtime game update: {turn: X, previousTurn: Y, ...}
```

**Bad signs:**
- `Game channel subscription status: CHANNEL_ERROR`
- No "Game update received via realtime" message on opponent's side
- `RPC Error:` in console
- `Ignoring stale realtime update` (might indicate timing issue)

### 2. Check Supabase Dashboard

#### Enable Realtime for `games` table:

1. Go to: https://supabase.com/dashboard/project/fccmiuryjimjcqrhclmy
2. Navigate to **Database** → **Replication** (left sidebar)
3. Find the `games` table
4. Toggle **Realtime** to **ON** if it's not already enabled
5. Also enable for these tables:
   - `players`
   - `game_decks`
   - `player_hands`

#### Alternative - Check Publications:

1. Go to **Database** → **Publications**
2. Verify `supabase_realtime` publication exists
3. Ensure `games` table is included

Or run this SQL to add it:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_decks;
ALTER PUBLICATION supabase_realtime ADD TABLE player_hands;
```

### 3. Verify RPC Function Exists

Run this in Supabase SQL Editor:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'play_card_optimized' 
  AND routine_schema = 'public';
```

Should return 1 row. If empty, the migration wasn't applied correctly.

### 4. Test Database Update Manually

Run this in SQL Editor to verify the table updates:
```sql
-- Get a test game ID
SELECT id, current_turn FROM games LIMIT 1;

-- Update it manually
UPDATE games 
SET current_turn = current_turn + 1
WHERE id = '<your-game-id>';
```

Then check if the realtime subscription fires in the browser console.

### 5. Check WebSocket Connection

In browser DevTools:
1. Go to **Network** tab
2. Filter by **WS** (WebSocket)
3. Look for connection to Supabase Realtime
4. Should show as active (green)
5. Click on the connection and check **Messages** tab
6. Should see heartbeat messages flowing

### 6. Network Issues

Check for:
- CORS errors in console
- Blocked WebSocket connections
- Firewall/proxy blocking realtime connection
- Ad blockers interfering with WebSocket

## Common Fixes

### Fix 1: Realtime Not Enabled
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE games;
```

### Fix 2: RPC Function Missing
Re-run the migration:
```sql
-- Paste entire contents of supabase/migrations/006_play_card_optimized.sql
```

### Fix 3: Stale Data Check Too Strict
The `lastSeenTurnRef` in `useRealtime.ts` might be blocking updates. Check console for:
```
Ignoring stale realtime update
```

If you see this, the turn numbers are out of sync.

### Fix 4: Clear Browser State
1. Clear localStorage: `localStorage.clear()`
2. Refresh both browser windows
3. Start a new game

## Expected Behavior

**When Player 1 plays a card:**
1. Player 1's board updates instantly (optimistic)
2. Database is updated via RPC (~100ms)
3. Realtime fires to all subscribers (~200ms)
4. Player 2's board updates automatically (~300ms total)

**When Player 2 is waiting:**
1. Sees "Waiting for opponent..." 
2. Board should update automatically when Player 1 plays
3. Turn indicator should change
4. No refresh needed

## Still Not Working?

If after all these steps it's still not working, the issue might be:
- Supabase project configuration
- Row Level Security (RLS) policies blocking realtime
- Browser compatibility issue

Check RLS policies:
```sql
-- View all policies on games table
SELECT * FROM pg_policies WHERE tablename = 'games';
```

The policies should allow SELECT for authenticated users (anonymous users in this case).
