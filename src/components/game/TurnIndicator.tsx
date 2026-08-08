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

  return (
    <div className="h-10 flex items-center justify-center">
      {isMyTurn && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="px-4 py-1 bg-primary-600 text-white rounded-lg font-semibold text-base shadow-lg"
          >
            Your Turn!
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
