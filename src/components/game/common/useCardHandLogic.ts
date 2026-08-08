import { useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import type { Card, Position } from '@/types/game'
import { findCardPositions, findOpponentChips } from '@/lib/game-logic/board'
import { getJackType } from '@/lib/game-logic/cards'
import { isCardDead } from '@/lib/game-logic/moves'
import { canRemoveChip } from '@/lib/game-logic/sequence'

/**
 * Common card hand logic - pure business logic for card selection and highlighting
 * Used by both mobile and desktop card hand components
 */
export function useCardHandLogic() {
  const myHand = useGameStore(state => state.myHand)
  const selectedCard = useGameStore(state => state.selectedCard)
  const setSelectedCard = useGameStore(state => state.setSelectedCard)
  const setHighlightedPositions = useGameStore(state => state.setHighlightedPositions)
  const boardState = useGameStore(state => state.boardState)
  const isMyTurn = useGameStore(state => state.isMyTurn)
  const players = useGameStore(state => state.players)
  const playerId = useGameStore(state => state.playerId)
  const sequences = useGameStore(state => state.sequences)

  const handleCardClick = useCallback((card: Card) => {
    if (!isMyTurn) return

    // Toggle selection
    if (selectedCard?.id === card.id) {
      setSelectedCard(null)
      setHighlightedPositions([])
      return
    }

    setSelectedCard(card)

    // Find valid positions for this card
    const jackType = getJackType(card)
    let positions: Position[] = []

    if (jackType === 'one-eyed') {
      // One-eyed jack: highlight opponent chips that can be removed
      const myPlayer = players.find(p => p.id === playerId)
      if (!myPlayer) return

      const opponentPositions = findOpponentChips(boardState, myPlayer.team)
      positions = opponentPositions.filter(pos =>
        canRemoveChip(boardState, pos.x, pos.y, sequences)
      )
    } else if (jackType === 'two-eyed') {
      // Two-eyed jack: highlight all empty positions
      positions = boardState.flatMap((row, y) =>
        row
          .map((cell, x) => ({ x, y, cell }))
          .filter(({ cell }) => cell.chip === null && !cell.isFreeSpace)
          .map(({ x, y }) => ({ x, y }))
      )
    } else {
      // Regular card: highlight matching card positions that are empty
      positions = findCardPositions(boardState, card).filter(
        pos => boardState[pos.y][pos.x].chip === null
      )
    }

    setHighlightedPositions(positions)
  }, [
    isMyTurn,
    selectedCard,
    boardState,
    players,
    playerId,
    sequences,
    setSelectedCard,
    setHighlightedPositions,
  ])

  const getCardDeadStatus = useCallback((card: Card) => {
    return isCardDead(boardState, card)
  }, [boardState])

  const canDiscardSelected = useCallback(() => {
    if (!selectedCard || !isMyTurn) return false
    
    const myPlayer = players.find(p => p.id === playerId)
    if (!myPlayer) return false

    const isDead = isCardDead(boardState, selectedCard)
    if (isDead) return true

    // Check if card has no valid moves
    const jackType = getJackType(selectedCard)
    
    if (jackType === 'one-eyed') {
      const opponentPositions = findOpponentChips(boardState, myPlayer.team)
      const removablePositions = opponentPositions.filter(pos =>
        canRemoveChip(boardState, pos.x, pos.y, sequences)
      )
      return removablePositions.length === 0
    }
    
    if (jackType === 'two-eyed') {
      const emptyPositions = boardState.flatMap((row) =>
        row
          .map((cell) => ({ cell, isEmpty: cell.chip === null && !cell.isFreeSpace }))
          .filter(({ isEmpty }) => isEmpty)
      )
      return emptyPositions.length === 0
    }
    
    const positions = findCardPositions(boardState, selectedCard)
    const availablePositions = positions.filter(
      pos => boardState[pos.y][pos.x].chip === null
    )
    return availablePositions.length === 0
  }, [selectedCard, isMyTurn, boardState, players, playerId, sequences])

  return {
    myHand,
    selectedCard,
    isMyTurn,
    handleCardClick,
    getCardDeadStatus,
    canDiscardSelected,
  }
}
