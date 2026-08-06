import { useParams } from 'react-router-dom'
import { LobbyRoom } from '@/components/lobby/LobbyRoom'

export function Lobby() {
  const { gameId } = useParams()
  
  if (!gameId) {
    return <div className="text-white">Invalid game ID</div>
  }
  
  return <LobbyRoom />
}
