import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useGameStore } from '@/stores/gameStore'
import { useUIStore } from '@/stores/uiStore'
import type { ChatMessage } from '@/types/chat'

export function GameChat() {
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
  
  const handleSendMessage = async (e: React.FormEvent) => {
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
  }
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className="fixed right-4 bottom-24 z-30">
      {!isExpanded ? (
        // Collapsed chat button
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsExpanded(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {chatMessages.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {chatMessages.length > 9 ? '9+' : chatMessages.length}
            </span>
          )}
        </motion.button>
      ) : (
        // Expanded chat window
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-800 rounded-lg shadow-2xl w-80 flex flex-col border border-gray-700"
          style={{ height: '400px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-700">
            <h3 className="text-white font-semibold">Game Chat</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <AnimatePresence>
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-2 rounded ${msg.player_id === playerId ? 'bg-primary-600/20' : 'bg-gray-700'}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold text-primary-400">
                      {msg.player_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-200 mt-1 break-words">{msg.message}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded px-4 py-2 text-sm font-medium"
              >
                Send
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
