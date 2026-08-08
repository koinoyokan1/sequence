import { motion } from 'framer-motion'
import { BoardDesktop } from './BoardDesktop'
import { CardHandDesktop } from './CardHandDesktop'
import { CollapsibleHeaderDesktop } from './CollapsibleHeaderDesktop'
import { TurnIndicator } from '../TurnIndicator'

interface GameLayoutDesktopProps {
  isGameOver: boolean
  winnerTeam: number | null
}

/**
 * Desktop game layout orchestrator
 * - Spacious horizontal layout
 * - Larger components with more details
 * - Sidebar chat
 */
export function GameLayoutDesktop({ isGameOver, winnerTeam }: GameLayoutDesktopProps) {

  return (
    <div className="min-h-screen bg-gray-900 p-2 pb-44">
      <div className="max-w-screen-xl mx-auto">
        {/* Game Over Banner - Desktop */}
        {isGameOver && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl p-6 text-center shadow-2xl"
          >
            <h1 className="text-4xl font-bold text-white mb-2">🎉 Game Over! 🎉</h1>
            <p className="text-2xl text-white">
              Team {winnerTeam === 1 ? 'Red' : 'Green'} Wins!
            </p>
          </motion.div>
        )}

        {/* Collapsible Header with Chat */}
        <CollapsibleHeaderDesktop />

        {/* Turn Indicator */}
        {!isGameOver && <TurnIndicator />}

        {/* Board */}
        <div className="mt-1">
          <BoardDesktop />
        </div>

        {/* Card Hand - Below board */}
        {!isGameOver && (
          <div className="mt-4">
            <CardHandDesktop />
          </div>
        )}
      </div>
    </div>
  )
}
