import { useCallback, useEffect, useState } from 'react'
import * as api from './api'
import { AuthContext } from './auth-context'

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() =>
    api.getAuthToken() ? 'loading' : 'unauthenticated'
  )

  const applySession = useCallback(({ token, user }) => {
    api.setAuthToken(token)
    setUser(user)
    setStatus('authenticated')
  }, [])

  const clearSession = useCallback(() => {
    api.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    if (!api.getAuthToken()) return
    let cancelled = false
    api
      .fetchMe()
      .then((me) => {
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        clearSession()
      })
    return () => {
      cancelled = true
    }
  }, [clearSession])

  useEffect(() => {
    const onExpired = () => clearSession()
    window.addEventListener(api.AUTH_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(api.AUTH_EXPIRED_EVENT, onExpired)
  }, [clearSession])

  const login = useCallback(
    async (email, password) => {
      const session = await api.login(email, password)
      applySession(session)
      return session.user
    },
    [applySession]
  )

  const signup = useCallback(
    async (email, password, displayName) => {
      const session = await api.signup(email, password, displayName)
      applySession(session)
      return session.user
    },
    [applySession]
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  const updateUser = useCallback(async (patch) => {
    const updated = await api.updateMe(patch)
    setUser(updated)
    return updated
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider }
