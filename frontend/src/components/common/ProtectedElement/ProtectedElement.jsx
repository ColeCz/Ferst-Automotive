// We use this to hide certain HTML elements by user role.

import { useState, useEffect } from 'react'

const ProtectedElement = ({
  element: Element,
  requiredRole,
  fallback = null,
}) => {
  const [userRoles, setUserRoles] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('http://localhost:8081/auth/session') // needs to match backend API path
        if (!response.ok) {
          throw new Error('Failed to fetch session')
        }
        const data = await response.json()
        setUserRoles(data.roles)
      } catch (error) {
        console.error('Error fetching session:', error)
        // set all to false in case of error:
        setUserRoles({
          clerk: false,
          salesperson: false,
          manager: false,
          owner: false
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()
  }, [])

  if (isLoading) {
    return null // loading spinner, but only if we have time later
  }

  // handle both single role & arrays of roles
  const hasRequiredRole =
    userRoles &&
    (Array.isArray(requiredRole)
      ? requiredRole.some((role) => userRoles[role])
      : userRoles[requiredRole])

  return hasRequiredRole ? Element : Element // change second condition to "fallback" later  to enforce restrictions.
}

export default ProtectedElement
