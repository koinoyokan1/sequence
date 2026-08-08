import { motion, AnimatePresence } from 'framer-motion'
import { useCollapsibleHeaderLogic } from '../common/useCollapsibleHeaderLogic'

/**
 * Mobile header with chat modal
 * - Game info always visible
 * - Chat opens as modal overlay
 * - Shows notification badge for unread messages
 */
export function CollapsibleHeaderMobile() {
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
      <div data-component="header-toggle-container" className="mb-3">
        <button
          data-component="header-toggle-button"
          onClick={toggleHeader}
          className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-gray-300 text-sm">
            {isHeaderExpanded ? 'Hide Header' : 'Show Header'}
          </span>
          <motion.div
            animate={{ rotate: isHeaderExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
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
            className="overflow-hidden mb-3"
          >
            <div data-component="header-content" className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div data-component="game-info-section" className="p-3 flex items-center justify-between">
                {/* Left - Team 1 */}
                <div data-component="team1-info" className="flex-1 text-left">
                  <div data-component="team1-score" className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{team1.sequenceCount}</span>
                    <span className="text-gray-400 text-xs">/{team1.sequencesRequired}</span>
                  </div>
                  <div data-component="team1-names" className="text-[10px] text-team-1 truncate max-w-[80px]">
                    {team1.playerNames}
                  </div>
                </div>

                {/* Center - Game Code */}
                <div data-component="game-code-section" className="flex-1 text-center">
                  <div className="text-xs text-gray-400">Code</div>
                  <div data-component="game-code" className="text-lg font-mono font-bold text-primary-400">
                    {headerData.inviteCode}
                  </div>
                </div>

                {/* Right - Team 2 */}
                <div data-component="team2-info" className="flex-1 text-right">
                  <div data-component="team2-score" className="flex items-baseline gap-1 justify-end">
                    <span className="text-lg font-bold text-white">{team2.sequenceCount}</span>
                    <span className="text-gray-400 text-xs">/{team2.sequencesRequired}</span>
                  </div>
                  <div data-component="team2-names" className="text-[10px] text-team-2 truncate max-w-[80px] ml-auto">
                    {team2.playerNames}
                  </div>
                </div>
              </div>

              {/* Chat Button */}
              <button
                data-component="chat-open-button"
                onClick={toggleChat}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center relative"
              >
                <span className="text-gray-300 text-xs mr-1">💬 Chat</span>

                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <motion.div
                    data-component="chat-notification-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2"
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
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90%] md:max-w-md md:inset-auto bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col max-h-[calc(100vh-2rem)]"
            >
              {/* Modal Header */}
              <div data-component="chat-modal-header" className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Chat</h3>
                <button
                  data-component="chat-close-button"
                  onClick={toggleChat}
                  className="text-gray-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Chat Messages */}
              <div data-component="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-900">
                <AnimatePresence>
                  {chatMessages.map((msg) => (
                    <motion.div
                      data-component="chat-message"
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded ${
                        msg.player_id === playerId
                          ? 'bg-primary-600/30 ml-auto'
                          : 'bg-gray-700'
                      } max-w-[85%]`}
                    >

                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span
                          className="text-xs font-semibold"
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

              {/* Chat Input */}
              <form data-component="chat-input-form" onSubmit={handleSendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="flex gap-2">
                  <input
                    data-component="chat-input-field"
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={500}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
                  />
                  <button
                    data-component="chat-send-button"
                    type="submit"
                    disabled={!message.trim()}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    ➤
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
