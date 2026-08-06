import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { PlayerList } from './PlayerList'
import { Button } from '@/components/ui/Button'
import { useRealtime } from '@/hooks/useRealtime'

export function LobbyRoom() {
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)
  
  const gameId = useGameStore(state => state.gameId)
  const playerId = useGameStore(state => state.playerId)
  const game = useGameStore(state => state.game)
  const players = useGameStore(state => state.players)
  const setPlayers = useGameStore(state => state.setPlayers)
  
  const addToast = useUIStore(state => state.addToast)
  const setLoading = useUIStore(state => state.setLoading)
  
  // Setup realtime subscriptions
  useRealtime(gameId)
  
  // Fetch initial player list
  useEffect(() => {
    if (!gameId) return
    
    async function fetchPlayers() {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('position')
      
      if (data) {
        setPlayers(data as any)
      }
    }
    
    fetchPlayers()
  }, [gameId, setPlayers])
  
  // Redirect to game when it starts
  useEffect(() => {
    if (game?.status === 'playing') {
      navigate(`/game/${gameId}`)
    }
  }, [game?.status, gameId, navigate])
  
  const currentPlayer = players.find(p => p.id === playerId)
  const isHost = currentPlayer?.is_host || false
  const allReady = players.length > 1 && players.every(p => p.is_ready)
  
  const handleReadyToggle = async () => {
    if (!gameId || !playerId) return
    
    try {
      await supabase.rpc('ready_player', {
        p_game_id: gameId,
        p_player_id: playerId,
        ready: !isReady,
      })
      setIsReady(!isReady)
    } catch (error) {
      console.error('Error toggling ready:', error)
      addToast('Failed to update ready status', 'error')
    }
  }
  
  const handleStartGame = async () => {
    if (!gameId || !playerId || !isHost) return
    
    setLoading(true, 'Starting game...')
    
    try {
      await supabase.rpc('start_game', {
        p_game_id: gameId,
        p_player_id: playerId,
      })
    } catch (error: any) {
      console.error('Error starting game:', error)
      addToast(error.message || 'Failed to start game', 'error')
      setLoading(false)
    }
  }
  
  if (!game) {
    return <div className="text-white">Loading...</div>
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <div className="text-gray-400">
            Share this code with friends:
          </div>
          <div className="text-4xl font-mono font-bold text-primary-400 my-4">
            {game.invite_code}
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Players ({players.length}/4)
          </h2>
          <PlayerList players={players} />
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button
            variant={isReady ? 'secondary' : 'primary'}
            onClick={handleReadyToggle}
            size="lg"
            className="w-full"
          >
            {isReady ? 'Not Ready' : 'Ready'}
          </Button>
          
          {isHost && (
            <Button
              variant="primary"
              onClick={handleStartGame}
              disabled={!allReady}
              size="lg"
              className="w-full"
            >
              Start Game
            </Button>
          )}
          
          {isHost && !allReady && (
            <p className="text-sm text-gray-400 text-center">
              Waiting for all players to be ready...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
