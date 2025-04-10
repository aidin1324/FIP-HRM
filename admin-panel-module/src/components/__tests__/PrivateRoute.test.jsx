// Мокируем сначала
jest.mock('../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../contexts/AuthContext');
  return {
    ...originalModule,
    validateToken: jest.fn() // Создаем мок напрямую
  };
});

// Стандартные импорты
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthContext, validateToken } from '../../contexts/AuthContext'; // Импортируем мокированную функцию
import { RoleContext } from '../../contexts/RoleContext';
import PrivateRoute from '../../components/PrivateRoute';

// Мокируем react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => <div data-testid="login-page">Redirecting to {to}</div>,
  useLocation: () => ({ pathname: '/dashboard' })
}));

// Мокируем компонент Loading
jest.mock('../../components/Loading', () => () => <div data-testid="loading">Загрузка...</div>);

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('должен перенаправлять на страницу логина при отсутствии токена', () => {
    validateToken.mockReturnValue(false);
    
    render(
      <AuthContext.Provider value={{
        auth: { access_token: 'invalid-token' }, // Используем невалидный токен
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
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  test('должен перенаправлять официантов на страницу профиля', () => {
    validateToken.mockReturnValueOnce(true);
    
    const authContextValue = {
      auth: {
        access_token: 'valid-token',
        user: { id: '123', roles: ['waiter'] }
      },
      loading: false
    };
    
    const roleContextValue = {
      roles: { '1': 'admin', '2': 'waiter' }, // Добавьте все необходимые роли
      loading: false
    };
    
    render(
      <AuthContext.Provider value={authContextValue}>
        <RoleContext.Provider value={roleContextValue}>
          <PrivateRoute roles={['admin']}>  {/* Требуем роль admin */}
            <div data-testid="dashboard">Защищенный контент</div>
          </PrivateRoute>
        </RoleContext.Provider>
      </AuthContext.Provider>
    );
    
    // Проверяем, что произошло перенаправление
    expect(validateToken).toHaveBeenCalled();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('dashboard')).not.toBeInTheDocument();
  });

  test('должен отображать экран загрузки при загрузке данных', () => {
    const authContextValue = {
      auth: { access_token: 'invalid-token' },  // Используйте строку вместо пустого объекта
      loading: true
    };
    
    const roleContextValue = {
      roles: {},
      loading: false
    };
    
    render(
      <AuthContext.Provider value={authContextValue}>
        <RoleContext.Provider value={roleContextValue}>
          <PrivateRoute>
            <div data-testid="dashboard">Защищенный контент</div>
          </PrivateRoute>
        </RoleContext.Provider>
      </AuthContext.Provider>
    );
    
    // Проверяем отображение компонента загрузки
    expect(screen.getByTestId('loading')).toBeInTheDocument();
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
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });
});