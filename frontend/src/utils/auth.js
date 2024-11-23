// Currently only used in ProtectedRoute.jsx.

export const checkUserRole = async () => {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return {
      username: data.username,
      roles: data.roles,
    }
  } catch (error) {
    console.error('Error checking user role:', error)
    return null
  }
}

export const hasRole = (roles, requiredRole) => {
  if (!roles) return false
  return roles[requiredRole] === true
}
