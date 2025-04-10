import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';
import { FilterProvider } from '../../contexts/FilterContext';
import axios from 'axios';

// Мокируем axios
jest.mock('axios');

// Делаем то же самое что и в тесте Dashboard - мокируем useEffect для IntersectionObserver
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useEffect: (callback, deps) => {
      // Пропускаем эффекты, содержащие IntersectionObserver
      if (deps && deps.length === 0) {
        return;
      }
      
      return originalReact.useEffect(callback, deps);
    }
  };
});

// Мокируем lazy-загружаемые компоненты
jest.mock('../../partials/dashboard/DashboardCard01', () => () => (
  <div data-testid="dashboard-card-01">Карточка с графиком рейтинга</div>
));

jest.mock('../../partials/dashboard/DashboardCard02', () => () => (
  <div data-testid="dashboard-card-02">Карточка со статистикой</div>
));

jest.mock('../../partials/dashboard/DashboardCard06', () => () => (
  <div data-testid="dashboard-card-06">Карточка с типами отзывов</div>
));

describe('Интеграция Dashboard и FilterContext', () => {
  // Тестовые данные
  const mockFeedbackData = [
    { id: 1, created_at: '2023-01-01', waiter_score: { score: 5 }, 
      ratings: [{ rating: 5, feedback_type_id: 1 }] },
    { id: 2, created_at: '2023-01-02', waiter_score: { score: 4 }, 
      ratings: [{ rating: 4, feedback_type_id: 2 }] }
  ];
  
  beforeEach(() => {
    // Очищаем моки перед каждым тестом
    jest.clearAllMocks();
    
    // Настраиваем моки для localStorage
    const mockStorage = {};
    Storage.prototype.getItem = jest.fn(key => mockStorage[key] || null);
    Storage.prototype.setItem = jest.fn((key, value) => {
      mockStorage[key] = value;
    });
    
    // Настраиваем axios с корректной структурой ответа
    axios.get.mockResolvedValue({
      data: mockFeedbackData
    });
  });
  
  test('должен загружать данные из API и отображать в дашборде', async () => {
    await act(async () => {
      render(
        <FilterProvider>
          <Dashboard />
        </FilterProvider>
      );
    });
    
    // Проверяем вызов API
    expect(axios.get).toHaveBeenCalled();
    
    // Ждем появления компонентов дашборда после загрузки данных
    await waitFor(() => {
      expect(screen.getByText(/Дашборд/i)).toBeInTheDocument();
    });
  });
  
  test('должен переключать фильтр между daily и monthly', async () => {
    await act(async () => {
      render(
        <FilterProvider>
          <Dashboard />
        </FilterProvider>
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText(/По дням/i)).toBeInTheDocument();
    });
    
    // Кнопка "По дням" должна быть активной по умолчанию
    const dailyButton = screen.getByText(/По дням/i).closest('button');
    const monthlyButton = screen.getByText(/По мес/i).closest('button');
    
    // Проверяем, что "По дням" активна по умолчанию
    expect(dailyButton.className).toMatch(/from-violet-500/);
    expect(monthlyButton.className).not.toMatch(/from-violet-500/);
    
    // Нажимаем на кнопку "По мес."
    fireEvent.click(monthlyButton);
    
    // Проверяем, что состояние активности изменилось
    await waitFor(() => {
      expect(dailyButton.className).not.toMatch(/from-violet-500/);
      expect(monthlyButton.className).toMatch(/from-violet-500/);
    });
  });
  
  test('должен использовать кэш при повторной загрузке', async () => {
    // Имитируем наличие данных в кэше
    const cachedData = [...mockFeedbackData, { id: 3, comment: 'Данные из кэша' }];
    const mockTimestamp = Date.now().toString();
    
    // Настраиваем содержимое localStorage до рендеринга
    Storage.prototype.getItem.mockImplementation((key) => {
      if (key === 'feedbackData') return JSON.stringify(cachedData);
      if (key === 'feedbackDataTimestamp') return mockTimestamp;
      return null;
    });
    
    // ВАЖНО: сбрасываем историю вызовов axios.get перед рендерингом
    axios.get.mockClear();
    
    // Рендерим компонент
    await act(async () => {
      render(
        <FilterProvider>
          <Dashboard />
        </FilterProvider>
      );
    });
    
    // Важно: дожидаемся стабилизации компонента перед проверкой
    await waitFor(() => {
      expect(screen.getByText(/Дашборд/i)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Проверяем, что API запрос не выполнялся при наличии свежего кэша
    expect(axios.get).not.toHaveBeenCalled();
  });
});