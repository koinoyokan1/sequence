import { create } from 'zustand'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIState {
  toasts: Toast[]
  isLoading: boolean
  loadingMessage: string
  showRules: boolean
  
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  setLoading: (loading: boolean, message?: string) => void
  setShowRules: (show: boolean) => void
}

let toastCounter = 0

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  isLoading: false,
  loadingMessage: '',
  showRules: false,
  
  addToast: (message, type = 'info') => {
    const id = `toast-${toastCounter++}`
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }))
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, 5000)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },
  
  setLoading: (loading, message = '') => {
    set({ isLoading: loading, loadingMessage: message })
  },
  
  setShowRules: (show) => {
    set({ showRules: show })
  },
}))
