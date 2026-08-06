import { useEffect, useState } from 'react'
import { supabase, signInAnonymously } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [])
  
  const signIn = async () => {
    try {
      const { user } = await signInAnonymously()
      setUser(user)
      return user
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }
  
  return { user, loading, signIn }
}
