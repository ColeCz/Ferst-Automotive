import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const performLogout = async () => {
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        })
        
        const data = await response.json()
        
        if (data.success) {
          navigate('/login')
        }
      } catch (error) {
        console.error('Logout error:', error)
        navigate('/login')
      }
    }

    performLogout()
  }, [navigate])

  return <div>Logging out...</div>
}

export default Logout