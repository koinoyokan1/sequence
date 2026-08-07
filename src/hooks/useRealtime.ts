import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtime(gameId: string | null) {
  const setGame = useGameStore(state => state.setGame)
  const setPlayers = useGameStore(state => state.setPlayers)
  const setBoardState = useGameStore(state => state.setBoardState)
  const setSequences = useGameStore(state => state.setSequences)

  // Track the current turn to detect if we're getting stale data
  const lastSeenTurnRef = useRef<number>(-1)
  
  useEffect(() => {
    if (!gameId) return
    
    const channels: RealtimeChannel[] = []
    
    // Subscribe to game updates
    const gameChannel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.new) {
            const newGameData = payload.new as any

            // Check if this is newer data (higher turn number = more recent)
            // This prevents race conditions where realtime fires before DB commit
            if (newGameData.current_turn >= lastSeenTurnRef.current) {
              lastSeenTurnRef.current = newGameData.current_turn

              // Update all game state
              setGame(newGameData)
              setBoardState(newGameData.board_state)
              setSequences(newGameData.sequences || [])
            } else {
              // Stale data - ignore this update
              console.log('Ignoring stale realtime update', {
                current: lastSeenTurnRef.current,
                incoming: newGameData.current_turn
              })
            }
          }
        }
      )
      .subscribe()
    
    channels.push(gameChannel)
    
    // Subscribe to player updates
    const playersChannel = supabase
      .channel(`players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        async () => {
          // Refetch all players when any player changes
          const { data } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId)
            .order('position')
          
          if (data) {
            setPlayers(data as any)
          }
        }
      )
      .subscribe()
    
    channels.push(playersChannel)
    
    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [gameId, setGame, setPlayers, setBoardState, setSequences])
}
