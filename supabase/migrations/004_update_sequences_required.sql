-- Update sequences_required to 3 for all games
-- This migration updates the create_game and start_game functions to use 3 sequences

-- Drop and recreate the create_game function with sequences_required = 3
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
  
  -- Create game with 3 sequences required
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

-- Update the start_game function to set sequences_required = 3
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

  -- Always require 3 sequences to win
  UPDATE games
  SET
    status = 'playing',
    started_at = NOW(),
    sequences_required = 3
  WHERE id = p_game_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
