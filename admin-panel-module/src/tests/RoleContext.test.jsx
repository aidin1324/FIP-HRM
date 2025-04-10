import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { RoleContext, RoleProvider } from '../contexts/RoleContext';

// Мокируем API endpoints
jest.mock('../api_endpoints', () => ({
  get_roles_path: 'http://localhost:8000/roles/get_all'
}));

describe('RoleContext', () => {
  // Сохраняем оригинальный fetch для восстановления
  const originalFetch = global.fetch;
  
  beforeEach(() => {
    // Очищаем все существующие моки
    jest.clearAllMocks();
    
    // Настраиваем моки для sessionStorage
    sessionStorage.getItem = jest.fn().mockReturnValue(null);
    sessionStorage.setItem = jest.fn();
    
    // Мок для fetch с успешным ответом
    global.fetch = jest.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, role: 'admin' },
          { id: 2, role: 'manager' }
        ])
      })
    );
  });
  
  afterEach(() => {
    // Восстанавливаем оригинальный fetch
    global.fetch = originalFetch;
  });
  
  test('должен загружать роли из API, если нет в sessionStorage', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <RoleProvider>
          <RoleContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </RoleContext.Consumer>
        </RoleProvider>
      );
    });
    
    // Проверяем вызовы и состояние
    expect(sessionStorage.getItem).toHaveBeenCalledWith('roles');
    expect(global.fetch).toHaveBeenCalled();
    
    await waitFor(() => 
      expect(contextValue.roles).toEqual({
        '1': 'admin',
        '2': 'manager'
      })
    );
  });
  
  test('должен обрабатывать ошибки при загрузке ролей', async () => {
    // Мокируем fetch с отклоненным промисом для симуляции ошибки
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    
    let contextValue;
    
    await act(async () => {
      render(
        <RoleProvider>
          <RoleContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </RoleContext.Consumer>
        </RoleProvider>
      );
    });
    
    // Проверяем вызов API и обработку ошибки
    expect(sessionStorage.getItem).toHaveBeenCalledWith('roles');
    
    await waitFor(() => {
      expect(contextValue.error).toBe('Ошибка при загрузке ролей.');
      expect(contextValue.roles).toEqual({});
    });
  });
});