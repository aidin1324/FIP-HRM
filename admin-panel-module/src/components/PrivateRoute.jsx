// src/components/PrivateRoute.jsx
import React, { useContext, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children, role = [] }) => {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  // Декодируем JWT токен напрямую
  const decodedToken = useMemo(() => {
    if (!auth.access_token) return null;
    try {
      // Разделяем JWT на части
      const base64Url = auth.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Декодируем payload
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Ошибка при декодировании токена:', e);
      return null;
    }
  }, [auth.access_token]);

  // If authentication is still loading, render nothing or a spinner
  if (loading) {
    return <Loading />;
  }

  console.log('Current access_token:', auth.access_token);
  console.log('Decoded token:', decodedToken);

  if (!auth.access_token) {
    // User is not authenticated
    console.log("No auth token - redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Получаем роль из декодированного токена, а не из auth.user
  const userRoleFromToken = decodedToken?.role || '';
  const userRole = auth.user?.role || userRoleFromToken;
  console.log("User role from auth:", auth.user?.role);
  console.log("User role from token:", userRoleFromToken);
  console.log("Using role:", userRole);
  
  // Соответствие между кириллическими и латинскими названиями ролей
  const roleMapping = {
    'админ': 'admin',
    'официант': 'waiter',
    'менеджер': 'manager'
  };
  
  // Преобразуем роль пользователя для сравнения
  const normalizedRole = roleMapping[userRole] || userRole;
  console.log("Normalized role:", normalizedRole);
  
  // Специальная проверка для роли "официант" (waiter)
  if (normalizedRole === 'waiter') {
    // Официантам разрешен доступ только к своему профилю
    if (location.pathname !== '/my-profile' && !location.pathname.startsWith('/api/')) {
      console.log("Waiter access restricted - redirecting to /my-profile");
      return <Navigate to="/my-profile" replace />;
    }
  } 
  // Проверка для других ролей
  else if (role.length > 0 && !role.includes(normalizedRole)) {
    console.log(`Access denied for role ${normalizedRole} to ${location.pathname}`);
    console.log("Required roles:", role);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;