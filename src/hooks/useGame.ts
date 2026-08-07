import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import type { Card, Position } from '@/types/game'
import { validateMove } from '@/lib/game-logic/moves'
import { placeChip, removeChip } from '@/lib/game-logic/board'
import { detectSequences, hasWon } from '@/lib/game-logic/sequence'
import { removeCardFromHand, drawCardWithReshuffle, addToDiscardPile } from '@/lib/game-logic/cards'
import { playCardPlaceSound, playWinSound } from '@/utils/sounds'
// import { detectAmbiguousSequence } from '@/lib/game-logic/sequence-choice' // TODO: Use for sequence choice feature

export function useGame() {
  const gameId = useGameStore(state => state.gameId)
  const playerId = useGameStore(state => state.playerId)
  const game = useGameStore(state => state.game)
  const players = useGameStore(state => state.players)
  const myHand = useGameStore(state => state.myHand)
  const boardState = useGameStore(state => state.boardState)
  const sequences = useGameStore(state => state.sequences)
  const selectedCard = useGameStore(state => state.selectedCard)
  const isMyTurn = useGameStore(state => state.isMyTurn)
  
  const setMyHand = useGameStore(state => state.setMyHand)
  const setBoardState = useGameStore(state => state.setBoardState)
  const setSequences = useGameStore(state => state.setSequences)
  const setSelectedCard = useGameStore(state => state.setSelectedCard)
  const setHighlightedPositions = useGameStore(state => state.setHighlightedPositions)
  // const setSequenceChoice = useGameStore(state => state.setSequenceChoice) // TODO: Use for sequence choice feature

  const addToast = useUIStore(state => state.addToast)
  const setLoading = useUIStore(state => state.setLoading)
  
  const playCard = useCallback(async (position: Position) => {
    console.log('playCard debug:', { gameId, playerId, game: !!game, selectedCard: !!selectedCard, isMyTurn })

    if (!gameId || !playerId || !game || !selectedCard || !isMyTurn) {
      addToast('Cannot play card right now', 'error')
      return
    }

    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) return

    // Validate move
    const validation = validateMove(boardState, selectedCard, position, currentPlayer.team, sequences)

    if (!validation.valid) {
      addToast(validation.reason || 'Invalid move', 'error')
      return
    }

    // Calculate new state before any async operations
    const newBoard = validation.moveType === 'place'
      ? placeChip(boardState, position.x, position.y, currentPlayer.team)
      : removeChip(boardState, position.x, position.y)

    const newHand = removeCardFromHand(myHand, selectedCard.id)
    const newSequences = detectSequences(newBoard)
    const playerCount = players.length
    const sequencesRequired = game.sequences_required
    const gameOver = hasWon(newSequences, currentPlayer.team, sequencesRequired)
    const nextTurn = (game.current_turn + 1) % playerCount

    // OPTIMISTIC UPDATE: Update UI immediately
    setBoardState(newBoard)
    setSequences(newSequences)
    setSelectedCard(null)
    setHighlightedPositions([])
    playCardPlaceSound()

    // Show loading indicator for background sync
    setLoading(true, 'Syncing...')

    try {
      // Fetch deck data to draw new card
      const { data: deckData } = await supabase
        .from('game_decks')
        .select('draw_pile, discard_pile')
        .eq('game_id', gameId)
        .single()

      let drawnCard: Card | null = null
      let reshuffleMessage = ''
      let newDrawPile: Card[] = []
      let newDiscardPile: Card[] = []

      if (deckData && 'draw_pile' in deckData && 'discard_pile' in deckData) {
        const drawPile = (deckData.draw_pile as Card[]) || []
        const discardPile = (deckData.discard_pile as Card[]) || []

        // Add played card to discard pile
        const updatedDiscardPile = addToDiscardPile(discardPile, selectedCard)

        // Draw with reshuffle
        const result = drawCardWithReshuffle(drawPile, updatedDiscardPile)
        drawnCard = result.card
        newDrawPile = result.newDrawPile
        newDiscardPile = result.newDiscardPile

        if (result.reshuffled) {
          reshuffleMessage = 'Deck reshuffled! '
        }
      }

      // Add drawn card to hand
      const finalHand = drawnCard ? [...newHand, drawnCard] : newHand

      // Update hand optimistically
      setMyHand(finalHand)

      // SINGLE RPC CALL: Update everything in one transaction
      await supabase.rpc('play_card_optimized', {
        p_game_id: gameId,
        p_player_id: playerId,
        p_new_board_state: newBoard,
        p_new_sequences: newSequences,
        p_next_turn: nextTurn,
        p_game_over: gameOver,
        p_winner_team: gameOver ? currentPlayer.team : null,
        p_new_draw_pile: newDrawPile,
        p_new_discard_pile: newDiscardPile,
        p_new_hand: finalHand,
      })

      // Show success feedback
      if (gameOver) {
        playWinSound()
        addToast('You won! 🎉', 'success')
      } else if (reshuffleMessage) {
        addToast(reshuffleMessage + 'Card played!', 'info')
      }
    } catch (error) {
      console.error('Error playing card:', error)
      addToast('Failed to play card', 'error')

      // Revert optimistic updates on error
      setBoardState(boardState)
      setSequences(sequences)
      setMyHand(myHand)
      setSelectedCard(selectedCard)
    } finally {
      setLoading(false)
    }
  }, [gameId, playerId, game, selectedCard, isMyTurn, players, boardState, sequences, myHand,
      setBoardState, setSequences, setMyHand, setSelectedCard, setHighlightedPositions, addToast, setLoading])
  
  const discardCard = useCallback(async (card: Card) => {
    if (!gameId || !playerId || !game || !isMyTurn) {
      addToast('Cannot discard card right now', 'error')
      return
    }

    const currentPlayer = players.find(p => p.id === playerId)
    if (!currentPlayer) return

    setLoading(true, 'Discarding dead card...')

    try {
      // Remove card from hand
      const newHand = removeCardFromHand(myHand, card.id)

      // Draw new card from deck (with automatic reshuffle)
      const { data: deckData } = await supabase
        .from('game_decks')
        .select('draw_pile, discard_pile')
        .eq('game_id', gameId)
        .single()

      let drawnCard: Card | null = null
      let reshuffleMessage = ''

      if (deckData && 'draw_pile' in deckData && 'discard_pile' in deckData) {
        const drawPile = (deckData.draw_pile as Card[]) || []
        const discardPile = (deckData.discard_pile as Card[]) || []

        // Add discarded card to discard pile
        const updatedDiscardPile = addToDiscardPile(discardPile, card)

        // Draw with reshuffle
        const { card: newCard, newDrawPile, newDiscardPile, reshuffled } = drawCardWithReshuffle(
          drawPile,
          updatedDiscardPile
        )

        drawnCard = newCard

        if (reshuffled) {
          reshuffleMessage = 'Deck reshuffled! '
        }

        // Update deck
        await supabase
          .from('game_decks')
          .update({
            draw_pile: newDrawPile,
            discard_pile: newDiscardPile
          })
          .eq('game_id', gameId)
      }

      // Add drawn card to hand
      const finalHand = drawnCard ? [...newHand, drawnCard] : newHand

      // Get next turn
      const playerCount = players.length
      const nextTurn = (game.current_turn + 1) % playerCount

      // Update game turn
      await supabase.rpc('update_game_state', {
        p_game_id: gameId,
        p_board_state: boardState,
        p_sequences: sequences,
        p_next_turn: nextTurn,
        p_game_over: false,
        p_winner_team: null,
      })

      // Update player hand
      await supabase
        .from('player_hands')
        .update({ cards: finalHand })
        .eq('player_id', playerId)

      // Update local state
      setMyHand(finalHand)
      setSelectedCard(null)
      setHighlightedPositions([])

      addToast(reshuffleMessage + 'Dead card discarded and replaced', 'info')
    } catch (error) {
      console.error('Error discarding card:', error)
      addToast('Failed to discard card', 'error')
    } finally {
      setLoading(false)
    }
  }, [gameId, playerId, game, isMyTurn, players, myHand, boardState, sequences,
      setMyHand, setSelectedCard, setHighlightedPositions, addToast, setLoading])

  return {
    playCard,
    discardCard,
  }
}
