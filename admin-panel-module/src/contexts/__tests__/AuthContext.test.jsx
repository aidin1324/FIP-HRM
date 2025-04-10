import { render, act, renderHook, screen, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext, validateToken } from '../contexts/AuthContext';
import { useContext } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { apiClient } from '../services/apiClient';

// Моки внешних зависимостей
jest.mock('js-cookie');
jest.mock('jwt-decode');
jest.mock('../services/apiClient');

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Настройка мока Cookies
    Cookies.get.mockImplementation((name) => {
      if (name === 'access_token') return 'mock-access-token';
      if (name === 'refresh_token') return 'mock-refresh-token';
      return null;
    });
    
    // Настройка мока jwtDecode
    jwtDecode.mockImplementation(() => ({
      id: '123',
      email: 'user@example.com',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600 // Срок действия 1 час
    }));
  });

  // Тест 1: Проверка начальной инициализации контекста
  test('должен инициализироваться с правильными значениями', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });
    
    await waitFor(() => {
      expect(contextValue.auth.access_token).toBe('mock-access-token');
      expect(contextValue.auth.refresh_token).toBe('mock-refresh-token');
      expect(contextValue.auth.user).toEqual({
        id: '123',
        email: 'user@example.com',
        roles: ['admin']
      });
      expect(contextValue.loading).toBe(false);
      expect(typeof contextValue.login).toBe('function');
      expect(typeof contextValue.logout).toBe('function');
      expect(typeof contextValue.refreshAccessToken).toBe('function');
    });
  });

  // Тест 2: Проверка функции login
  test('login должен правильно устанавливать куки и обновлять контекст', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });
    
    await act(async () => {
      await contextValue.login('new-access-token', 'new-refresh-token');
    });
    
    expect(Cookies.set).toHaveBeenCalledWith('access_token', 'new-access-token', expect.objectContaining({
      expires: 1,
      secure: true,
      sameSite: 'strict'
    }));
    
    expect(Cookies.set).toHaveBeenCalledWith('refresh_token', 'new-refresh-token', expect.objectContaining({
      expires: 7,
      secure: true,
      sameSite: 'strict'
    }));
    
    expect(contextValue.auth.access_token).toBe('new-access-token');
    expect(contextValue.auth.refresh_token).toBe('new-refresh-token');
  });

  // Тест 3: Проверка функции logout
  test('logout должен удалять куки и сбрасывать контекст', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });
    
    await act(async () => {
      contextValue.logout();
    });
    
    expect(Cookies.remove).toHaveBeenCalledWith('access_token');
    expect(Cookies.remove).toHaveBeenCalledWith('refresh_token');
    
    expect(contextValue.auth.access_token).toBeNull();
    expect(contextValue.auth.refresh_token).toBeNull();
    expect(contextValue.auth.user).toBeNull();
  });

  // Тест 4: Проверка функции refreshAccessToken
  test('refreshAccessToken должен правильно обновлять токен', async () => {
    apiClient.post.mockResolvedValue({
      access_token: 'new-refreshed-token',
      refresh_token: 'new-refresh-token'
    });
    
    let contextValue;
    
    await act(async () => {
      render(
        <AuthProvider>
          <AuthContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </AuthContext.Consumer>
        </AuthProvider>
      );
    });
    
    await act(async () => {
      const result = await contextValue.refreshAccessToken('existing-refresh-token');
      expect(result).toBe(true);
    });
    
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refresh_token: 'existing-refresh-token'
    });
    
    expect(Cookies.set).toHaveBeenCalledWith('access_token', 'new-refreshed-token', expect.any(Object));
    expect(contextValue.auth.access_token).toBe('new-refreshed-token');
  });

  // Тест 5: Проверка функции validateToken
  test('validateToken должен правильно проверять токен', () => {
    // Действительный токен
    expect(validateToken('valid-token')).toBe(true);
    
    // Недействительный токен (срок истек)
    jwtDecode.mockImplementationOnce(() => ({
      exp: Math.floor(Date.now() / 1000) - 3600 // Срок истек 1 час назад
    }));
    expect(validateToken('expired-token')).toBe(false);
    
    // Пустой токен
    expect(validateToken('')).toBe(false);
    expect(validateToken(null)).toBe(false);
    
    // Ошибка декодирования
    jwtDecode.mockImplementationOnce(() => {
      throw new Error('Invalid token');
    });
    expect(validateToken('invalid-token')).toBe(false);
  });
});