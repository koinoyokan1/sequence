import { useEffect, useRef } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { motion } from 'framer-motion'
import { playTurnNotification } from '@/utils/sounds'

export function TurnIndicator() {
  const game = useGameStore(state => state.game)
  const players = useGameStore(state => state.players)
  const isMyTurn = useGameStore(state => state.isMyTurn)
  const prevIsMyTurn = useRef(isMyTurn)

  // Play sound when it becomes player's turn
  useEffect(() => {
    if (isMyTurn && !prevIsMyTurn.current) {
      playTurnNotification()
    }
    prevIsMyTurn.current = isMyTurn
  }, [isMyTurn])

  if (!game || players.length === 0) return null

  // Only show when it's the player's turn
  if (!isMyTurn) return null

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold text-lg"
        >
          Your Turn!
        </motion.div>
      </div>
    </div>
  )
}
