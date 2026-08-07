import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function Credits() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            🎯 The Credits
          </h1>
          <p className="text-xl text-gray-400">
            A tale of determination, spite, and questionable life choices
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="space-y-6"
        >
          {/* Main Story */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-primary-400 mb-4">
              Created by Ajay Nair
            </h2>
            <div className="space-y-4 text-gray-300 text-lg leading-relaxed">
              <p>
                This game exists because of <span className="text-primary-400 font-semibold">one relentless friend</span> who
                refuses to let game night end until everyone's brain has completely melted from strategic overload.
              </p>
              <p>
                You know the type. The "just one more game" person. The "come on, it's only been 3 hours" enthusiast.
                The human embodiment of <span className="italic text-yellow-400">"I swear this is the last round"</span> lies.
              </p>
              <p>
                After searching the entire internet for a working online version of Sequence and finding only:
              </p>
              <ul className="list-disc list-inside pl-4 space-y-2 text-gray-400">
                <li>Websites that look like they were built in 1997 (and haven't been updated since)</li>
                <li>Mobile apps that crash more than they work</li>
                <li>Sketchy downloads that probably contain more viruses than game code</li>
                <li>Browser versions that require Flash (RIP 💀)</li>
              </ul>
              <p className="pt-4">
                I finally thought:{' '}
                <span className="text-2xl font-bold text-white italic">"Fine. I'll build it myself."</span>
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">🛠️ Built With</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-primary-400 font-semibold mb-2">Frontend</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>⚛️ React 18 + TypeScript</li>
                  <li>⚡ Vite (for blazing fast builds)</li>
                  <li>🎨 TailwindCSS + Framer Motion</li>
                  <li>🐻 Zustand (state management)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-primary-400 font-semibold mb-2">Backend</h3>
                <ul className="space-y-1 text-gray-300">
                  <li>🔥 Supabase (real-time magic)</li>
                  <li>🐘 PostgreSQL</li>
                  <li>🔐 Row Level Security</li>
                  <li>📡 WebSocket subscriptions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Fun Facts</h2>
            <div className="space-y-3 text-gray-300">
              <p>☕ Coffees consumed during development: <span className="text-yellow-400 font-bold">Too many to count</span></p>
              <p>🐛 Bugs fixed: <span className="text-green-400 font-bold">All of them (probably)</span></p>
              <p>🎮 Games tested: <span className="text-primary-400 font-bold">More than I care to admit</span></p>
              <p>😤 Frustration level when existing versions didn't work: <span className="text-red-400 font-bold text-xl">MAXIMUM</span></p>
              <p>❤️ Love for the game: <span className="text-pink-400 font-bold">Infinite</span></p>
            </div>
          </div>

          {/* Dedication */}
          <div className="bg-gradient-to-r from-primary-600/20 to-purple-600/20 rounded-xl p-8 border border-primary-500/30">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">
              💝 Dedicated To
            </h2>
            <p className="text-xl text-gray-200 text-center leading-relaxed">
              To <span className="text-primary-400 font-bold">that friend</span> who may or may not have played a role
              in forcing everyone to play this game until our collective brain cells waved the white flag.
            </p>
            <p className="text-lg text-gray-400 text-center mt-4 italic">
              This is your fault. You're welcome. 🎯
            </p>
          </div>

          {/* Footer Note */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
            <p className="text-gray-400 text-sm">
              Now you can play Sequence online without sketchy downloads, broken websites, or cursing at your screen.
            </p>
            <p className="text-primary-400 font-semibold mt-2">
              Enjoy the game, and may your sequences be plentiful! 🎲
            </p>
          </div>

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Link to="/">
              <Button size="lg" variant="primary" className="px-12">
                Back to Game
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
