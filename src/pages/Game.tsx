import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useRealtime } from '@/hooks/useRealtime'
import { BoardGrid } from '@/components/board/BoardGrid'
import { CardHand } from '@/components/cards/CardHand'
import { GameHeader } from '@/components/game/GameHeader'
import { TurnIndicator } from '@/components/game/TurnIndicator'
import { HAND_SIZES } from '@/lib/constants'
import { dealCards } from '@/lib/game-logic/cards'

export function Game() {
  const { gameId } = useParams()
  const navigate = useNavigate()

  const playerId = useGameStore(state => state.playerId)
  const game = useGameStore(state => state.game)
  const setGameId = useGameStore(state => state.setGameId)
  const players = useGameStore(state => state.players)
  const myHand = useGameStore(state => state.myHand)
  const setGame = useGameStore(state => state.setGame)
  const setPlayers = useGameStore(state => state.setPlayers)
  const setMyHand = useGameStore(state => state.setMyHand)
  const setBoardState = useGameStore(state => state.setBoardState)
  
  // Set gameId from URL
  useEffect(() => {
    if (gameId) {
      setGameId(gameId)
    }
  }, [gameId, setGameId])

  // Setup realtime subscriptions
  useRealtime(gameId || null)

  // Fetch game data and initialize
  useEffect(() => {
    if (!gameId) return
    
    async function fetchGameData() {
      // Fetch game
      const { data: gameData } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()
      
      if (gameData) {
        setGame(gameData as any)
        setBoardState((gameData as any).board_state)
      }
      
      // Fetch players
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .order('position')
      
      if (playersData) {
        setPlayers(playersData as any)
      }
      
      // Fetch my hand
      if (playerId) {
        const { data: handData } = await supabase
          .from('player_hands')
          .select('cards')
          .eq('player_id', playerId)
          .single()
        
        if (handData) {
          setMyHand((handData as any).cards)
        }
      }
    }
    
    fetchGameData()
  }, [gameId, playerId, setGame, setPlayers, setMyHand, setBoardState])
  
  // Deal initial cards when game starts (only host deals to prevent race condition)
  useEffect(() => {
    if (!game || !playerId || game.status !== 'playing' || myHand.length > 0) return

    // Only the player at position 0 should deal cards
    const myPlayer = players.find(p => p.id === playerId)
    if (!myPlayer || myPlayer.position !== 0) {
      // Non-host players just wait and refetch their hand
      const fetchHand = async () => {
        const { data: handData } = await supabase
          .from('player_hands')
          .select('cards')
          .eq('player_id', playerId)
          .single()

        if (handData && (handData as any).cards.length > 0) {
          setMyHand((handData as any).cards)
        } else {
          // Retry after a delay if cards haven't been dealt yet
          setTimeout(fetchHand, 1000)
        }
      }
      fetchHand()
      return
    }

    async function dealInitialCards() {
      try {
        const playerCount = players.length
        const cardsPerPlayer = HAND_SIZES[playerCount] || 6

        // Get deck
        const { data: deckData } = await supabase
          .from('game_decks')
          .select('draw_pile')
          .eq('game_id', gameId)
          .single()

        if (!deckData?.draw_pile || deckData.draw_pile.length < 104) return // Already dealt

        // Deal cards
        const { hands, remainingDeck } = dealCards(
          deckData.draw_pile as any,
          playerCount,
          cardsPerPlayer
        )

        // Update deck
        await supabase
          .from('game_decks')
          .update({ draw_pile: remainingDeck })
          .eq('game_id', gameId)

        // Update each player's hand
        for (let i = 0; i < players.length; i++) {
          await supabase
            .from('player_hands')
            .update({ cards: hands[i] })
            .eq('player_id', players[i].id)
        }

        // Update local state
        const myPosition = players.find(p => p.id === playerId)?.position
        if (myPosition !== undefined && hands[myPosition]) {
          setMyHand(hands[myPosition])
        }
      } catch (error) {
        console.error('Error dealing initial cards:', error)
      }
    }

    dealInitialCards()
  }, [game, playerId, players, myHand.length, gameId, setMyHand])
  
  if (!gameId || !game) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    )
  }
  
  const isGameOver = game.status === 'finished'
  const winnerTeam = game.winner_team
  
  return (
    <div className="min-h-screen bg-gray-900 p-4 pb-32">
      <div className="max-w-screen-xl mx-auto">
        {/* Game Over Banner */}
        {isGameOver && (
          <div className="mb-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl p-6 text-center shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-2">🎉 Game Over! 🎉</h1>
            <p className="text-2xl text-white">
              Team {winnerTeam === 1 ? 'Red' : 'Blue'} Wins!
            </p>
          </div>
        )}

        <GameHeader />
        {!isGameOver && <TurnIndicator />}
        <div className="mt-6">
          <BoardGrid />
        </div>
      </div>
      {!isGameOver && <CardHand />}
    </div>
  )
}
