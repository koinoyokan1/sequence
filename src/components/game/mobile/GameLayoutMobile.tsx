import { motion } from 'framer-motion'
import { BoardMobile } from './BoardMobile'
import { CardHandMobile } from './CardHandMobile'
import { CollapsibleHeaderMobile } from './CollapsibleHeaderMobile'
import { TurnIndicator } from '../TurnIndicator'

interface GameLayoutMobileProps {
  isGameOver: boolean
  winnerTeam: number | null
}

/**
 * Mobile game layout orchestrator
 * - Vertical stacking of components
 * - Optimized spacing for small screens
 * - Touch-friendly interactions
 */
export function GameLayoutMobile({ isGameOver, winnerTeam }: GameLayoutMobileProps) {

  return (
    <div className="min-h-screen bg-gray-900 p-1 pb-36">
      <div className="max-w-screen-xl mx-auto">
        {/* Game Over Banner - Mobile */}
        {isGameOver && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-3 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-4 text-center shadow-xl"
          >
            <h1 className="text-2xl font-bold text-white mb-1">🎉 Game Over! 🎉</h1>
            <p className="text-lg text-white">
              Team {winnerTeam === 1 ? 'Red' : 'Green'} Wins!
            </p>
          </motion.div>
        )}

        {/* Collapsible Header with Chat */}
        <CollapsibleHeaderMobile />

        {/* Turn Indicator */}
        {!isGameOver && <TurnIndicator />}

        {/* Board */}
        <div className="mt-1">
          <BoardMobile />
        </div>
      </div>
      
      {/* Card Hand - Fixed at bottom */}
      {!isGameOver && <CardHandMobile />}
    </div>
  )
}
