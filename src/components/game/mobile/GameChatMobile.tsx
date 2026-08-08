import { motion, AnimatePresence } from 'framer-motion'
import { useGameChatLogic } from '../common/useGameChatLogic'

/**
 * Mobile-optimized game chat component
 * - Smaller chat window
 * - Full-screen overlay option
 * - Touch-optimized controls
 */
export function GameChatMobile() {
  const {
    message,
    setMessage,
    isExpanded,
    toggleExpanded,
    chatMessages,
    messagesEndRef,
    handleSendMessage,
    formatTime,
    playerId,
  } = useGameChatLogic()

  return (
    <>
      {/* Chat Toggle Button - Mobile positioned */}
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleExpanded}
          className="fixed bottom-20 right-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-3 shadow-lg z-40"
        >
          💬
        </motion.button>
      )}

      {/* Chat Window - Mobile full-screen overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">Chat</h3>
              <button
                onClick={toggleExpanded}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <AnimatePresence>
                {chatMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg ${
                      msg.player_id === playerId
                        ? 'bg-primary-600/30 ml-auto'
                        : 'bg-gray-700'
                    } max-w-[85%]`}
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-primary-400">
                        {msg.player_name}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 break-words">{msg.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-lg"
                >
                  ➤
                </button>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 text-right">
                {message.length}/500
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
