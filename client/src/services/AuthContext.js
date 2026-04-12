import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from './authService'

/**
 * AuthContext - React Context for authentication state
 *
 * Provides:
 *   - user: the currently authenticated user object (or null)
 *   - loading: true while checking session on mount
 *   - isAuthenticated: boolean shorthand
 *   - login(email, password): authenticate and update state
 *   - register(data): create account and update state
 *   - logout(): destroy session and clear state
 */

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if there's an existing session
  useEffect(() => {
    let cancelled = false
    const checkSession = async () => {
      try {
        const result = await authService.getMe()
        if (!cancelled && result.success) {
          setUser(result.data)
        }
      } catch {
        // Not authenticated — that's fine
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    checkSession()
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await authService.login({ email, password })
    if (result.success) {
      setUser(result.data)
    }
    return result
  }, [])

  const register = useCallback(async (data) => {
    const result = await authService.register(data)
    // Don't auto-login after register — redirect to login page instead
    return result
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null)
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access auth context
 * @returns {{ user: Object|null, loading: boolean, isAuthenticated: boolean, login: Function, register: Function, logout: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
