import { useParams } from 'react-router-dom'
import { LobbyRoom } from '@/components/lobby/LobbyRoom'
import { SEO } from '@/components/SEO'

export function Lobby() {
  const { gameId } = useParams()

  if (!gameId) {
    return <div className="text-white">Invalid game ID</div>
  }

  return (
    <>
      <SEO
        title="Game Lobby - Sequence Online"
        description="Waiting for players to join. Get ready to play Sequence with your friends in real-time!"
        image="/og-images/game.png"
        url="/sequence/lobby"
        type="website"
        noIndex={true}
      />
      <LobbyRoom />
    </>
  )
}
