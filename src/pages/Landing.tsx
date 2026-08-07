import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SEO } from '@/components/SEO'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'

export function Landing() {
  const navigate = useNavigate()
  const [hasActiveGame, setHasActiveGame] = useState(false)
  const gameId = useGameStore(state => state.gameId)
  const playerId = useGameStore(state => state.playerId)

  useEffect(() => {
    // Check if user has an active game in localStorage
    async function checkActiveGame() {
      if (!gameId || !playerId) {
        setHasActiveGame(false)
        return
      }

      // Verify the game still exists and is active
      const { data: gameData } = await supabase
        .from('games')
        .select('status')
        .eq('id', gameId)
        .single()

      // Check if player still exists in the game
      const { data: playerData } = await supabase
        .from('players')
        .select('id')
        .eq('id', playerId)
        .eq('game_id', gameId)
        .single()

      if (gameData && playerData) {
        setHasActiveGame(true)
      } else {
        // Game or player no longer exists, clear localStorage
        localStorage.removeItem('sequence_game_id')
        localStorage.removeItem('sequence_player_id')
        setHasActiveGame(false)
      }
    }

    checkActiveGame()
  }, [gameId, playerId])

  const handleResumeGame = () => {
    if (!gameId) return

    // Check game status and redirect to appropriate page
    supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single()
      .then(({ data }) => {
        if (data?.status === 'playing') {
          navigate(`/game/${gameId}`)
        } else if (data?.status === 'waiting') {
          navigate(`/lobby/${gameId}`)
        }
      })
  }

  return (
    <>
      <SEO
        title="Sequence - Free Online Multiplayer Board Game"
        description="Play Sequence online for free! Strategic multiplayer board game with real-time gameplay. Create games, invite friends, and compete in this classic card-based strategy game. No download required."
        image="/og-images/landing.png"
        url="/sequence/"
        type="game"
      />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            SEQUENCE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            The Strategic Card & Board Game
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="space-y-4 mb-12"
        >
          {hasActiveGame && (
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleResumeGame}
                className="w-full md:w-auto px-12 bg-green-600 hover:bg-green-700"
              >
                🎮 Resume Game
              </Button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button size="lg" className="w-full md:w-auto px-12">
                Create Game
              </Button>
            </Link>
            <Link to="/join">
              <Button size="lg" variant="secondary" className="w-full md:w-auto px-12">
                Join Game
              </Button>
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-800 rounded-xl p-8 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <div className="text-left text-gray-300 space-y-3">
            <p>🎯 Get 5 chips in a row to make a sequence</p>
            <p>🃏 Play cards to place chips on matching board positions</p>
            <p>👁️ One-eyed Jacks remove opponent chips</p>
            <p>👁️👁️ Two-eyed Jacks are wild cards</p>
            <p>🏆 First to the required sequences wins!</p>
          </div>
        </motion.div>
      </div>
    </div>
    </>
  )
}
