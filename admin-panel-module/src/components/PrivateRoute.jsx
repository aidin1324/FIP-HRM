// src/components/PrivateRoute.jsx
import React, { useContext, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext, validateToken } from '../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children, role = [] }) => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();
  const requiredRoles = Array.isArray(role) ? role : [role];

  const decodedToken = useMemo(() => {
    if (!auth.access_token) return null;
    try {
      const base64Url = auth.access_token.split('.')[1];
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
  }, [auth.access_token]);

  if (loading) {
    return <Loading />;
  }

  if (!auth.access_token || !validateToken(auth.access_token)) { 
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRoleFromToken = decodedToken?.role || '';
  const userRolesFromAuth = auth.user?.roles || [];

  const userRoles = [...new Set([
    ...(Array.isArray(userRolesFromAuth) ? userRolesFromAuth : [userRolesFromAuth]),
    userRoleFromToken
  ])].filter(Boolean); 

  const roleMapping = {
    'админ': 'admin',
    'официант': 'waiter',
    'менеджер': 'manager'
  };

  const normalizedUserRoles = userRoles.map(role => roleMapping[role] || role);

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