import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { Card } from '@/types/game'
import { SUIT_SYMBOLS } from '@/lib/constants'
import { getJackType } from '@/lib/game-logic/cards'

interface PlayingCardProps {
  card: Card
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function PlayingCard({ card, selected, disabled, onClick, size = 'md' }: PlayingCardProps) {
  const sizeClasses = {
    sm: 'w-12 h-16 text-xs',
    md: 'w-16 h-24 text-sm',
    lg: 'w-20 h-28 text-base',
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const jackType = getJackType(card)
  
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -8 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-lg bg-white shadow-lg transition-all duration-200 relative',
        'flex flex-col items-center justify-between p-2',
        sizeClasses[size],
        selected && 'ring-4 ring-primary-500 transform -translate-y-4',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-xl cursor-pointer'
      )}
    >
      <div className={clsx('font-bold', isRed ? 'text-red-600' : 'text-gray-900')}>
        {card.rank}
      </div>
      <div className={clsx('text-2xl', isRed ? 'text-red-600' : 'text-gray-900')}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      {jackType !== 'none' && (
        <div className={clsx('text-[0.5rem] font-bold', isRed ? 'text-red-600' : 'text-gray-900')}>
          {jackType === 'one-eyed' ? 'REMOVE' : 'WILD'}
        </div>
      )}
      {jackType === 'none' && (
        <div className={clsx('font-bold', isRed ? 'text-red-600' : 'text-gray-900')}>
          {card.rank}
        </div>
      )}
    </motion.button>
  )
}
