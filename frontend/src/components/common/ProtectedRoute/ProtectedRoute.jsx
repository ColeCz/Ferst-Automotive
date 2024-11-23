import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkUserRole, hasRole } from '../../../utils/auth'

const ProtectedRoute = ({ children, requiredRole }) => {
  const [userRoles, setUserRoles] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('http://localhost:8081/auth/session', {
          credentials: 'include',
        })
        const data = await response.json()
        setUserRoles(data.roles)
        if (!data.roles[requiredRole]) {
          navigate('/login') // when not auth'd, redirects to '/login'
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        navigate('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [requiredRole, navigate])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return userRoles && userRoles[requiredRole] ? children : null
}

export default ProtectedRoute
