'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import apiService from '../../services/api'

const ThemeContext = createContext(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

const AuthContext = createContext(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function Providers({ children }) {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }

    // Check for user session from API
    const checkUserSession = async () => {
      try {
        const response = await apiService.getProfile()
        setUser(response)
      } catch (error) {
        console.log('No active session found or API not available')
        // Check for saved user session as fallback
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkUserSession()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials)
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    } catch (error) {
      console.error('Login error:', error)
      // Don't fall back to mock data - let the error propagate
      throw error
    }
  }

  const register = async (userData) => {
    try {
      console.log('Providers: Attempting registration with data:', userData)
      const response = await apiService.register(userData)
      console.log('Providers: Registration successful:', response)
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    } catch (error) {
      console.error('Providers: Registration error:', error)
      console.error('Providers: Error response:', error.response)
      // Don't fall back to mock data - let the error propagate
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiService.logout()
      setUser(null)
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user state even if API call fails
      setUser(null)
      localStorage.removeItem('user')
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: theme === 'dark' ? '#374151' : '#ffffff',
              color: theme === 'dark' ? '#ffffff' : '#374151',
              border: `1px solid ${theme === 'dark' ? '#4B5563' : '#E5E7EB'}`,
            },
          }}
        />
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}
