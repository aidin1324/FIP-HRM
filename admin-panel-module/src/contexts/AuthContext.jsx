// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import * as jwt from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    access_token: null,
    user: null, // Contains user information, including roles
  });

  const [loading, setLoading] = useState(true); // Initialize loading state

  useEffect(() => {
    const initializeAuth = () => {
      const access_token = Cookies.get('access_token'); // Ensure the cookie name matches
      console.log('Retrieved access_token from cookies:', access_token);

      if (access_token && typeof access_token === 'string' && !isaccess_tokenExpired(access_token)) {
        try {
          const decoded = jwt.jwtDecode(access_token);
          console.log('Decoded access_token:', decoded);
          setAuth({
            access_token:access_token,
            user: {
              id: decoded.id,
              email: decoded.email,
              roles: decoded.roles, // Assumes roles are stored in the access_token
            },
          });
        } catch (error) {
          console.error('Error decoding access_token:', error);
          logout();
        }
      } else {
        console.log('No valid access_token found.');
        logout();
      }

      setLoading(false); // Authentication check complete
    };

    initializeAuth();
  }, []);

  const isaccess_tokenExpired = (access_token) => {
    try {
      const { exp } = jwt.jwtDecode(access_token);
      return exp < Date.now() / 1000;
    } catch (e) {
      return true;
    }
  };

  const login = (access_token) => {
    if (typeof access_token !== 'string') {
      console.error('Invalid access_token type:', typeof access_token);
      return;
    }

    Cookies.set('access_token', access_token, { expires: 7, secure: true, sameSite: 'strict' });
    try {
      const decoded = jwt.jwtDecode(access_token);
      console.log('Decoded access_token on login:', decoded);
      setAuth({
        access_token: access_token,
        user: {
          id: decoded.id,
          email: decoded.email,
          roles: decoded.roles,
        },
      });
    } catch (error) {
      console.error('Error decoding access_token during login:', error);
      logout();
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