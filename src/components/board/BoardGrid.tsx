import { useGameStore } from '@/stores/gameStore'
import { BoardCell } from './BoardCell'
import { useGame } from '@/hooks/useGame'

export function BoardGrid() {
  const boardState = useGameStore(state => state.boardState)
  const highlightedPositions = useGameStore(state => state.highlightedPositions)
  const { playCard } = useGame()
  
  const isHighlighted = (x: number, y: number) => {
    return highlightedPositions.some(pos => pos.x === x && pos.y === y)
  }
  
  if (boardState.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">Loading board...</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-10 gap-1 p-4 bg-gray-900 rounded-xl shadow-2xl max-w-4xl mx-auto">
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
    </div>
  )
}
