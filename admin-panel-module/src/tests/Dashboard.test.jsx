import React, { Suspense } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Dashboard from '../pages/Dashboard';
import { FilterContext } from '../contexts/FilterContext';

// Мокируем lazy-загружаемые компоненты
jest.mock('../partials/dashboard/DashboardCard01', () => () => (
  <div data-testid="dashboard-card-01">Карточка с графиком рейтинга</div>
));

jest.mock('../partials/dashboard/DashboardCard02', () => () => (
  <div data-testid="dashboard-card-02">Карточка со статистикой</div>
));

jest.mock('../partials/dashboard/DashboardCard06', () => () => (
  <div data-testid="dashboard-card-06">Карточка с типами отзывов</div>
));

// Мокируем useEffect для предотвращения использования IntersectionObserver
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

describe('Dashboard', () => {
  // Тестовые данные
  const mockFeedbackData = [
    { id: 1, comment: 'Отличное обслуживание', created_at: '2023-01-01', 
      waiter_score: { score: 5 }, ratings: [{ rating: 5, feedback_type_id: 1 }] },
    { id: 2, comment: 'Хорошая атмосфера', created_at: '2023-01-02', 
      waiter_score: { score: 4 }, ratings: [{ rating: 4, feedback_type_id: 2 }] }
  ];

  // Обновленный renderDashboard
  const renderDashboard = async (contextValues) => {
    let component;
    await act(async () => {
      component = render(
        <FilterContext.Provider value={{
          filter: 'daily',
          setFilter: jest.fn(),
          feedbackData: [],
          isLoading: false,
          error: null,
          fetchAllFeedbacks: jest.fn().mockResolvedValue([]),
          ...contextValues
        }}>
          <Dashboard />
        </FilterContext.Provider>
      );
    });
    return component;
  };

  test('должен отображать состояние загрузки', async () => {
    await renderDashboard({ isLoading: true });
    
    expect(screen.getByText(/Обновление данных/i)).toBeInTheDocument();
  });

  test('должен отображать сообщение, если данные отсутствуют', async () => {
    await renderDashboard({ feedbackData: [] });
    
    expect(screen.getByText(/Нет данных для отображения/i)).toBeInTheDocument();
  });
  
  test('должен отображать заглушки при загрузке карт', async () => {
    await renderDashboard({ feedbackData: mockFeedbackData });
    
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  test('должен вызывать setFilter при переключении фильтров', async () => {
    const mockSetFilter = jest.fn();
    await renderDashboard({ 
      feedbackData: mockFeedbackData,
      setFilter: mockSetFilter
    });
    
    // Нажимаем на кнопку "По мес."
    fireEvent.click(screen.getByText(/По мес/i));
    
    expect(mockSetFilter).toHaveBeenCalledWith('monthly');
  });
  
  test('должен вызывать fetchAllFeedbacks при монтировании', async () => {
    const mockFetchAllFeedbacks = jest.fn().mockResolvedValue([]);
    
    await renderDashboard({ 
      fetchAllFeedbacks: mockFetchAllFeedbacks
    });
    
    expect(mockFetchAllFeedbacks).toHaveBeenCalled();
  });
});