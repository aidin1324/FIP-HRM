import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { FilterContext, FilterProvider } from '../contexts/FilterContext';
import axios from 'axios';

// Мокируем axios
jest.mock('axios');

describe('FilterContext', () => {
  // Данные для тестов
  const mockFeedbackData = [
    { id: 1, comment: 'Отличное обслуживание', created_at: '2023-01-01', 
      waiter_score: { score: 5 }, ratings: [{ rating: 5, feedback_type_id: 1 }] },
    { id: 2, comment: 'Хорошая атмосфера', created_at: '2023-01-02', 
      waiter_score: { score: 4 }, ratings: [{ rating: 4, feedback_type_id: 2 }] }
  ];

  // Сохраняем оригинальный console.error для предотвращения вывода ошибок
  const originalConsoleError = console.error;
  
  beforeEach(() => {
    // Очищаем все моки
    jest.clearAllMocks();
    
    // Блокируем вывод ошибок в консоль
    console.error = jest.fn();
    
    // Мокируем localStorage - используем window.localStorage
    window.localStorage.getItem.mockReturnValue(null);
    window.localStorage.setItem.mockClear();
    
    // Настраиваем мок axios с успешным ответом
    axios.get.mockResolvedValue({
      data: mockFeedbackData
    });
  });
  
  afterEach(() => {
    // Восстанавливаем console.error
    console.error = originalConsoleError;
  });

  test('должен загружать данные из API, когда кэш отсутствует', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <FilterProvider>
          <FilterContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FilterContext.Consumer>
        </FilterProvider>
      );
    });
    
    // Проверяем вызов API и загрузку данных
    expect(axios.get).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(contextValue.feedbackData).toEqual(mockFeedbackData);
      expect(localStorage.setItem).toHaveBeenCalledWith('feedbackData', JSON.stringify(mockFeedbackData));
    });
  });

  test('должен инициализироваться с правильными значениями по умолчанию', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <FilterProvider>
          <FilterContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FilterContext.Consumer>
        </FilterProvider>
      );
    });
    
    // Проверяем значения по умолчанию
    expect(contextValue.filter).toBe('daily');
    expect(contextValue.timePeriod).toBe('week');
    expect(contextValue.isLoading).toBe(false);
    expect(contextValue.error).toBe(null);
    // После инициализации должен быть вызов API
    expect(axios.get).toHaveBeenCalled();
  });

  test('должен использовать данные из кэша, если они актуальны', async () => {
    // Устанавливаем данные в кэш
    const cachedData = [...mockFeedbackData, { id: 3, comment: 'Данные из кэша' }];
    const cachedTime = Date.now(); // Текущее время для имитации свежего кэша
    
    // Используем window.localStorage вместо localStorageMock
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'feedbackData') return JSON.stringify(cachedData);
      if (key === 'feedbackDataTimestamp') return cachedTime.toString();
      return null;
    });
    
    let contextValue;
    
    await act(async () => {
      render(
        <FilterProvider>
          <FilterContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FilterContext.Consumer>
        </FilterProvider>
      );
    });
    
    // API не должен вызываться, если есть свежий кэш
    await waitFor(() => {
      expect(contextValue.feedbackData).toEqual(cachedData);
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
  
  test('должен игнорировать кэш если он устарел', async () => {
    // Устанавливаем данные в кэш с устаревшим временем
    const cachedData = [...mockFeedbackData, { id: 3, comment: 'Устаревшие данные' }];
    const cachedTime = Date.now() - 310000; // 5 минут + 10 секунд назад (устарел)
    
    window.localStorage.getItem.mockImplementation((key) => {
      if (key === 'feedbackData') return JSON.stringify(cachedData);
      if (key === 'feedbackDataTimestamp') return cachedTime.toString();
      return null;
    });
    
    let contextValue;
    
    await act(async () => {
      render(
        <FilterProvider>
          <FilterContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FilterContext.Consumer>
        </FilterProvider>
      );
    });
    
    // API должен вызваться для обновления устаревшего кэша
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
      expect(contextValue.feedbackData).toEqual(mockFeedbackData); // Новые данные из API
    });
  });

  test('должен обрабатывать ошибки при загрузке данных', async () => {
    // Настраиваем мок с ошибкой
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    let contextValue;
    
    await act(async () => {
      render(
        <FilterProvider>
          <FilterContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FilterContext.Consumer>
        </FilterProvider>
      );
    });
    
    // Проверяем вызов API и обработку ошибки
    await waitFor(() => {
      expect(contextValue.error).toBe('Не удалось загрузить данные');
      expect(contextValue.feedbackData).toEqual([]);
    });
  });
  
  test('должен обновлять фильтры при вызове setFilter', async () => {
    let contextValue;
    
    await act(async () => {
      render(
        <FilterProvider>
          <FilterContext.Consumer>
            {value => {
              contextValue = value;
              return null;
            }}
          </FilterContext.Consumer>
        </FilterProvider>
      );
    });
    
    // Имитируем изменение фильтра
    act(() => {
      contextValue.setFilter('monthly');
    });
    
    expect(contextValue.filter).toBe('monthly');
  });
});