import React from 'react';

export const validateToken = jest.fn().mockImplementation((token) => {
  // Валидный только если строка и не 'invalid-token'
  return typeof token === 'string' && token !== 'invalid-token';
});

export const AuthContext = React.createContext({
  auth: {
    access_token: 'mock-token',
    refresh_token: null,
    user: { id: '1', email: 'test@example.com', roles: ['admin'] }
  },
  loading: false,
  login: jest.fn().mockResolvedValue(true),
  logout: jest.fn(),
  refreshAccessToken: jest.fn().mockResolvedValue(true),
  validateToken
});

export const AuthProvider = ({ children }) => {
  return (
    <AuthContext.Provider 
      value={{
        auth: {
          access_token: 'mock-token',
          refresh_token: null,
          user: { id: '1', email: 'test@example.com', roles: ['admin'] }
        },
        loading: false,
        login: jest.fn().mockResolvedValue(true),
        logout: jest.fn(),
        refreshAccessToken: jest.fn().mockResolvedValue(true),
        validateToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};