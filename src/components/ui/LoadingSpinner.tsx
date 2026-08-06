import { useUIStore } from '@/stores/uiStore'

export function LoadingSpinner() {
  const isLoading = useUIStore(state => state.isLoading)
  const loadingMessage = useUIStore(state => state.loadingMessage)
  
  if (!isLoading) return null
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        {loadingMessage && (
          <p className="text-white text-lg">{loadingMessage}</p>
        )}
      </div>
    </div>
  )
}
