import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Landing } from '@/pages/Landing'
import { CreateGame } from '@/pages/CreateGame'
import { JoinGame } from '@/pages/JoinGame'
import { Lobby } from '@/pages/Lobby'
import { Game } from '@/pages/Game'
import { Credits } from '@/pages/Credits'
import { ToastContainer } from '@/components/ui/Toast'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Footer } from '@/components/ui/Footer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function AppContent() {
  const location = useLocation()
  const isGamePage = location.pathname.startsWith('/game/')

  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateGame />} />
        <Route path="/join" element={<JoinGame />} />
        <Route path="/lobby/:gameId" element={<Lobby />} />
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
      <LoadingSpinner />
      {/* Hide footer in game mode */}
      {!isGamePage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/sequence">
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
