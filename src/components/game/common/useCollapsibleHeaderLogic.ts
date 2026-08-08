import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import type { ChatMessage } from '@/types/chat'

/**
 * Common collapsible header logic with integrated chat
 * Handles:
 * - Header collapse/expand state
 * - Game state display (teams, scores, turn)
 * - Chat functionality
 * - New message notifications
 */
export function useCollapsibleHeaderLogic() {
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false) // Header collapsed by default
  const [isChatOpen, setIsChatOpen] = useState(false) // Chat closed by default
  const [message, setMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastReadMessageId = useRef<string | null>(null)
  
  const game = useGameStore(state => state.game)
  const players = useGameStore(state => state.players)
  const sequences = useGameStore(state => state.sequences)
  const playerId = useGameStore(state => state.playerId)
  const chatMessages = useGameStore(state => state.chatMessages)
  const setChatMessages = useGameStore(state => state.setChatMessages)
  const gameId = useGameStore(state => state.gameId)
  
  const addToast = useUIStore(state => state.addToast)
  
  const currentPlayer = players.find(p => p.id === playerId)
  
  if (!game) {
    return null
  }
  
  // Calculate team data
  const team1Players = players.filter(p => p.team === 1)
  const team2Players = players.filter(p => p.team === 2)
  const team1Sequences = sequences.filter(s => s.team === 1).length
  const team2Sequences = sequences.filter(s => s.team === 2).length
  
  // Get current turn player
  const currentTurnPlayer = players.find(p => p.position === game.current_turn)
  
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
        // Initialize last read to the latest message
        if (data.length > 0 && !lastReadMessageId.current) {
          lastReadMessageId.current = data[data.length - 1].id
        }
      }
    }
    
    fetchMessages()
  }, [gameId, setChatMessages])
  
  // Track unread messages
  useEffect(() => {
    if (isChatOpen) {
      // When chat is open, mark all as read
      setUnreadCount(0)
      if (chatMessages.length > 0) {
        lastReadMessageId.current = chatMessages[chatMessages.length - 1].id
      }
    } else {
      // When chat is closed, count new messages since last read
      if (!lastReadMessageId.current && chatMessages.length > 0) {
        lastReadMessageId.current = chatMessages[0].id
      }

      const lastReadIndex = chatMessages.findIndex(msg => msg.id === lastReadMessageId.current)
      const newMessageCount = lastReadIndex >= 0
        ? chatMessages.length - lastReadIndex - 1
        : chatMessages.length

      setUnreadCount(Math.max(0, newMessageCount))
    }
  }, [chatMessages, isChatOpen])
  
  // Auto-scroll to bottom when messages change and chat is open
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isChatOpen])
  
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

  const toggleHeader = useCallback(() => {
    setIsHeaderExpanded(prev => !prev)
  }, [])

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev)
  }, [])

  return {
    // Game state
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
    currentTurnPlayer,

    // Header collapse state
    isHeaderExpanded,
    toggleHeader,

    // Chat state
    isChatOpen,
    toggleChat,
    unreadCount,
    message,
    setMessage,
    chatMessages,
    messagesEndRef,
    handleSendMessage,
    formatTime,
    playerId,
  }
}
