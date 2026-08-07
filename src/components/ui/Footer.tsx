import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  const [showFullMessage, setShowFullMessage] = useState(false)
  
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent pointer-events-none"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 pointer-events-auto">
        <button
          onClick={() => setShowFullMessage(!showFullMessage)}
          className="w-full text-center transition-all duration-300 hover:scale-105 cursor-pointer"
        >
          <motion.div
            animate={{ opacity: showFullMessage ? 0.6 : 1 }}
            className="text-gray-400 text-xs sm:text-sm"
          >
            {!showFullMessage ? (
              <p>
                Made with ❤️ (and mild frustration) by{' '}
                <span className="text-primary-400 font-semibold">Ajay Nair</span>
                {' '}• Click for the full story →
              </p>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-700"
              >
                <p className="text-base sm:text-lg font-semibold text-white">
                  🎯 The Origin Story
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  This game exists because of one person:{' '}
                  <span className="text-primary-400 font-medium">that one friend</span> who insists
                  on playing Sequence until everyone's brain turns into mush. You know the type —{' '}
                  <span className="italic">"Just one more game!"</span> they say, as you enter your 4th hour
                  of strategic cardboard warfare.
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  After desperately searching the internet for a{' '}
                  <span className="line-through text-red-400">stable</span> ANY working online version
                  and finding nothing but broken links and sketchy websites from 2003,{' '}
                  <span className="text-primary-400 font-semibold">Ajay Nair</span> thought:{' '}
                  <span className="italic">"Fine, I'll do it myself."</span>
                </p>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  So here we are. A fully functional, actually-works-on-mobile, real-time multiplayer
                  Sequence game. Built out of love for the game and an unhealthy amount of spite
                  towards broken online versions.
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mt-3 pt-3 border-t border-gray-600">
                  Pro tip: You can now blame the developer instead of your friend when you lose. 🎲
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4 text-xs sm:text-sm">
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300">
                    Built with React + TypeScript
                  </span>
                  <span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300">
                    Powered by Supabase
                  </span>
                  <span className="px-3 py-1 bg-primary-600 rounded-full text-white font-medium">
                    100% Open Source
                  </span>
                </div>
                <div className="mt-4">
                  <Link
                    to="/credits"
                    className="text-primary-400 hover:text-primary-300 underline text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Read the full story →
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </button>
      </div>
    </motion.footer>
  )
}
