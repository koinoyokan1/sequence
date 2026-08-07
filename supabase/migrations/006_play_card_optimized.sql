-- Optimized function to play a card with all updates in a single transaction
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
RETURNS TABLE (success BOOLEAN) AS $$
BEGIN
  -- Update game state
  UPDATE games
  SET
    board_state = p_new_board_state,
    sequences = p_new_sequences,
    current_turn = p_next_turn,
    status = CASE WHEN p_game_over THEN 'finished'::game_status ELSE status END,
    finished_at = CASE WHEN p_game_over THEN NOW() ELSE finished_at END,
    winner_team = CASE WHEN p_game_over THEN p_winner_team ELSE winner_team END
  WHERE id = p_game_id;

  -- Update deck
  UPDATE game_decks
  SET
    draw_pile = p_new_draw_pile,
    discard_pile = p_new_discard_pile
  WHERE game_id = p_game_id;

  -- Update player hand
  UPDATE player_hands
  SET cards = p_new_hand
  WHERE player_id = p_player_id;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
