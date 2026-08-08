import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { BoardCell as BoardCellType } from '@/types/game'
import { SUIT_SYMBOLS } from '@/lib/constants'
import { isPositionInSequence } from '@/lib/game-logic/sequence'
import { useGameStore } from '@/stores/gameStore'

interface BoardCellProps {
  cell: BoardCellType
  highlighted?: boolean
  onClick?: () => void
}

export function BoardCell({ cell, highlighted, onClick }: BoardCellProps) {
  const sequences = useGameStore(state => state.sequences)
  const isMyTurn = useGameStore(state => state.isMyTurn)
  const inSequence = isPositionInSequence(sequences, cell.x, cell.y)

  const isRed = cell.card && (cell.card.suit === 'hearts' || cell.card.suit === 'diamonds')
  
  return (
    <motion.button
      whileHover={highlighted && isMyTurn ? { scale: 1.05 } : {}}
      onClick={onClick}
      disabled={!highlighted || !isMyTurn}
      className={clsx(
        'relative aspect-square rounded-lg transition-all duration-200',
        'flex items-center justify-center',
        'border-2',
        cell.isFreeSpace && 'bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-800',
        !cell.isFreeSpace && 'bg-gray-800 border-gray-700',
        highlighted && isMyTurn && 'ring-4 ring-primary-500 ring-opacity-50 cursor-pointer',
        !highlighted && 'cursor-default',
        inSequence && 'ring-2 ring-green-500'
      )}
    >
      {/* Free space marker */}
      {cell.isFreeSpace && (
        <div className="text-white font-bold text-[0.5rem] sm:text-xs leading-tight">FREE</div>
      )}
      
      {/* Card display - background changes to team color when chip is placed */}
      {!cell.isFreeSpace && cell.card && (
        <div className={clsx(
          'absolute inset-0 flex flex-col items-center justify-center p-0.5 sm:p-1 rounded overflow-hidden',
          !cell.chip && 'bg-white',
          cell.chip === 1 && 'bg-team-1 border-2 sm:border-4 border-red-800',
          cell.chip === 2 && 'bg-team-2 border-2 sm:border-4 border-green-800',
          inSequence && 'ring-2 sm:ring-4 ring-yellow-400'
        )}>
          <div className={clsx(
            'text-[0.5rem] sm:text-xs font-bold leading-tight',
            cell.chip
              ? 'text-white'
              : isRed ? 'text-red-600' : 'text-gray-900'
          )}>
            {cell.card.rank}
          </div>
          <div className={clsx(
            'text-sm sm:text-lg leading-none',
            cell.chip
              ? 'text-white'
              : isRed ? 'text-red-600' : 'text-gray-900'
          )}>
            {SUIT_SYMBOLS[cell.card.suit]}
          </div>
        </div>
      )}
      
      {/* Highlight overlay */}
      {highlighted && isMyTurn && (
        <div className="absolute inset-0 bg-primary-500 bg-opacity-30 rounded-lg animate-pulse" />
      )}
    </motion.button>
  )
}
