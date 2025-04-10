import React, { useContext, useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext, validateToken } from '../contexts/AuthContext';
import { RoleContext } from '../contexts/RoleContext';
import Loading from './Loading';

const PrivateRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const { auth, loading: authLoading } = useContext(AuthContext);
  const { roles: userRoles, loading: rolesLoading } = useContext(RoleContext);
  
  const accessToken = auth?.access_token || null;


  useEffect(() => {
    if (accessToken) {
      validateToken(accessToken);
    }
  }, [accessToken]);

  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  const decodedToken = useMemo(() => {
    if (!accessToken) return null;
    try {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Ошибка при декодировании токена');
      }
      return null;
    }
  }, [accessToken]);

  if (authLoading || rolesLoading) {
    return <Loading />;
  }

  if (!accessToken || !validateToken(accessToken)) { 
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRoleFromToken = decodedToken?.role || '';
  const userRolesFromAuth = auth.user?.roles || [];

  const userRolesList = [...new Set([
    ...(Array.isArray(userRolesFromAuth) ? userRolesFromAuth : [userRolesFromAuth]),
    userRoleFromToken
  ])].filter(Boolean); 

  const roleMapping = {
    'админ': 'admin',
    'официант': 'waiter',
    'менеджер': 'manager'
  };

  const normalizedUserRoles = userRolesList.map(role => roleMapping[role] || role);

  if (normalizedUserRoles.includes('waiter')) {
    if (location.pathname !== '/my-profile' && !location.pathname.startsWith('/api/')) {
      return <Navigate to="/my-profile" replace />;
    }
  } 
  else if (requiredRoles.length > 0 && !requiredRoles.some(r => normalizedUserRoles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;