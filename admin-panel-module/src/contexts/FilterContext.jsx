import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { get_all_feedbacks } from "../api_endpoints";

export const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filter, setFilter] = useState("daily"); 
  const [timePeriod, setTimePeriod] = useState("week"); 
  const [feedbackData, setFeedbackData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getDateRangeFromPeriod = (period) => {
    const today = new Date();
    const endDate = new Date(today);
    let startDate = new Date(today);

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "yesterday":
        startDate.setDate(today.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(today.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "quarter":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "all":
        return { startDate: null, endDate: null };
      default:
        startDate.setDate(today.getDate() - 7);
    }

    return { startDate, endDate };
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  const fetchAllFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const cachedData = localStorage.getItem('feedbackData');
    const cachedTime = localStorage.getItem('feedbackDataTimestamp');
    
    // Устанавливаем 5 минут как время жизни кэша (300000 мс)
    const CACHE_DURATION = 300000;
    
    if (cachedData && cachedTime && (Date.now() - Number(cachedTime)) < CACHE_DURATION) {
      try {
        const parsedData = JSON.parse(cachedData);
        setFeedbackData(parsedData);
        setIsLoading(false);
        return parsedData;
      } catch (e) {
      }
    }
    
    try {
      const response = await axios.get(get_all_feedbacks);
      
      if (response && response.data) {
        setFeedbackData(response.data);
        
        // Сохраняем в кэш
        localStorage.setItem('feedbackData', JSON.stringify(response.data));
        localStorage.setItem('feedbackDataTimestamp', Date.now().toString());
        
        return response.data;
      }
      throw new Error('Некорректные данные получены от сервера');
    } catch (error) {
      setError('Не удалось загрузить данные');
      console.error('Ошибка загрузки данных:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchAllFeedbacks();
  }, [timePeriod, fetchAllFeedbacks]);

  return (
    <FilterContext.Provider
      value={{
        filter,
        setFilter,
        timePeriod,
        setTimePeriod,
        feedbackData,
        fetchAllFeedbacks,
        isLoading,
        error,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};
