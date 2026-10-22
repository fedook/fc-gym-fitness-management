import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { getErrorMessage } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('gym_token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/user')
      setUser(data.data ?? data)
    } catch {
      localStorage.removeItem('gym_token')
      localStorage.removeItem('gym_user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = useCallback(async (email, password) => {
    try {
      const { data } = await api.post('/login', { email, password })
      localStorage.setItem('gym_token', data.token)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, message: getErrorMessage(error) }
    }
  }, [])

  const register = useCallback(async (payload) => {
    try {
      const { data } = await api.post('/register', payload)
      localStorage.setItem('gym_token', data.token)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, message: getErrorMessage(error) }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // token cleanup happens client-side regardless
    }
    localStorage.removeItem('gym_token')
    localStorage.removeItem('gym_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshUser: fetchUser,
      isAdmin: user?.role === 'admin',
      isManagement: ['admin', 'staff'].includes(user?.role),
      isMember: user?.role === 'member',
    }),
    [user, loading, login, register, logout, fetchUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
