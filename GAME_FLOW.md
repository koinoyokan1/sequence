# Sample Game Flow

This document walks through a complete multiplayer Sequence game from start to finish.

## Players
- **Alice** (Team Red, Player 1)
- **Bob** (Team Blue, Player 2)

## Flow Diagram

```
Landing Page
    ↓
Alice clicks "Create Game"
    ↓
Alice enters name "Alice", selects Team Red
    ↓
Game Created: Code "ABC123"
    ↓
Alice waits in Lobby
    ↓
Bob opens app in another browser
    ↓
Bob clicks "Join Game"
    ↓
Bob enters code "ABC123", name "Bob", Team Blue
    ↓
Both players in Lobby
    ↓
Alice clicks "Ready"
    ↓
Bob clicks "Ready"
    ↓
Alice (Host) clicks "Start Game"
    ↓
Board appears with 7 cards each
    ↓
Alice's Turn (Turn 0)
    ↓
Alice plays 6♦, places chip at (1,0)
    ↓
Alice draws new card
    ↓
Bob's Turn (Turn 1)
    ↓
... game continues ...
    ↓
Alice completes horizontal sequence
    ↓
Game Over: Team Red Wins!
```

## Detailed Walkthrough

### Phase 1: Game Setup (0:00 - 0:30)

#### 0:00 - Alice Creates Game
```
Screen: Create Game
Actions:
1. Alice enters "Alice" in name field
2. Selects "Team Red" 
3. Clicks "Create Game"

Backend:
- create_game() RPC called
- Game record created with invite_code "ABC123"
- Alice added as Player 1, position 0, host=true
- Empty hand created for Alice
- Two decks shuffled and stored

Result:
- Redirect to /lobby/abc-123-def-456
- Lobby shows: "Game Code: ABC123"
- Player List: Alice (Team Red, Host, Not Ready)
```

#### 0:15 - Bob Joins Game
```
Screen: Join Game (Bob's browser)
Actions:
1. Bob enters "ABC123"
2. Enters name "Bob"
3. Selects "Team Blue"
4. Clicks "Join Game"

Backend:
- join_game() RPC called
- Bob added as Player 2, position 1, host=false
- Empty hand created for Bob
- Realtime subscription notifies Alice

Result (both browsers):
- Player List updates:
  - Alice (Team Red, Host, Not Ready)
  - Bob (Team Blue, Not Ready)
```

#### 0:20 - Players Ready Up
```
Actions:
1. Alice clicks "Ready" → status updates
2. Bob clicks "Ready" → status updates

Backend:
- ready_player() RPC called for each
- is_ready set to true

Result:
- Player List shows both as "Ready"
- "Start Game" button enabled for Alice
```

#### 0:30 - Game Starts
```
Action:
- Alice clicks "Start Game"

Backend:
- start_game() RPC called
- Game status → "playing"
- Cards dealt: 7 to each player
- Hands stored in player_hands table
- current_turn set to 0 (Alice)

Result:
- Both browsers redirect to /game/abc-123-def-456
- Board displays with initial state
- Alice sees her 7 cards
- Bob sees his 7 cards
- Turn indicator shows "Alice's Turn"
```

### Phase 2: Gameplay (0:30 - 5:00)

#### Turn 1 - Alice (0:30)
```
Alice's Hand: [6♦, 2♥, K♣, 5♠, 9♥, J♠, A♦]

Actions:
1. Alice clicks 6♦ in her hand
   - Card highlights
   - Board positions (1,0) highlight (matching 6♦)
2. Alice clicks position (1,0)

Backend:
- play_card() validates move
- Board position (1,0) gets red chip
- 6♦ removed from Alice's hand
- Alice draws replacement: 3♣
- game_moves record created
- current_turn → 1 (Bob)
- update_game_state() RPC called

Result:
- Red chip appears at (1,0) with animation
- Alice's hand: [2♥, K♣, 5♠, 9♥, J♠, A♦, 3♣]
- Turn indicator: "Bob's Turn"
- Bob's browser updates instantly
```

#### Turn 2 - Bob (0:45)
```
Bob's Hand: [7♦, 4♥, Q♠, 8♣, 10♥, 2♣, K♦]

Actions:
1. Bob clicks 7♦
2. Clicks position (2,0)

Result:
- Blue chip at (2,0)
- Bob draws new card
- Turn passes to Alice
```

#### Turns 3-15 (1:00 - 4:00)
```
Players take turns playing cards, building toward sequences.

Notable moves:
- Turn 5: Alice plays J♥ (two-eyed jack)
  → All empty positions highlight
  → Alice places wild chip strategically
  
- Turn 8: Bob plays J♠ (one-eyed jack)
  → Alice's non-sequence chips highlight
  → Bob removes one of Alice's chips
  
- Turn 12: Alice builds 4 in a row horizontally
  → Position (1,3) to (4,3) with red chips
```

#### Turn 16 - Alice Wins! (4:30)
```
Alice's Hand: [5♥, ...]

Board State:
Position (1,3): Red chip
Position (2,3): Red chip  
Position (3,3): Red chip
Position (4,3): Red chip
Position (5,3): Empty

Actions:
1. Alice plays 5♥
2. Clicks position (5,3)

Backend:
- play_card() validates
- Chip placed at (5,3)
- detectSequences() finds:
  Sequence: [(1,3), (2,3), (3,3), (4,3), (5,3)] - Team 1
- hasWon() returns true (1 sequence for 2 players)
- game.status → "finished"
- game.winner_team → 1

Result:
- Sequence positions highlight with glow animation
- Game Over screen appears
- "Team Red Wins! 🎉"
- Final board state preserved
```

### Phase 3: Post-Game (5:00+)

```
Result Screen:
- Shows winner: "Team Red"
- Displays final board
- Shows game statistics:
  - Total turns: 16
  - Alice's sequences: 1
  - Bob's sequences: 0

Options (not implemented):
- Play Again
- View Game History
- Return to Home
```

## Database State Timeline

### After Game Creation
```sql
games: {
  id: "abc-123-def-456",
  invite_code: "ABC123",
  status: "waiting",
  current_turn: 0,
  player_count: 1,
  board_state: [[...]],
  sequences: []
}

players: [
  {
    id: "player-alice-id",
    game_id: "abc-123-def-456",
    name: "Alice",
    team: 1,
    position: 0,
    is_host: true,
    is_ready: false
  }
]
```

### After Bob Joins
```sql
players: [
  { /* Alice */ },
  {
    id: "player-bob-id",
    game_id: "abc-123-def-456",
    name: "Bob",
    team: 2,
    position: 1,
    is_host: false,
    is_ready: false
  }
]
```

### After Game Starts
```sql
games: {
  status: "playing",
  current_turn: 0
}

player_hands: [
  {
    player_id: "player-alice-id",
    cards: [/* 7 cards */]
  },
  {
    player_id: "player-bob-id",
    cards: [/* 7 cards */]
  }
]

game_decks: {
  game_id: "abc-123-def-456",
  draw_pile: [/* 90 remaining cards */],
  discard_pile: []
}
```

### After First Move
```sql
games: {
  current_turn: 1,
  board_state: [/* updated with red chip at (1,0) */]
}

game_moves: [
  {
    game_id: "abc-123-def-456",
    player_id: "player-alice-id",
    move_number: 0,
    card_played: {suit: "diamonds", rank: "6"},
    board_position: {x: 1, y: 0},
    move_type: "place"
  }
]
```

### After Game Ends
```sql
games: {
  status: "finished",
  winner_team: 1,
  finished_at: "2024-01-15T10:35:00Z",
  sequences: [
    {
      id: "seq-1",
      team: 1,
      positions: [
        {x: 1, y: 3},
        {x: 2, y: 3},
        {x: 3, y: 3},
        {x: 4, y: 3},
        {x: 5, y: 3}
      ]
    }
  ]
}
```

## Realtime Events

### Event Flow

```
1. Alice creates game
   → games INSERT event
   → Alice's browser receives update

2. Bob joins
   → players INSERT event
   → Alice's browser receives update
   → Player list re-renders

3. Players ready up
   → players UPDATE events
   → Both browsers update ready states

4. Game starts
   → games UPDATE event (status: "playing")
   → Both browsers redirect to game

5. Alice plays card
   → games UPDATE event (board_state, current_turn)
   → game_moves INSERT event
   → Bob's browser updates immediately

6. Bob plays card
   → Same realtime flow
   → Alice's browser updates

... continues for each move ...

7. Alice wins
   → games UPDATE event (status: "finished", winner_team: 1)
   → Both browsers show game over
```

## Network Requests

### Game Creation
```
POST https://your-project.supabase.co/rest/v1/rpc/create_game
Body: { player_name: "Alice", team: 1 }
Response: { game_id: "...", invite_code: "ABC123", player_id: "..." }
```

### Realtime Subscription
```
WebSocket wss://your-project.supabase.co/realtime/v1/websocket
Channel: game:abc-123-def-456
Events: INSERT, UPDATE, DELETE on games, players, game_moves
```

### Play Card
```
POST https://your-project.supabase.co/rest/v1/rpc/update_game_state
Body: {
  p_game_id: "...",
  p_board_state: [[...]],
  p_sequences: [...],
  p_next_turn: 1,
  p_game_over: false
}
```

This demonstrates a complete 2-player game from start to finish!
