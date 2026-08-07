-- Function to create a new game
CREATE OR REPLACE FUNCTION create_game(
  player_name TEXT,
  team INTEGER
)
RETURNS TABLE (
  game_id UUID,
  invite_code TEXT,
  player_id UUID
) AS $$
DECLARE
  v_game_id UUID;
  v_player_id UUID;
  v_invite_code TEXT;
  v_board_state JSONB;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Generate unique invite code
  LOOP
    v_invite_code := upper(substring(md5(random()::text) from 1 for 6));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM games WHERE games.invite_code = v_invite_code);
  END LOOP;
  
  -- Create initial board state (will be populated by client)
  v_board_state := '[]'::jsonb;
  
  -- Create game
  INSERT INTO games (invite_code, board_state, player_count, sequences_required)
  VALUES (v_invite_code, v_board_state, 0, 3)
  RETURNING id INTO v_game_id;
  
  -- Create player
  INSERT INTO players (game_id, user_id, name, team, position, is_host, is_ready)
  VALUES (v_game_id, v_user_id, player_name, team, 0, true, false)
  RETURNING id INTO v_player_id;
  
  -- Create empty hand
  INSERT INTO player_hands (player_id, game_id, cards)
  VALUES (v_player_id, v_game_id, '[]'::jsonb);
  
  -- Return result
  RETURN QUERY SELECT v_game_id, v_invite_code, v_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join an existing game
CREATE OR REPLACE FUNCTION join_game(
  p_invite_code TEXT,
  player_name TEXT,
  team INTEGER
)
RETURNS TABLE (
  game_id UUID,
  player_id UUID
) AS $$
DECLARE
  v_game_id UUID;
  v_player_id UUID;
  v_player_count INTEGER;
  v_next_position INTEGER;
  v_user_id UUID;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Find game by invite code
  SELECT id, games.player_count INTO v_game_id, v_player_count
  FROM games
  WHERE games.invite_code = upper(p_invite_code)
    AND games.status = 'waiting';
  
  IF v_game_id IS NULL THEN
    RAISE EXCEPTION 'Game not found or already started';
  END IF;
  
  -- Check if game is full (max 2 players)
  IF v_player_count >= 2 THEN
    RAISE EXCEPTION 'Game is full';
  END IF;
  
  -- Get next available position
  SELECT COALESCE(MAX(position), -1) + 1 INTO v_next_position
  FROM players
  WHERE players.game_id = v_game_id;
  
  -- Create player
  INSERT INTO players (game_id, user_id, name, team, position, is_host, is_ready)
  VALUES (v_game_id, v_user_id, player_name, team, v_next_position, false, false)
  RETURNING id INTO v_player_id;
  
  -- Create empty hand
  INSERT INTO player_hands (player_id, game_id, cards)
  VALUES (v_player_id, v_game_id, '[]'::jsonb);
  
  -- Return result
  RETURN QUERY SELECT v_game_id, v_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark player as ready
CREATE OR REPLACE FUNCTION ready_player(
  p_game_id UUID,
  p_player_id UUID,
  ready BOOLEAN
)
RETURNS TABLE (success BOOLEAN) AS $$
BEGIN
  UPDATE players
  SET is_ready = ready
  WHERE id = p_player_id AND game_id = p_game_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start game
CREATE OR REPLACE FUNCTION start_game(
  p_game_id UUID,
  p_player_id UUID
)
RETURNS TABLE (success BOOLEAN) AS $$
DECLARE
  v_is_host BOOLEAN;
  v_all_ready BOOLEAN;
  v_player_count INTEGER;
BEGIN
  -- Check if player is host
  SELECT is_host INTO v_is_host
  FROM players
  WHERE id = p_player_id AND game_id = p_game_id;

  IF NOT v_is_host THEN
    RAISE EXCEPTION 'Only the host can start the game';
  END IF;

  -- Check if all players are ready
  SELECT COUNT(*) = COUNT(*) FILTER (WHERE is_ready), COUNT(*)
  INTO v_all_ready, v_player_count
  FROM players
  WHERE game_id = p_game_id;

  IF NOT v_all_ready THEN
    RAISE EXCEPTION 'Not all players are ready';
  END IF;

  -- Determine sequences required based on player count
  UPDATE games
  SET
    status = 'playing',
    started_at = NOW(),
    sequences_required = 3
  WHERE id = p_game_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to play a card (simplified - main logic will be in application)
CREATE OR REPLACE FUNCTION play_card(
  p_game_id UUID,
  p_player_id UUID,
  card JSONB,
  p_position JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  sequences JSONB,
  game_over BOOLEAN,
  winner_team INTEGER
) AS $$
DECLARE
  v_current_position INTEGER;
  v_player_position INTEGER;
  v_move_number INTEGER;
  v_sequences JSONB;
  v_game_over BOOLEAN := false;
  v_winner_team INTEGER := NULL;
BEGIN
  -- Get current turn position
  SELECT current_turn, games.sequences INTO v_current_position, v_sequences
  FROM games
  WHERE id = p_game_id;

  -- Get player position
  SELECT position INTO v_player_position
  FROM players
  WHERE id = p_player_id AND game_id = p_game_id;

  -- Validate it's this player's turn
  IF v_current_position != v_player_position THEN
    RAISE EXCEPTION 'Not your turn';
  END IF;

  -- Get next move number
  SELECT COALESCE(MAX(game_moves.move_number), -1) + 1 INTO v_move_number
  FROM game_moves
  WHERE game_moves.game_id = p_game_id;

  -- Record the move
  INSERT INTO game_moves (game_id, player_id, move_number, card_played, board_position, move_type)
  VALUES (p_game_id, p_player_id, v_move_number, card, position, 'place');

  -- Return result (board state and sequence detection handled by client)
  RETURN QUERY SELECT true, v_sequences, v_game_over, v_winner_team;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update game state after move
CREATE OR REPLACE FUNCTION update_game_state(
  p_game_id UUID,
  p_board_state JSONB,
  p_sequences JSONB,
  p_next_turn INTEGER,
  p_game_over BOOLEAN,
  p_winner_team INTEGER
)
RETURNS TABLE (success BOOLEAN) AS $$
BEGIN
  UPDATE games
  SET
    board_state = p_board_state,
    sequences = p_sequences,
    current_turn = p_next_turn,
    status = CASE WHEN p_game_over THEN 'finished'::game_status ELSE status END,
    finished_at = CASE WHEN p_game_over THEN NOW() ELSE finished_at END,
    winner_team = CASE WHEN p_game_over THEN p_winner_team ELSE winner_team END
  WHERE id = p_game_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update player connection status
CREATE OR REPLACE FUNCTION update_player_connection(
  p_player_id UUID,
  p_connected BOOLEAN
)
RETURNS TABLE (success BOOLEAN) AS $$
BEGIN
  UPDATE players
  SET connected = p_connected, last_seen = NOW()
  WHERE id = p_player_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
