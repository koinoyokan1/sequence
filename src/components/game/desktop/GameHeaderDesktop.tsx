import { motion } from 'framer-motion'
import { useGameHeaderLogic } from '../common/useGameHeaderLogic'

/**
 * Desktop-optimized game header component
 * - Full horizontal layout
 * - Larger text and spacing
 * - Complete player information
 */
export function GameHeaderDesktop() {
  const headerData = useGameHeaderLogic()
  
  if (!headerData) return null
  
  const { team1, team2, inviteCode } = headerData
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-800 rounded-lg p-6 shadow-lg mb-4"
    >
      <div className="flex justify-between items-center">
        {/* Team 1 - Full layout */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-team-1 mb-2">Team Red</h3>
          <div className="text-sm text-gray-400 mb-2">
            {team1.playerNames}
          </div>
          <div className="text-2xl font-bold text-white">
            {team1.sequenceCount} / {team1.sequencesRequired}
          </div>
          <div className="text-xs text-gray-500">Sequences</div>
        </div>
        
        {/* Game Code - Centered */}
        <div className="text-center">
          <div className="text-sm text-gray-400">Game Code</div>
          <div className="text-3xl font-mono font-bold text-primary-400">
            {inviteCode}
          </div>
        </div>
        
        {/* Team 2 - Full layout */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-team-2 mb-2">Team Green</h3>
          <div className="text-sm text-gray-400 mb-2">
            {team2.playerNames}
          </div>
          <div className="text-2xl font-bold text-white">
            {team2.sequenceCount} / {team2.sequencesRequired}
          </div>
          <div className="text-xs text-gray-500">Sequences</div>
        </div>
      </div>
    </motion.div>
  )
}
