import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '../services/apiClient';

export const validateToken = (token) => {
  try {
    if (!token) return false;
    
    const decoded = jwtDecode(token);
    
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

export const AuthContext = createContext({
  auth: {
    access_token: null,
    refresh_token: null,
    user: null,
  },
  loading: true,
  login: () => Promise.resolve(),
  logout: () => {},
  refreshAccessToken: () => Promise.resolve(false)
});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access_token: null,
    refresh_token: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');

      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);

          if (decoded.exp * 1000 > Date.now()) {
            setAuth({
              access_token: accessToken,
              refresh_token: refreshToken,
              user: {
                id: decoded.id,
                email: decoded.email,
                roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.role],
              },
            });
          } else {
            if (refreshToken) {
              await refreshAccessToken(refreshToken);
            } else {
              logout();
            }
          }
        } catch (error) {
          console.error('Ошибка при проверке токена:', error);
          logout();
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshAccessToken = async (refreshToken) => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://backend:8000';
      const response = await fetch(`${apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка обновления токена: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.access_token) {
        const decoded = jwtDecode(data.access_token);

        Cookies.set('access_token', data.access_token, { 
          expires: 1,
          secure: false,
          sameSite: 'strict'
        });
        
        if (data.refresh_token) {
          Cookies.set('refresh_token', data.refresh_token, { 
            expires: 7,
            secure: false,
            sameSite: 'strict'
          });
        }
        
        setAuth({
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken,
          user: {
            id: decoded.id,
            email: decoded.email,
            roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.role],
          },
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      logout();
      return false;
    }
  };

  const login = async (accessToken, refreshToken) => {
    try {
      const decoded = jwtDecode(accessToken);

      Cookies.set('access_token', accessToken, { 
        expires: 1, 
        secure: false,
        sameSite: 'strict',
      });
      
      if (refreshToken) {
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7,
          secure: false,
          sameSite: 'strict'
        });
      }
      
      setAuth({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: decoded.id,
          email: decoded.email,
          roles: Array.isArray(decoded.roles) ? decoded.roles : [decoded.role],
        },
      });
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    setAuth({
      access_token: null,
      refresh_token: null,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};