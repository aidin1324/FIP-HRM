// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import * as jwt from 'jwt-decode';

export const AuthContext = createContext();

export const validateToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  try {
    const decoded = jwt.jwtDecode(token);

    if (!decoded.id || !decoded.exp) return false;

    if (decoded.exp < Date.now() / 1000) return false;
    
    return true;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access_token: null,
    user: null,
  });

  const [loading, setLoading] = useState(true);

  const isAccessTokenExpired = (token) => {
    try {
      const { exp } = jwt.jwtDecode(token);
      return exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      const access_token = Cookies.get('access_token');

      if (access_token && typeof access_token === 'string' && !isAccessTokenExpired(access_token)) {
        try {
          const decoded = jwt.jwtDecode(access_token);
          setAuth({
            access_token,
            user: {
              id: decoded.id,
              email: decoded.email,
              roles: decoded.roles || [decoded.role] 
            }
          });
        } catch (error) {
          console.error('Ошибка при декодировании токена:', error);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (access_token) => {
    if (!validateToken(access_token)) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Недействительный токен');
      }
      return;
    }

    Cookies.set('access_token', access_token, { expires: 7, secure: true, sameSite: 'strict' });
    try {
      const decoded = jwt.jwtDecode(access_token);
      
      // Устанавливаем данные пользователя
      setAuth({
        access_token,
        user: {
          id: decoded.id,
          email: decoded.email,
          roles: decoded.roles || [decoded.role],
        },
      });

      // Предварительная загрузка данных при логине
      try {
        await prefetchCommonData(access_token);
      } catch (err) {
        console.warn('Error prefetching data:', err);
        // Продолжаем несмотря на ошибку предзагрузки
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
      logout();
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    setAuth({
      access_token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};