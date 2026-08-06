import { useGameStore } from '@/stores/gameStore'

export function GameHeader() {
  const game = useGameStore(state => state.game)
  const players = useGameStore(state => state.players)
  const sequences = useGameStore(state => state.sequences)
  
  if (!game) return null
  
  const team1Players = players.filter(p => p.team === 1)
  const team2Players = players.filter(p => p.team === 2)
  const team1Sequences = sequences.filter(s => s.team === 1).length
  const team2Sequences = sequences.filter(s => s.team === 2).length
  
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg mb-4">
      <div className="flex justify-between items-center">
        {/* Team 1 */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-team-1 mb-2">Team Red</h3>
          <div className="text-sm text-gray-400 mb-2">
            {team1Players.map(p => p.name).join(', ')}
          </div>
          <div className="text-2xl font-bold text-white">
            {team1Sequences} / {game.sequences_required}
          </div>
          <div className="text-xs text-gray-500">Sequences</div>
        </div>
        
        {/* Game Code */}
        <div className="text-center">
          <div className="text-sm text-gray-400">Game Code</div>
          <div className="text-3xl font-mono font-bold text-primary-400">
            {game.invite_code}
          </div>
        </div>
        
        {/* Team 2 */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-team-2 mb-2">Team Blue</h3>
          <div className="text-sm text-gray-400 mb-2">
            {team2Players.map(p => p.name).join(', ')}
          </div>
          <div className="text-2xl font-bold text-white">
            {team2Sequences} / {game.sequences_required}
          </div>
          <div className="text-xs text-gray-500">Sequences</div>
        </div>
      </div>
    </div>
  )
}
