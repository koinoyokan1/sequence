import { Position } from '@/types/game'
// import { Button } from '@/components/ui/Button' // Not needed, using button elements

interface SequenceChoiceModalProps {
  option1: Position[]
  option2: Position[]
  direction: string
  onSelect: (choice: 1 | 2) => void
}

export function SequenceChoiceModal({ option1, option2, direction, onSelect }: SequenceChoiceModalProps) {
  const formatPositions = (positions: Position[]) => {
    return positions.map(p => `(${p.x},${p.y})`).join(', ')
  }

  const getDirectionLabel = (dir: string) => {
    switch (dir) {
      case 'horizontal': return 'Horizontal'
      case 'vertical': return 'Vertical'
      case 'diagonal-down': return 'Diagonal ↘'
      case 'diagonal-up': return 'Diagonal ↗'
      default: return dir
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold text-white mb-4">
          🎯 Choose Your Sequence
        </h2>
        
        <p className="text-gray-300 mb-6">
          You've created 6 consecutive chips in a {getDirectionLabel(direction)} line!
          Choose which 5 chips to lock as your sequence:
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onSelect(1)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg mb-2">Option 1 (Leftmost)</div>
                <div className="text-sm opacity-90">
                  Positions: {formatPositions(option1)}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Leaves room to extend right →
                </div>
              </div>
              <div className="text-3xl">👈</div>
            </div>
          </button>

          <button
            onClick={() => onSelect(2)}
            className="w-full bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-lg mb-2">Option 2 (Rightmost)</div>
                <div className="text-sm opacity-90">
                  Positions: {formatPositions(option2)}
                </div>
                <div className="text-xs opacity-75 mt-1">
                  Leaves room to extend left ←
                </div>
              </div>
              <div className="text-3xl">👉</div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <strong>Note:</strong> All 6 chips are protected from removal, but only the 5 you choose 
            will count as the completed sequence. Choose strategically based on where you want to 
            extend to 9 chips for a double sequence!
          </p>
        </div>
      </div>
    </div>
  )
}
