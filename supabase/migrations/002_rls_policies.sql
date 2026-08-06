-- Enable Row Level Security
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_moves ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert games"
  ON games FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update games"
  ON games FOR UPDATE
  USING (true);

-- Players policies
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert players"
  ON players FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update players"
  ON players FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete players"
  ON players FOR DELETE
  USING (true);

-- Player hands policies (more restrictive - players can only see their own hand)
CREATE POLICY "Players can view their own hand"
  ON player_hands FOR SELECT
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert player hands"
  ON player_hands FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Players can update their own hand"
  ON player_hands FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

-- Game moves policies
CREATE POLICY "Players in game can view moves"
  ON game_moves FOR SELECT
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can insert their own moves"
  ON game_moves FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

-- Game decks policies (no one can view the deck directly for security)
CREATE POLICY "No direct deck access"
  ON game_decks FOR SELECT
  USING (false);

CREATE POLICY "System can manage decks"
  ON game_decks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update decks"
  ON game_decks FOR UPDATE
  USING (true);

-- Presence policies
CREATE POLICY "Players in game can view presence"
  ON presence FOR SELECT
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update their own presence"
  ON presence FOR INSERT
  WITH CHECK (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update their presence"
  ON presence FOR UPDATE
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Players can delete their presence"
  ON presence FOR DELETE
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );
