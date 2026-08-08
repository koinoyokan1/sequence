import { motion } from 'framer-motion'
import { useBoardLogic } from '../common/useBoardLogic'
import { useGameActions } from '@/hooks/useGameActions'
import { BoardCell } from '@/components/board/BoardCell'

/**
 * Mobile-optimized board component
 * - Compact grid spacing
 * - Touch-optimized interactions
 * - Smaller padding for mobile screens
 */
export function BoardMobile() {
  const { boardState, isHighlighted } = useBoardLogic()
  const { playCard } = useGameActions()
  
  if (boardState.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">Loading board...</p>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-10 gap-1 p-2 bg-gray-900 rounded-lg shadow-2xl mx-auto"
      style={{ maxWidth: '100vw' }}
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
