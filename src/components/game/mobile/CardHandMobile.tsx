import { motion } from 'framer-motion'
import { useCardHandLogic } from '../common/useCardHandLogic'
import { useGameActions } from '@/hooks/useGameActions'
import { PlayingCard } from '@/components/cards/PlayingCard'
import { Button } from '@/components/ui/Button'

/**
 * Mobile-optimized card hand component
 * - Smaller card spacing for mobile screens
 * - Touch-optimized interactions
 * - Compact layout
 */
export function CardHandMobile() {
  const {
    myHand,
    selectedCard,
    isMyTurn,
    handleCardClick,
    getCardDeadStatus,
    canDiscardSelected,
  } = useCardHandLogic()

  const { discardCard } = useGameActions()

  const canDiscard = canDiscardSelected()
  const isDead = selectedCard ? getCardDeadStatus(selectedCard) : false

  if (myHand.length === 0) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-12 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent p-3 pointer-events-none"
    >
      <div className="max-w-screen-xl mx-auto pointer-events-auto">
        {/* Discard Button - Mobile optimized */}
        {canDiscard && isMyTurn && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-2"
          >
            <Button
              variant="danger"
              size="sm"
              onClick={() => selectedCard && discardCard(selectedCard)}
              className="text-xs"
            >
              {isDead ? '💀 Discard Dead Card' : 'Discard (No moves)'}
            </Button>
            {isDead && (
              <p className="text-[10px] text-gray-400 mt-1">
                Both positions occupied
              </p>
            )}
          </motion.div>
        )}

        {/* Cards - Mobile horizontal scroll */}
        <div className="flex justify-start items-end space-x-1.5 overflow-x-auto pb-2 px-2 scrollbar-thin">
          {myHand.map((card) => {
            const cardIsDead = getCardDeadStatus(card)
            return (
              <div key={card.id} className="relative flex-shrink-0">
                {cardIsDead && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 z-10 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                  >
                    💀
                  </motion.div>
                )}
                <PlayingCard
                  card={card}
                  selected={selectedCard?.id === card.id}
                  disabled={!isMyTurn}
                  onClick={() => handleCardClick(card)}
                  size="sm"
                />
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
