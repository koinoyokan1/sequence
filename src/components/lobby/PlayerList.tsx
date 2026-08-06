import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { Player } from '@/types/game'

interface PlayerListProps {
  players: Player[]
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player, index) => (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={clsx(
            'flex items-center justify-between p-3 rounded-lg',
            'bg-gray-700'
          )}
        >
          <div className="flex items-center space-x-3">
            <div
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                player.team === 1 ? 'bg-team-1' : 'bg-team-2'
              )}
            >
              {player.name[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold">{player.name}</div>
              <div className="text-sm text-gray-400">
                Team {player.team} {player.is_host && '• Host'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {player.is_ready ? (
              <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                Ready
              </span>
            ) : (
              <span className="px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-sm">
                Not Ready
              </span>
            )}
            {player.connected ? (
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            ) : (
              <div className="w-2 h-2 bg-gray-500 rounded-full" />
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
