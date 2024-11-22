// This component uses roles to restrict user access to entire pages.
import { useState, useEffect, useNavigate } from "react";

const ProtectedRoute = ({ element: Element, requiredRole, ...rest }) => {
  const [userRoles, setUserRoles] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setUserRoles(data.roles);
        if (!data.roles[requiredRole]) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [requiredRole, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return userRoles && userRoles[requiredRole] ? <Element {...rest} /> : null;
};