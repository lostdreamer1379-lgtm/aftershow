import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { Session, User, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthResult {
  error: string | null
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult & { needsEmailConfirmation: boolean }>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<AuthResult>
  updatePassword: (newPassword: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function formatAuthError(error: AuthError | null): string | null {
  if (!error) return null
  // Supabase's default messages are already end-user readable; normalize
  // the few that benefit from a friendlier phrasing.
  if (error.message.toLowerCase().includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }
  if (error.message.toLowerCase().includes('user already registered')) {
    return 'An account with this email already exists.'
  }
  return error.message
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: formatAuthError(error) }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    // If Supabase has email confirmation enabled, a new sign-up returns a
    // user with no active session until they confirm — surface that so the
    // UI can show a "check your email" state instead of silently failing
    // to redirect.
    const needsEmailConfirmation = Boolean(data.user) && !data.session
    return { error: formatAuthError(error), needsEmailConfirmation }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const sendPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: formatAuthError(error) }
  }, [])

  const updatePassword = useCallback(async (newPassword: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    return { error: formatAuthError(error) }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, sendPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
