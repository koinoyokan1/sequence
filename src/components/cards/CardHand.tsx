import { useGameStore } from '@/stores/gameStore'
import { PlayingCard } from './PlayingCard'
import { findCardPositions } from '@/lib/game-logic/board'
import { getJackType } from '@/lib/game-logic/cards'
import { findEmptyPositions, findOpponentChips } from '@/lib/game-logic/board'
import { isCardPlayable } from '@/lib/game-logic/moves'
import { Button } from '@/components/ui/Button'
import { useGame } from '@/hooks/useGame'

export function CardHand() {
  const myHand = useGameStore(state => state.myHand)
  const selectedCard = useGameStore(state => state.selectedCard)
  const setSelectedCard = useGameStore(state => state.setSelectedCard)
  const setHighlightedPositions = useGameStore(state => state.setHighlightedPositions)
  const boardState = useGameStore(state => state.boardState)
  const isMyTurn = useGameStore(state => state.isMyTurn)
  const players = useGameStore(state => state.players)
  const playerId = useGameStore(state => state.playerId)
  const sequences = useGameStore(state => state.sequences)

  const { discardCard } = useGame()
  
  const handleCardClick = (card: typeof myHand[0]) => {
    if (!isMyTurn) return
    
    if (selectedCard?.id === card.id) {
      // Deselect
      setSelectedCard(null)
      setHighlightedPositions([])
    } else {
      // Select and highlight valid positions
      setSelectedCard(card)
      
      const jackType = getJackType(card)
      let positions
      
      if (jackType === 'one-eyed') {
        // Highlight opponent chips
        const currentPlayer = players.find(p => p.id === playerId)
        if (currentPlayer) {
          positions = findOpponentChips(boardState, currentPlayer.team)
        } else {
          positions = []
        }
      } else if (jackType === 'two-eyed') {
        // Highlight all empty positions
        positions = findEmptyPositions(boardState).filter(
          pos => !boardState[pos.y][pos.x].isFreeSpace
        )
      } else {
        // Highlight card positions
        positions = findCardPositions(boardState, card).filter(
          pos => boardState[pos.y][pos.x].chip === null
        )
      }
      
      setHighlightedPositions(positions)
    }
  }
  
  if (myHand.length === 0) {
    return null
  }

  const canDiscard = selectedCard && !isCardPlayable(boardState, selectedCard, sequences)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4">
      <div className="max-w-screen-xl mx-auto">
        {canDiscard && isMyTurn && (
          <div className="text-center mb-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => discardCard(selectedCard)}
            >
              Discard Card (No valid moves)
            </Button>
          </div>
        )}
        <div className="flex justify-center items-end space-x-2 overflow-x-auto pb-2">
          {myHand.map((card) => (
            <PlayingCard
              key={card.id}
              card={card}
              selected={selectedCard?.id === card.id}
              disabled={!isMyTurn}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
