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
    sm: 'w-12 h-16',
    md: 'w-16 h-24',
    lg: 'w-20 h-28',
  }

  const textSizeClasses = {
    sm: {
      rank: 'text-[0.625rem]', // 10px
      suit: 'text-base',        // 16px
      label: 'text-[0.4rem]',   // 6.4px
    },
    md: {
      rank: 'text-xs',          // 12px
      suit: 'text-2xl',         // 24px
      label: 'text-[0.5rem]',   // 8px
    },
    lg: {
      rank: 'text-sm',          // 14px
      suit: 'text-3xl',         // 30px
      label: 'text-[0.6rem]',   // 9.6px
    },
  }

  const paddingClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-2.5',
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const jackType = getJackType(card)
  const textSizes = textSizeClasses[size]

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -8 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'rounded-lg bg-white shadow-lg transition-all duration-200 relative',
        'flex flex-col items-center justify-between',
        sizeClasses[size],
        paddingClasses[size],
        selected && 'ring-4 ring-primary-500 transform -translate-y-4',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:shadow-xl cursor-pointer'
      )}
    >
      <div className={clsx('font-bold leading-none', textSizes.rank, isRed ? 'text-red-600' : 'text-gray-900')}>
        {card.rank}
      </div>
      <div className={clsx('leading-none', textSizes.suit, isRed ? 'text-red-600' : 'text-gray-900')}>
        {SUIT_SYMBOLS[card.suit]}
      </div>
      {jackType !== 'none' && (
        <div className={clsx('font-bold leading-none', textSizes.label, isRed ? 'text-red-600' : 'text-gray-900')}>
          {jackType === 'one-eyed' ? 'REMOVE' : 'WILD'}
        </div>
      )}
      {jackType === 'none' && (
        <div className={clsx('font-bold leading-none', textSizes.rank, isRed ? 'text-red-600' : 'text-gray-900')}>
          {card.rank}
        </div>
      )}
    </motion.button>
  )
}
