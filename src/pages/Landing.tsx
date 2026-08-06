import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6">
            SEQUENCE
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            The Strategic Card & Board Game
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col md:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/create">
            <Button size="lg" className="w-full md:w-auto px-12">
              Create Game
            </Button>
          </Link>
          <Link to="/join">
            <Button size="lg" variant="secondary" className="w-full md:w-auto px-12">
              Join Game
            </Button>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-gray-800 rounded-xl p-8 max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-white mb-4">How to Play</h2>
          <div className="text-left text-gray-300 space-y-3">
            <p>🎯 Get 5 chips in a row to make a sequence</p>
            <p>🃏 Play cards to place chips on matching board positions</p>
            <p>👁️ One-eyed Jacks remove opponent chips</p>
            <p>👁️👁️ Two-eyed Jacks are wild cards</p>
            <p>🏆 First to the required sequences wins!</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
