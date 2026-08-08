import { useGameStore } from '@/stores/gameStore'

/**
 * Common game header logic - pure business logic for displaying game state
 * Used by both mobile and desktop header components
 */
export function useGameHeaderLogic() {
  const game = useGameStore(state => state.game)
  const players = useGameStore(state => state.players)
  const sequences = useGameStore(state => state.sequences)
  
  if (!game) {
    return null
  }
  
  const team1Players = players.filter(p => p.team === 1)
  const team2Players = players.filter(p => p.team === 2)
  const team1Sequences = sequences.filter(s => s.team === 1).length
  const team2Sequences = sequences.filter(s => s.team === 2).length
  
  return {
    game,
    team1: {
      players: team1Players,
      sequenceCount: team1Sequences,
      sequencesRequired: game.sequences_required,
      playerNames: team1Players.map(p => p.name).join(', '),
    },
    team2: {
      players: team2Players,
      sequenceCount: team2Sequences,
      sequencesRequired: game.sequences_required,
      playerNames: team2Players.map(p => p.name).join(', '),
    },
    inviteCode: game.invite_code,
  }
}
