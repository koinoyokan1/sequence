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
    <div className="h-screen bg-gray-900 p-1 overflow-hidden flex flex-col">
      <div className="max-w-screen-xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        {/* Game Over Banner - Desktop */}
        {isGameOver && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-3 text-center shadow-2xl"
          >
            <h1 className="text-2xl font-bold text-white mb-1">🎉 Game Over! 🎉</h1>
            <p className="text-lg text-white">
              Team {winnerTeam === 1 ? 'Red' : 'Green'} Wins!
            </p>
          </motion.div>
        )}

        {/* Collapsible Header with Chat */}
        <CollapsibleHeaderDesktop />

        {/* Turn Indicator */}
        {!isGameOver && <TurnIndicator />}

        {/* Board */}
        <div className="mt-1 flex-1 flex items-center justify-center min-h-0">
          <BoardDesktop />
        </div>

        {/* Card Hand - Below board */}
        {!isGameOver && (
          <div className="mt-2 pb-2">
            <CardHandDesktop />
          </div>
        )}
      </div>
    </div>
  )
}
