import { motion, AnimatePresence } from 'framer-motion'
import { useGameChatLogic } from '../common/useGameChatLogic'

/**
 * Desktop-optimized game chat component
 * - Fixed sidebar position
 * - Larger chat window
 * - Better readability with more space
 */
export function GameChatDesktop() {
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
      {/* Chat Toggle Button - Desktop positioned */}
      {!isExpanded && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleExpanded}
          className="fixed bottom-24 right-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg z-40 transition-colors text-2xl"
        >
          💬
        </motion.button>
      )}

      {/* Chat Window - Desktop sidebar */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-24 right-4 w-80 h-96 bg-gray-800 rounded-xl shadow-2xl z-40 flex flex-col overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-primary-400 text-lg">💬</span>
                <h3 className="text-white font-semibold">Game Chat</h3>
              </div>
              <button
                onClick={toggleExpanded}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
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
                    className={`p-2 rounded ${
                      msg.player_id === playerId
                        ? 'bg-primary-600/20'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-primary-400">
                        {msg.player_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 mt-1 break-words">
                      {msg.message}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-gray-900 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  ➤
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {message.length}/500
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
