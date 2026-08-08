import { motion } from 'framer-motion'
import { useCardHandLogic } from '../common/useCardHandLogic'
import { useGameActions } from '@/hooks/useGameActions'
import { PlayingCard } from '@/components/cards/PlayingCard'
import { Button } from '@/components/ui/Button'

/**
 * Desktop-optimized card hand component
 * - Larger cards with hover effects
 * - Spacious layout
 * - Full discard button text
 */
export function CardHandDesktop() {
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
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full"
    >
      <div className="mx-auto">
        {/* Discard Button - Desktop with full text */}
        {canDiscard && isMyTurn && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-1"
          >
            <Button
              variant="danger"
              size="sm"
              onClick={() => selectedCard && discardCard(selectedCard)}
            >
              {isDead
                ? '💀 Discard Dead Card'
                : 'Discard (No moves)'}
            </Button>
          </motion.div>
        )}

        {/* Cards - Desktop centered with hover effects */}
        <div className="flex justify-center items-end space-x-2">
          {myHand.map((card) => {
            const cardIsDead = getCardDeadStatus(card)
            return (
              <motion.div
                key={card.id}
                className="relative"
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {cardIsDead && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 z-10 bg-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-lg"
                  >
                    💀
                  </motion.div>
                )}
                <PlayingCard
                  card={card}
                  selected={selectedCard?.id === card.id}
                  disabled={!isMyTurn}
                  onClick={() => handleCardClick(card)}
                  size="md"
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
