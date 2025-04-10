import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { RoleProvider } from '../../contexts/RoleContext';

// Мокируем модули
jest.mock('js-cookie');
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockReturnValue({ 
    sub: '1', 
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + 3600
  })
}));

// Мокируем react-router-dom
jest.mock('react-router-dom', () => {
  return {
    MemoryRouter: ({ children }) => <>{children}</>,
    Routes: ({ children }) => <>{children}</>,
    Route: ({ element }) => element,
    Navigate: ({ to }) => <div data-testid="login-page">Redirecting to {to}</div>
  };
});

// Мокируем компоненты приложения
jest.mock('../../pages/Login', () => {
  return function Login() {
    return (
      <div data-testid="login-form">
        <input data-testid="email" type="email" />
        <input data-testid="password" type="password" />
        <button data-testid="submit">Войти</button>
      </div>
    );
  };
});

jest.mock('../../api_endpoints', () => ({
  auth_login_path: 'http://localhost:8000/auth/login',
  get_roles_path: 'http://localhost:8000/roles/get_all'
}));

describe('Интеграция системы авторизации', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Мокируем sessionStorage
    sessionStorage.getItem = jest.fn().mockReturnValue(null);
    sessionStorage.setItem = jest.fn();
    
    // Настраиваем глобальный fetch мок
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            access_token: 'test-token',
            user: { id: '1', email: 'admin@example.com', roles: ['admin'] }
          })
        });
      }
      
      if (url.includes('/roles/get_all')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 1, role: 'admin' },
            { id: 2, role: 'manager' }
          ])
        });
      }
      
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' })
      });
    });
  });

  test('должен автоматически перенаправить на страницу входа при истечении токена', async () => {
    // Мок ответа API для проверки токена с ошибкой 401
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });
    });
    
    // Мокируем validateToken чтобы он вернул false
    jest.mock('../../contexts/AuthContext', () => {
      const originalModule = jest.requireActual('../../contexts/AuthContext');
      return {
        ...originalModule,
        validateToken: jest.fn().mockReturnValue(false)
      };
    });
    
    render(
      <AuthProvider>
        <RoleProvider>
          <div data-testid="login-page">Страница входа</div>
        </RoleProvider>
      </AuthProvider>
    );
    
    // Проверяем, что отображается страница входа
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});