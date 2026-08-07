import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, signInAnonymously } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/SEO'
import { validatePlayerName } from '@/utils/validators'
import { createInitialBoard } from '@/lib/game-logic/board'
import { createTwoDecks, shuffleDeck } from '@/lib/game-logic/cards'

export function CreateGame() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
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
    
    const validation = validatePlayerName(playerName)
    if (!validation.valid) {
      addToast(validation.error || 'Invalid name', 'error')
      return
    }
    
    setLoading(true, 'Creating game...')
    
    try {
      // Create initial board
      const boardState = createInitialBoard()
      
      // Create and shuffle deck
      const deck = shuffleDeck(createTwoDecks())
      
      // Create game via RPC
      const { data, error } = await supabase.rpc('create_game', {
        player_name: playerName.trim(),
        team: selectedTeam,
      })

      if (error) throw error

      // RPC returns an array with one row
      const result = (data as any)?.[0]

      if (!result) throw new Error('Failed to create game')
      
      // Update game with board state
      await supabase
        .from('games')
        .update({ board_state: boardState })
        .eq('id', result.game_id)
      
      // Create game deck
      await supabase
        .from('game_decks')
        .insert({
          game_id: result.game_id,
          draw_pile: deck,
          discard_pile: [],
        })
      
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
      setBoardState(boardState)
      
      addToast('Game created successfully!', 'success')
      navigate(`/lobby/${result.game_id}`)
    } catch (error: any) {
      console.error('Error creating game:', error)
      addToast(error.message || 'Failed to create game', 'error')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <SEO
        title="Create Game - Sequence Online"
        description="Create a new Sequence game and invite your friends. Choose your team and start playing this strategic multiplayer board game instantly."
        image="/og-images/create.png"
        url="/sequence/create"
        type="website"
      />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Create Game</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="text-2xl mb-2">🟢</div>
                <div className="text-white font-semibold">Team Green</div>
              </button>
            </div>
          </div>
          
          <Button type="submit" size="lg" className="w-full">
            Create Game
          </Button>
        </form>
      </div>
    </div>
    </>
  )
}
