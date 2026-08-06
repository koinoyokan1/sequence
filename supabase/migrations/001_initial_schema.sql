-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE game_status AS ENUM ('waiting', 'playing', 'finished');
CREATE TYPE move_type AS ENUM ('place', 'remove');

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code TEXT UNIQUE NOT NULL,
  status game_status NOT NULL DEFAULT 'waiting',
  current_turn INTEGER NOT NULL DEFAULT 0,
  winner_team INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  board_state JSONB NOT NULL,
  sequences JSONB NOT NULL DEFAULT '[]'::jsonb,
  player_count INTEGER NOT NULL DEFAULT 0,
  sequences_required INTEGER NOT NULL DEFAULT 1
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  team INTEGER NOT NULL CHECK (team IN (1, 2)),
  position INTEGER NOT NULL CHECK (position >= 0 AND position <= 3),
  is_ready BOOLEAN NOT NULL DEFAULT false,
  is_host BOOLEAN NOT NULL DEFAULT false,
  connected BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_id, position)
);

-- Player hands table
CREATE TABLE player_hands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE(player_id, game_id)
);

-- Game moves table
CREATE TABLE game_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  card_played JSONB NOT NULL,
  board_position JSONB NOT NULL,
  move_type move_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game decks table
CREATE TABLE game_decks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID UNIQUE NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  draw_pile JSONB NOT NULL DEFAULT '[]'::jsonb,
  discard_pile JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Presence table (for realtime cursor tracking)
CREATE TABLE presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  cursor_position JSONB,
  last_heartbeat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id)
);

-- Indexes for performance
CREATE INDEX idx_games_invite_code ON games(invite_code);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_game_moves_game_id ON game_moves(game_id);
CREATE INDEX idx_game_moves_player_id ON game_moves(player_id);
CREATE INDEX idx_presence_game_id ON presence(game_id);

-- Trigger to update last_seen on player activity
CREATE OR REPLACE FUNCTION update_player_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER player_activity
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_player_last_seen();

-- Trigger to update player count on games table
CREATE OR REPLACE FUNCTION update_game_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE games SET player_count = player_count + 1 WHERE id = NEW.game_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE games SET player_count = player_count - 1 WHERE id = OLD.game_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_count
  AFTER INSERT OR DELETE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_game_player_count();
