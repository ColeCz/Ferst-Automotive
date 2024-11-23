import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:8081/auth/session', {
          credentials: 'include'
        })
        const data = await response.json()
        setIsAuthenticated(!!data.username)
        setUsername(data.username || '')
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
        setUsername('')
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8081/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(false)
        setUsername('')
        navigate('/login')
      }
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  return (
    <header className="header">
      <div className="auth-buttons">
        {!isAuthenticated ? (
          <button onClick={() => navigate('/login')} className="auth-button">
            Login
          </button>
        ) : (
          <div className="auth-container">
            <span className="username">
              Current User: <span style={{ color: '#0056b3', fontWeight: 'bold' }}>{username}</span>
            </span>
            <button onClick={handleLogout} className="auth-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header