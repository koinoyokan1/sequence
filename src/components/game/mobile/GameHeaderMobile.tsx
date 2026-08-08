import { motion } from 'framer-motion'
import { useGameHeaderLogic } from '../common/useGameHeaderLogic'

/**
 * Mobile-optimized game header component
 * - Compact vertical layout
 * - Smaller text sizes
 * - Simplified display for small screens
 */
export function GameHeaderMobile() {
  const headerData = useGameHeaderLogic()
  
  if (!headerData) return null
  
  const { team1, team2, inviteCode } = headerData
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-800 rounded-lg p-3 shadow-lg mb-3"
    >
      {/* Compact Header for Mobile */}
      <div className="flex flex-col space-y-2">
        {/* Game Code - Centered */}
        <div className="text-center">
          <div className="text-[10px] text-gray-400">Code</div>
          <div className="text-xl font-mono font-bold text-primary-400">
            {inviteCode}
          </div>
        </div>
        
        {/* Teams - Side by side */}
        <div className="flex justify-between items-center">
          {/* Team 1 - Compact */}
          <div className="text-left flex-1">
            <h3 className="text-xs font-bold text-team-1">Red</h3>
            <div className="text-[10px] text-gray-400 truncate">
              {team1.playerNames}
            </div>
            <div className="text-lg font-bold text-white">
              {team1.sequenceCount}/{team1.sequencesRequired}
            </div>
          </div>
          
          {/* VS Separator */}
          <div className="px-2 text-gray-500 text-xs font-bold">VS</div>
          
          {/* Team 2 - Compact */}
          <div className="text-right flex-1">
            <h3 className="text-xs font-bold text-team-2">Green</h3>
            <div className="text-[10px] text-gray-400 truncate">
              {team2.playerNames}
            </div>
            <div className="text-lg font-bold text-white">
              {team2.sequenceCount}/{team2.sequencesRequired}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
