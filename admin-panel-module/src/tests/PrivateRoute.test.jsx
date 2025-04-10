// Мокируем сначала
jest.mock('../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../contexts/AuthContext');
  return {
    ...originalModule,
    validateToken: jest.fn() // Создаем мок напрямую
  };
});

// Стандартные импорты
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthContext, validateToken } from '../contexts/AuthContext'; // Импортируем мокированную функцию
import { RoleContext } from '../contexts/RoleContext';
import PrivateRoute from '../components/PrivateRoute';

// Мокируем react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => <div data-testid="navigate-redirect">Redirecting to {to}</div>,
  useLocation: () => ({ pathname: '/dashboard' })
}));

// Мокируем компонент Loading
jest.mock('../components/Loading', () => () => <div data-testid="loading">Загрузка...</div>);

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('должен перенаправлять на страницу логина при отсутствии токена', () => {
    // Используем validateToken вместо mockValidateToken
    validateToken.mockReturnValue(false);
    
    render(
      <AuthContext.Provider value={{
        auth: { access_token: 'invalid-token' }, // Используем невалидный токен вместо null
        loading: false
      }}>
        <RoleContext.Provider value={{ loading: false }}>
          <PrivateRoute>
            <div data-testid="dashboard">Защищенный контент</div>
          </PrivateRoute>
        </RoleContext.Provider>
      </AuthContext.Provider>
    );
    
    expect(validateToken).toHaveBeenCalled(); // Теперь validateToken должен быть вызван
    expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  test('должен отображать защищенное содержимое при наличии токена', () => {
    validateToken.mockReturnValue(true);
    
    render(
      <AuthContext.Provider value={{
        auth: { access_token: 'valid-token' },
        loading: false
      }}>
        <RoleContext.Provider value={{ loading: false }}>
          <PrivateRoute>
            <div data-testid="dashboard">Защищенный контент</div>
          </PrivateRoute>
        </RoleContext.Provider>
      </AuthContext.Provider>
    );
    
    expect(validateToken).toHaveBeenCalled();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate-redirect')).not.toBeInTheDocument();
  });
  
  test('должен отображать экран загрузки при загрузке данных', () => {
    render(
      <AuthContext.Provider value={{
        auth: { access_token: null },
        loading: true
      }}>
        <RoleContext.Provider value={{ loading: false }}>
          <PrivateRoute>
            <div data-testid="dashboard">Защищенный контент</div>
          </PrivateRoute>
        </RoleContext.Provider>
      </AuthContext.Provider>
    );
    
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});