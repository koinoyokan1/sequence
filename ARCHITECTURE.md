# Sequence Game - Architecture Design

## System Overview

```
┌─────────────────┐         ┌──────────────────┐
│  React Frontend │────────▶│    Supabase      │
│  (GitHub Pages) │◀────────│  - Auth          │
│                 │         │  - Postgres DB   │
│  - React 18     │         │  - Realtime      │
│  - TypeScript   │         │  - RLS Policies  │
│  - Vite         │         └──────────────────┘
│  - TailwindCSS  │
└─────────────────┘

```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS + Framer Motion
- **State Management**: Zustand + React Query
- **Routing**: React Router v6
- **WebSocket**: Supabase Realtime
- **Deployment**: GitHub Pages

### Backend
- **Platform**: Supabase
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth (anonymous users)
- **Realtime**: Supabase Realtime subscriptions
- **Functions**: PostgreSQL functions + triggers

## Folder Structure

```
sequence/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions for deployment
├── public/
│   ├── assets/
│   │   ├── cards/              # Card images
│   │   └── sounds/             # Game sounds
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── board/
│   │   │   ├── BoardCell.tsx
│   │   │   ├── BoardGrid.tsx
│   │   │   ├── SequenceHighlight.tsx
│   │   │   └── ChipPiece.tsx
│   │   ├── cards/
│   │   │   ├── CardHand.tsx
│   │   │   ├── PlayingCard.tsx
│   │   │   └── DeckIndicator.tsx
│   │   ├── lobby/
│   │   │   ├── CreateGameForm.tsx
│   │   │   ├── JoinGameForm.tsx
│   │   │   ├── LobbyRoom.tsx
│   │   │   └── PlayerList.tsx
│   │   ├── game/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── GameHeader.tsx
│   │   │   ├── TurnIndicator.tsx
│   │   │   └── GameControls.tsx
│   │   ├── presence/
│   │   │   ├── PlayerCursor.tsx
│   │   │   └── PresenceIndicator.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Modal.tsx
│   │       └── Toast.tsx
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── usePresence.ts
│   │   ├── useRealtime.ts
│   │   └── useSupabase.ts
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client
│   │   ├── game-logic/
│   │   │   ├── board.ts         # Board configuration
│   │   │   ├── cards.ts         # Deck management
│   │   │   ├── moves.ts         # Move validation
│   │   │   └── sequence.ts      # Sequence detection
│   │   └── constants.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── CreateGame.tsx
│   │   ├── JoinGame.tsx
│   │   ├── Lobby.tsx
│   │   ├── Game.tsx
│   │   └── Results.tsx
│   ├── stores/
│   │   ├── gameStore.ts
│   │   └── uiStore.ts
│   ├── types/
│   │   ├── game.ts
│   │   ├── player.ts
│   │   └── database.ts
│   ├── utils/
│   │   ├── invite-code.ts
│   │   └── validators.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_functions.sql
│   └── seed.sql
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── DEPLOYMENT.md
└── README.md
```

## Database Schema

### Tables

#### `games`
```sql
- id: uuid (PK)
- invite_code: text (unique, indexed)
- status: enum ['waiting', 'playing', 'finished']
- current_turn: int
- winner_team: int (nullable)
- created_at: timestamp
- started_at: timestamp (nullable)
- finished_at: timestamp (nullable)
- board_state: jsonb
- sequences: jsonb
```

#### `players`
```sql
- id: uuid (PK)
- game_id: uuid (FK -> games)
- user_id: uuid (FK -> auth.users, nullable for anonymous)
- name: text
- team: int (1 or 2)
- position: int (0-3 for 2-4 players)
- is_ready: boolean
- is_host: boolean
- connected: boolean
- last_seen: timestamp
```

#### `player_hands`
```sql
- id: uuid (PK)
- player_id: uuid (FK -> players)
- game_id: uuid (FK -> games)
- cards: jsonb (array of card objects)
```

#### `game_moves`
```sql
- id: uuid (PK)
- game_id: uuid (FK -> games)
- player_id: uuid (FK -> players)
- move_number: int
- card_played: jsonb
- board_position: jsonb {x, y}
- move_type: enum ['place', 'remove']
- created_at: timestamp
```

#### `game_decks`
```sql
- id: uuid (PK)
- game_id: uuid (FK -> games, unique)
- draw_pile: jsonb (array of remaining cards)
- discard_pile: jsonb (array of discarded cards)
```

#### `presence`
```sql
- id: uuid (PK)
- player_id: uuid (FK -> players)
- game_id: uuid (FK -> games)
- cursor_position: jsonb {x, y} (nullable)
- last_heartbeat: timestamp
```

## API Contracts

### Supabase RPC Functions

#### `create_game(player_name text, team int)`
- Creates new game with unique invite code
- Inserts player as host
- Initializes two decks of cards
- Returns: `{game_id, invite_code, player_id}`

#### `join_game(invite_code text, player_name text, team int)`
- Validates invite code
- Checks game capacity (max 4 players for 2 teams)
- Adds player to game
- Returns: `{game_id, player_id}`

#### `start_game(game_id uuid, player_id uuid)`
- Validates player is host
- Validates all players are ready
- Deals initial cards (7 per player for 2 players, 6 for 3-4 players)
- Sets game status to 'playing'
- Returns: `{success: boolean}`

#### `play_card(game_id uuid, player_id uuid, card jsonb, position jsonb)`
- Validates it's player's turn
- Validates card is in player's hand
- Validates move is legal
- Updates board state
- Draws replacement card
- Checks for sequences
- Advances turn
- Returns: `{success: boolean, sequences: array, game_over: boolean}`

#### `ready_player(game_id uuid, player_id uuid, ready boolean)`
- Updates player's ready state
- Returns: `{success: boolean}`

## WebSocket Events (Supabase Realtime)

### Subscriptions

#### `games:id=eq.{game_id}`
- Listens to game state changes
- Updates: board_state, current_turn, status, winner_team, sequences

#### `players:game_id=eq.{game_id}`
- Listens to player changes
- Updates: connected, is_ready, last_seen

#### `game_moves:game_id=eq.{game_id}`
- Listens to new moves
- Triggers animations and UI updates

#### `presence:game_id=eq.{game_id}`
- Listens to cursor positions
- Shows other players' cursors

### Realtime Channels

#### `game:{game_id}:presence`
- Track online players
- Share cursor positions
- Heartbeat mechanism

## Game Logic

### Board Configuration

Standard Sequence board (10x10):
- 4 corner cells are "free" spaces
- Each card position appears twice on board
- Jacks are special (not on board)

### Card Types

1. **Regular Cards**: Place chip on matching board position
2. **Two-Eyed Jacks** (♥J, ♦J): Wild card - place on any empty space
3. **One-Eyed Jacks** (♠J, ♣J): Remove opponent's chip (not in sequence)
4. **Free Spaces**: 4 corners, usable by both teams

### Sequence Detection

- 5 chips in a row (horizontal, vertical, diagonal)
- Can use corner free spaces
- Sequences can overlap
- Dead cards: If both positions occupied, card is unplayable

### Win Conditions

- 2 players: First to 1 sequence wins
- 3-4 players: First team to 2 sequences wins

### Turn Flow

1. Player selects card from hand
2. Player clicks valid board position
3. Server validates move
4. Chip placed, card discarded
5. Draw replacement card
6. Check for sequences/win
7. Advance to next player

## State Management

### Global State (Zustand)

```typescript
interface GameState {
  gameId: string | null
  playerId: string | null
  game: Game | null
  players: Player[]
  myHand: Card[]
  boardState: BoardCell[][]
  currentTurn: number
  sequences: Sequence[]
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  playCard: (position: {x: number, y: number}) => Promise<void>
}
```

### Server State (React Query)

- Cache game data
- Automatic refetching
- Optimistic updates

## Deployment

### Frontend (GitHub Pages)

1. Build with Vite
2. GitHub Actions workflow
3. Deploy to `gh-pages` branch
4. Custom domain support (optional)

### Backend (Supabase)

1. Create Supabase project
2. Run migrations
3. Configure RLS policies
4. Enable Realtime
5. Set environment variables

## Security

### Row Level Security (RLS)

- Players can only see games they're in
- Players can only see their own hand
- Only current player can make moves
- Only host can start game

### Validation

- Server-side move validation
- Card ownership verification
- Turn order enforcement
- Dead card detection

