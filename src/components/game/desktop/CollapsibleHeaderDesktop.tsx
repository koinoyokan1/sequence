import { motion, AnimatePresence } from 'framer-motion'
import { useCollapsibleHeaderLogic } from '../common/useCollapsibleHeaderLogic'

/**
 * Desktop header with chat modal
 * - Game info always visible
 * - Chat opens as modal overlay
 * - Shows notification badge for unread messages
 */
export function CollapsibleHeaderDesktop() {
  const headerData = useCollapsibleHeaderLogic()

  if (!headerData) return null

  const {
    team1,
    team2,
    isHeaderExpanded,
    toggleHeader,
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
  } = headerData

  // Get all players for team color lookup
  const allPlayers = [...team1.players, ...team2.players]

  return (
    <>
      {/* Header Toggle Button - Always Visible */}
      <div data-component="header-toggle-container" className="mb-4">
        <button
          data-component="header-toggle-button"
          onClick={toggleHeader}
          className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <span className="text-gray-300 text-sm">
            Game Info
          </span>
          <motion.div
            animate={{ rotate: isHeaderExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400 text-sm"
          >
            ▼
          </motion.div>
        </button>
      </div>

      {/* Game Info Header - Collapsible */}
      <AnimatePresence>
        {isHeaderExpanded && (
          <motion.div
            data-component="header-expanded-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-4"
          >
            <div data-component="header-content" className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div data-component="game-info-section" className="p-6 flex items-center justify-between">
                {/* Left - Team 1 */}
                <div data-component="team1-info" className="text-center flex-1">
                  <div data-component="team1-score" className="flex items-baseline gap-2 justify-center">
                    <span className="text-3xl font-bold text-white">{team1.sequenceCount}</span>
                    <span className="text-gray-400 text-sm">/{team1.sequencesRequired}</span>
                  </div>
                  <div data-component="team1-names" className="text-sm text-team-1 mt-1">
                    {team1.playerNames}
                  </div>
                </div>

                {/* Center - Game Code */}
                <div data-component="game-code-section" className="text-center flex-1 px-8">
                  <div className="text-sm text-gray-400">Game Code</div>
                  <div data-component="game-code" className="text-4xl font-mono font-bold text-primary-400 my-1">
                    {headerData.inviteCode}
                  </div>
                </div>

                {/* Right - Team 2 */}
                <div data-component="team2-info" className="text-center flex-1">
                  <div data-component="team2-score" className="flex items-baseline gap-2 justify-center">
                    <span className="text-3xl font-bold text-white">{team2.sequenceCount}</span>
                    <span className="text-gray-400 text-sm">/{team2.sequencesRequired}</span>
                  </div>
                  <div data-component="team2-names" className="text-sm text-team-2 mt-1">
                    {team2.playerNames}
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              <button
                data-component="chat-open-button"
                onClick={toggleChat}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center relative"
              >
                <span className="text-gray-300 text-sm mr-2">💬 Chat</span>

                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <motion.div
                    data-component="chat-notification-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center ml-2"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.div>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              data-component="chat-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={toggleChat}
            />

            {/* Chat Modal */}
            <motion.div
              data-component="chat-modal"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] max-w-[90%] bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div data-component="chat-modal-header" className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Chat</h3>
                <button
                  data-component="chat-close-button"
                  onClick={toggleChat}
                  className="text-gray-400 hover:text-white text-3xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Chat Messages */}
              <div data-component="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900 min-h-0">
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    <motion.div
                      data-component="chat-message"
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded ${
                        msg.player_id === playerId
                          ? 'bg-primary-600/20'
                          : 'bg-gray-700'
                      }`}
                    >

                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{
                            color: msg.player_id === playerId
                              ? '#60a5fa'
                              : allPlayers.find(p => p.id === msg.player_id)?.team === 1
                                ? '#ef4444'
                                : '#22c55e'
                          }}
                        >
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

              {/* Chat Input */}
              <form data-component="chat-input-form" onSubmit={handleSendMessage} className="p-6 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-3">
                  <input
                    data-component="chat-input-field"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={500}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                  <button
                    data-component="chat-send-button"
                    type="submit"
                    disabled={!message.trim()}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                  >
                    Send
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {message.length}/500
                </p>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
