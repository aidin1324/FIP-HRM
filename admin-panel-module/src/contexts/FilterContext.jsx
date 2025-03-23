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

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(timePeriod);

      let url = get_all_feedbacks;
      const queryParams = [];

      if (startDate) {
        const formattedStartDate = formatDate(startDate);
        queryParams.push(`start_date=${formattedStartDate}`);
      }
      if (endDate) {
        const formattedEndDate = formatDate(endDate);
        queryParams.push(`end_date=${formattedEndDate}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
      const response = await axios.get(url);
      setFeedbackData(response.data);
      return response.data;
    } catch (err) {
      setError("Не удалось загрузить данные");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [timePeriod]);

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
