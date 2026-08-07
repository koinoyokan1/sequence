import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, signInAnonymously } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/SEO'
import { validatePlayerName } from '@/utils/validators'
import { formatInviteCode, isValidInviteCode } from '@/utils/invite-code'

export function JoinGame() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(1)
  
  const setGameId = useGameStore(state => state.setGameId)
  const setPlayerId = useGameStore(state => state.setPlayerId)
  const setGame = useGameStore(state => state.setGame)
  const setBoardState = useGameStore(state => state.setBoardState)
  
  const addToast = useUIStore(state => state.addToast)
  const setLoading = useUIStore(state => state.setLoading)
  
  useEffect(() => {
    // Ensure user is signed in
    signInAnonymously().catch(console.error)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const nameValidation = validatePlayerName(playerName)
    if (!nameValidation.valid) {
      addToast(nameValidation.error || 'Invalid name', 'error')
      return
    }
    
    const formattedCode = formatInviteCode(inviteCode)
    if (!isValidInviteCode(formattedCode)) {
      addToast('Invalid invite code', 'error')
      return
    }
    
    setLoading(true, 'Joining game...')
    
    try {
      // Join game via RPC
      const { data, error } = await supabase.rpc('join_game', {
        p_invite_code: formattedCode,
        player_name: playerName.trim(),
        team: selectedTeam,
      })

      if (error) throw error

      // RPC returns an array with one row
      const result = (data as any)?.[0]

      if (!result) throw new Error('Failed to join game')
      
      // Fetch complete game data
      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('id', result.game_id)
        .single()
      
      // Update store
      setGameId(result.game_id)
      setPlayerId(result.player_id)
      setGame(gameData as any)
      setBoardState((gameData as any).board_state)
      
      addToast('Joined game successfully!', 'success')
      navigate(`/lobby/${result.game_id}`)
    } catch (error: any) {
      console.error('Error joining game:', error)
      addToast(error.message || 'Failed to join game', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <SEO
        title="Join Game - Sequence Online"
        description="Join a Sequence game with your friends. Enter your game code and start playing this strategic multiplayer board game."
        image="/og-images/join.png"
        url="/sequence/join"
        type="website"
      />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Join Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game Code
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-2xl text-center font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={6}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={20}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Choose Team
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedTeam(1)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 1
                    ? 'border-team-1 bg-team-1 bg-opacity-20'
                    : 'border-gray-600 hover:border-team-1'
                }`}
              >
                <div className="text-2xl mb-2">🔴</div>
                <div className="text-white font-semibold">Team Red</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeam(2)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedTeam === 2
                    ? 'border-team-2 bg-team-2 bg-opacity-20'
                    : 'border-gray-600 hover:border-team-2'
                }`}
              >
                <div className="text-2xl mb-2">🔵</div>
                <div className="text-white font-semibold">Team Blue</div>
              </button>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full">
            Join Game
          </Button>
        </form>
      </div>
    </div>
    </>
  )
}
