import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import type { ChatMessage } from '@/types/chat'

/**
 * Common game chat logic - pure business logic for chat functionality
 * Used by both mobile and desktop chat components
 */
export function useGameChatLogic() {
  const [message, setMessage] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const gameId = useGameStore(state => state.gameId)
  const playerId = useGameStore(state => state.playerId)
  const players = useGameStore(state => state.players)
  const chatMessages = useGameStore(state => state.chatMessages)
  const setChatMessages = useGameStore(state => state.setChatMessages)
  const addToast = useUIStore(state => state.addToast)
  
  const currentPlayer = players.find(p => p.id === playerId)
  
  // Fetch initial chat messages
  useEffect(() => {
    if (!gameId) return
    
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error fetching chat messages:', error)
      } else if (data) {
        setChatMessages(data as ChatMessage[])
      }
    }
    
    fetchMessages()
  }, [gameId, setChatMessages])
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isExpanded])
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !gameId || !playerId || !currentPlayer) return
    
    if (message.length > 500) {
      addToast('Message too long (max 500 characters)', 'error')
      return
    }
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          game_id: gameId,
          player_id: playerId,
          player_name: currentPlayer.name,
          message: message.trim(),
        })
      
      if (error) throw error
      
      setMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      addToast('Failed to send message', 'error')
    }
  }, [message, gameId, playerId, currentPlayer, addToast])

  const formatTime = useCallback((timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }, [])

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  return {
    message,
    setMessage,
    isExpanded,
    toggleExpanded,
    chatMessages,
    messagesEndRef,
    handleSendMessage,
    formatTime,
    playerId,
  }
}
