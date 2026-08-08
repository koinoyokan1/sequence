import { motion } from 'framer-motion'
import { useBoardLogic } from '../common/useBoardLogic'
import { useGameActions } from '@/hooks/useGameActions'
import { BoardCell } from '@/components/board/BoardCell'

/**
 * Desktop-optimized board component
 * - Larger grid spacing
 * - Hover effects
 * - Generous padding
 */
export function BoardDesktop() {
  const { boardState, isHighlighted } = useBoardLogic()
  const { playCard } = useGameActions()
  
  if (boardState.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Loading board...</p>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-10 gap-1 p-2 bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl max-h-full mx-auto"
      style={{ aspectRatio: '1/1' }}
    >
      {boardState.map((row, y) =>
        row.map((cell, x) => (
          <BoardCell
            key={`${x}-${y}`}
            cell={cell}
            highlighted={isHighlighted(x, y)}
            onClick={() => playCard({ x, y })}
          />
        ))
      )}
    </motion.div>
  )
}
