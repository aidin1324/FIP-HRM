import React, { createContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { get_all_feedbacks } from '../api_endpoints';

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filter, setFilter] = useState('daily');
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null
  });
  const [feedbackData, setFeedbackData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Общая функция для загрузки данных, доступная всем компонентам
  const fetchAllFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(get_all_feedbacks);
      setFeedbackData(response.data);
      return response.data;
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFeedbackData = useCallback((newData) => {
    setFeedbackData(newData);
  }, []);

  const filteredByDateData = useMemo(() => {
    if (!feedbackData.length || !dateRange.start) return feedbackData;
    
    return feedbackData.filter(feedback => {
      const feedbackDate = new Date(feedback.created_at);
      const startDate = new Date(dateRange.start);
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
      
      return feedbackDate >= startDate && feedbackDate <= endDate;
    });
  }, [feedbackData, dateRange]);

  return (
    <FilterContext.Provider value={{ 
      filter, 
      setFilter,
      dateRange,
      setDateRange,
      feedbackData,
      updateFeedbackData,
      fetchAllFeedbacks,
      isLoading,
      error
    }}>
      {children}
    </FilterContext.Provider>
  );
};