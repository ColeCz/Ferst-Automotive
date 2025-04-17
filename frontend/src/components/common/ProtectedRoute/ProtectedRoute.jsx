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
        const response = await fetch('http://3.147.185.195:8081/auth/session', {
          credentials: 'include',
        })
        const data = await response.json()
        setUserRoles(data.roles)

        // check if user is owner first
        if (!data.roles.owner && !data.roles[requiredRole]) {
          navigate('/login') // if not, user gets sent back to login page
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

  //updated to return children if user has required role or if they have owner role
  return userRoles && (userRoles.owner || userRoles[requiredRole])
    ? children
    : null
}

export default ProtectedRoute
