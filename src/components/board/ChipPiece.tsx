import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ChipPieceProps {
  team: number
  inSequence?: boolean
}

export function ChipPiece({ team, inSequence }: ChipPieceProps) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      exit={{ scale: 0 }}
      className={clsx(
        'w-10 h-10 rounded-full shadow-lg flex items-center justify-center',
        'border-4',
        team === 1 ? 'bg-team-1 border-red-700' : 'bg-team-2 border-green-700',
        inSequence && 'animate-sequence-glow'
      )}
    >
      <div className="w-6 h-6 rounded-full bg-white/20" />
    </motion.div>
  )
}
