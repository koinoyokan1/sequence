# Testing Guide

This document outlines how to test the Sequence game application.

## Manual Testing Checklist

### 1. Game Creation Flow

**Test Case**: Create a new game
- [ ] Navigate to landing page
- [ ] Click "Create Game"
- [ ] Enter player name (test with various lengths)
- [ ] Select Team Red
- [ ] Click "Create Game"
- [ ] Verify redirect to lobby
- [ ] Verify 6-digit invite code is displayed
- [ ] Verify player appears in player list as host
- [ ] Verify player shows on correct team

**Expected Results**:
- Game created successfully
- Unique invite code generated
- Player listed as host
- Ready button available

**Edge Cases**:
- [ ] Empty name (should show error)
- [ ] Name too long (should truncate or error)
- [ ] Special characters in name

### 2. Join Game Flow

**Test Case**: Join an existing game
- [ ] Open in new browser/incognito
- [ ] Click "Join Game"
- [ ] Enter invite code from created game
- [ ] Enter different player name
- [ ] Select Team Blue
- [ ] Click "Join Game"
- [ ] Verify redirect to same lobby
- [ ] Verify both players visible

**Expected Results**:
- Successfully joins existing game
- Player list updates in real-time
- Both players see each other

**Edge Cases**:
- [ ] Invalid invite code (should show error)
- [ ] Code with lowercase letters (should auto-uppercase)
- [ ] Game already started (should show error)
- [ ] Game full (4 players) (should show error)

### 3. Lobby Functionality

**Test Case**: Lobby interactions
- [ ] Both players click "Ready"
- [ ] Verify ready status updates in real-time
- [ ] Host verifies "Start Game" button enabled
- [ ] Non-host verifies "Start Game" button not visible
- [ ] One player clicks "Not Ready"
- [ ] Verify "Start Game" disabled
- [ ] All players click "Ready" again
- [ ] Host clicks "Start Game"
- [ ] Verify redirect to game board

**Expected Results**:
- Ready states sync across all players
- Only host can start game
- Game starts only when all ready
- Smooth transition to game

**Edge Cases**:
- [ ] Player disconnects (connection indicator updates)
- [ ] Player refreshes page
- [ ] Only one player in lobby (can't start)

### 4. Game Board Display

**Test Case**: Board and UI rendering
- [ ] Verify 10x10 board displays
- [ ] Verify 4 corner free spaces
- [ ] Verify all cards visible on cells
- [ ] Verify card hand displays at bottom
- [ ] Verify correct number of cards (7 for 2 players)
- [ ] Verify team indicators
- [ ] Verify turn indicator
- [ ] Verify game code displayed

**Expected Results**:
- Board renders correctly
- All UI elements visible
- Responsive on different screen sizes

### 5. Card Selection

**Test Case**: Selecting and playing cards
- [ ] Wait for your turn
- [ ] Click a card in hand
- [ ] Verify card highlights
- [ ] Verify valid board positions highlight
- [ ] Click highlighted board position
- [ ] Verify chip appears
- [ ] Verify card removed from hand
- [ ] Verify new card drawn
- [ ] Verify turn advances

**Expected Results**:
- Only playable cards can be selected
- Valid positions clearly indicated
- Move executes smoothly
- Turn passes to next player

### 6. Jack Card Functionality

**Test Case**: Two-eyed Jack (wild card)
- [ ] Wait for turn with two-eyed Jack (♥J or ♦J)
- [ ] Select the Jack
- [ ] Verify all empty spaces highlight
- [ ] Click any empty space
- [ ] Verify chip placed

**Expected Results**:
- Can place chip anywhere (except corners)
- Functions as wild card

**Test Case**: One-eyed Jack (removal)
- [ ] Wait for turn with one-eyed Jack (♠J or ♣J)
- [ ] Ensure opponent has chips on board
- [ ] Select the Jack
- [ ] Verify opponent chips highlight (not in sequences)
- [ ] Click opponent chip
- [ ] Verify chip removed

**Expected Results**:
- Can remove opponent chips
- Cannot remove chips in completed sequences
- Cannot remove own chips

### 7. Sequence Detection

**Test Case**: Horizontal sequence
- [ ] Play cards to create 5 chips in a row horizontally
- [ ] Verify sequence highlights
- [ ] Verify sequence count increases
- [ ] Verify team score updates

**Test Case**: Vertical sequence
- [ ] Create 5 chips in a column
- [ ] Verify detection

**Test Case**: Diagonal sequence
- [ ] Create 5 chips diagonally
- [ ] Verify detection

**Test Case**: Using free spaces
- [ ] Create sequence using corner free space
- [ ] Verify free space counts in sequence

**Expected Results**:
- All sequence types detected
- Visual indication of sequences
- Score updates correctly

### 8. Win Condition

**Test Case**: 2-player game
- [ ] Complete 1 sequence
- [ ] Verify game ends
- [ ] Verify winner displayed
- [ ] Verify game marked as finished

**Test Case**: 3-4 player game
- [ ] Complete 2 sequences
- [ ] Verify game ends
- [ ] Verify correct team wins

**Expected Results**:
- Correct win conditions for player count
- Clear winner indication
- Game state updates to finished

### 9. Real-time Features

**Test Case**: Live updates
- [ ] Have 2+ browsers open
- [ ] Make move in one browser
- [ ] Verify immediate update in other browser
- [ ] Verify turn indicator updates
- [ ] Verify board state syncs

**Expected Results**:
- Instant updates across all clients
- No lag or delay
- Consistent state

### 10. Reconnection

**Test Case**: Player disconnects
- [ ] Start game with multiple players
- [ ] Close browser for one player
- [ ] Verify connection status updates for others
- [ ] Reopen browser and navigate to game
- [ ] Verify player reconnects
- [ ] Verify game state restored

**Expected Results**:
- Connection status accurate
- Can rejoin after disconnect
- Game state preserved

## Performance Testing

### Load Testing
- [ ] Create game with 4 players
- [ ] Rapid card plays
- [ ] Monitor response times
- [ ] Check for lag or delays

### Mobile Testing
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Verify touch interactions
- [ ] Verify responsive layout

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile browsers

## Automated Testing Scenarios

### Database Tests
```sql
-- Test game creation
SELECT * FROM games WHERE invite_code = 'TEST01';

-- Test player addition
SELECT * FROM players WHERE game_id = '<game_id>';

-- Test hand dealing
SELECT cards FROM player_hands WHERE player_id = '<player_id>';

-- Test move recording
SELECT * FROM game_moves WHERE game_id = '<game_id>' ORDER BY move_number;
```

### API Tests

Test RPC functions in Supabase SQL editor:

```sql
-- Test create_game
SELECT * FROM create_game('TestPlayer', 1);

-- Test join_game
SELECT * FROM join_game('TEST01', 'Player2', 2);

-- Test ready_player
SELECT * FROM ready_player('<game_id>', '<player_id>', true);

-- Test start_game
SELECT * FROM start_game('<game_id>', '<player_id>');
```

## Bug Reporting

When reporting bugs, include:

1. **Steps to Reproduce**
2. **Expected Behavior**
3. **Actual Behavior**
4. **Screenshots/Video**
5. **Browser/Device Info**
6. **Console Errors**

## Known Limitations

1. No spectator mode implementation
2. No game history/replay
3. No chat feature
4. No player profiles/stats
5. No AI opponent

## Future Test Cases

- [ ] Spectator mode
- [ ] Chat functionality
- [ ] Game history
- [ ] Player statistics
- [ ] AI opponent
- [ ] Custom game rules
- [ ] Tournament mode
