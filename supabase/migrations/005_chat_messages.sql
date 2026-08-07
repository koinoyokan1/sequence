-- Chat messages table for in-game communication
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast game-based queries
CREATE INDEX idx_chat_messages_game_id ON chat_messages(game_id, created_at DESC);

-- RLS policies for chat messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can view chat messages for a game
CREATE POLICY "Anyone can view chat messages"
  ON chat_messages FOR SELECT
  USING (true);

-- Anyone can insert chat messages
CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- No updates or deletes allowed (chat is append-only)
CREATE POLICY "No updates allowed"
  ON chat_messages FOR UPDATE
  USING (false);

CREATE POLICY "No deletes allowed"
  ON chat_messages FOR DELETE
  USING (false);
