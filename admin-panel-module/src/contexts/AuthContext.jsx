import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '../services/apiClient';

export const validateToken = (token) => {
  try {
    if (!token) return false;
    
    const decoded = jwtDecode(token);
    // Проверка срока действия токена
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error);
    return false;
  }
};

export const AuthContext = createContext();

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
      const response = await apiClient.post('/auth/refresh', { refresh_token: refreshToken });
      
      if (response && response.access_token) {
        const decoded = jwtDecode(response.access_token);

        Cookies.set('access_token', response.access_token, { 
          expires: 1,
          secure: true,
          sameSite: 'strict'
        });
        
        if (response.refresh_token) {
          Cookies.set('refresh_token', response.refresh_token, { 
            expires: 7,
            secure: true,
            sameSite: 'strict'
          });
        }
        
        setAuth({
          access_token: response.access_token,
          refresh_token: response.refresh_token || refreshToken,
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
      console.error('Ошибка при обновлении токена:', error);
      logout();
      return false;
    }
  };

  const login = async (accessToken, refreshToken) => {
    try {
      const decoded = jwtDecode(accessToken);

      Cookies.set('access_token', accessToken, { 
        expires: 1, 
        secure: true,
        sameSite: 'strict',
      });
      
      if (refreshToken) {
        Cookies.set('refresh_token', refreshToken, { 
          expires: 7,
          secure: true,
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