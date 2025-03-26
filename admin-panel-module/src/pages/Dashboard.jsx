import React, { useContext, useEffect, useState, useRef, useCallback, lazy, Suspense } from "react";
import { FilterContext } from "../contexts/FilterContext";

const DashboardCard01 = lazy(() => import("../partials/dashboard/DashboardCard01"));
const DashboardCard02 = lazy(() => import("../partials/dashboard/DashboardCard02"));
const DashboardCard06 = lazy(() => import("../partials/dashboard/DashboardCard06"));

const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
  </div>
);

const Dashboard = React.memo(() => {
  const { fetchAllFeedbacks, timePeriod, filter, setFilter, isLoading } = useContext(FilterContext);
  const [visibleCharts, setVisibleCharts] = useState({ chart1: false, chart2: false, chart3: false });

  const observerRef1 = useRef(null);
  const observerRef2 = useRef(null);
  const observerRef3 = useRef(null);

  const styles = {
    button: {
      base: "flex items-center justify-center h-8 px-4 rounded-md text-sm font-medium transition-all duration-150",
      active: "bg-violet-500 text-white shadow-inner",
      inactive: "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
    },
    icon: {
      base: "w-4 h-4 mr-2",
      active: "text-white",
      inactive: "text-violet-500 dark:text-violet-400"
    },
    card: "bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6"
  };

  const getPeriodLabel = useCallback((period) => {
    const labels = {
      today: "Сегодня",
      yesterday: "Вчера",
      week: "Последняя неделя",
      month: "Последний месяц",
      quarter: "Последний квартал",
      year: "Последний год",
      all: "Все время"
    };
    return labels[period] || "Выбранный период";
  }, []);
  
  const handleGroupingChange = useCallback((type) => {
    setFilter(type);
  }, [setFilter]);
  
  const debouncedFetchData = useCallback(() => {
    fetchAllFeedbacks();
  }, [fetchAllFeedbacks]);

  useEffect(() => {
    const options = { root: null, rootMargin: '100px', threshold: 0.1 };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const chart = entry.target.dataset.chart;
          setVisibleCharts(prev => ({ ...prev, [chart]: true }));
        }
      });
    }, options);
    
    if (observerRef1.current) observer.observe(observerRef1.current);
    if (observerRef2.current) observer.observe(observerRef2.current);
    if (observerRef3.current) observer.observe(observerRef3.current);
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAllFeedbacks();
  }, [fetchAllFeedbacks]);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Заголовок и управление */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-4 sm:mb-0">
                Дашборд
              </h1>
              
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <div className="relative">
                  <div className="inline-flex items-center p-1 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <button
                      className={`${styles.button.base} ${filter === "daily" ? styles.button.active : styles.button.inactive}`}
                      onClick={() => handleGroupingChange("daily")}
                      aria-pressed={filter === "daily"}
                    >
                      <svg
                        className={`${styles.icon.base} ${filter === "daily" ? styles.icon.active : styles.icon.inactive}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      По дням
                    </button>
                    <button
                      className={`${styles.button.base} ${filter === "monthly" ? styles.button.active : styles.button.inactive}`}
                      onClick={() => handleGroupingChange("monthly")}
                      aria-pressed={filter === "monthly"}
                    >
                      <svg
                        className={`${styles.icon.base} ${filter === "monthly" ? styles.icon.active : styles.icon.inactive}`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      По месяц.
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-900/20 dark:to-violet-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-800/40 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Текущие настройки отображения данных</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-200">
                        <span className="mr-1 font-normal">Период:</span> {getPeriodLabel(timePeriod)}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-800/50 dark:text-violet-200">
                        <span className="mr-1 font-normal">Группировка:</span> {filter === "daily" ? "По дням" : "По месяцам"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={debouncedFetchData}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 shadow-sm disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-2 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isLoading ? "Обновление..." : "Обновить данные"}
                </button>
              </div>
            </div>

            {isLoading && (
              <div className={styles.card}>
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Обновление данных...
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6" data-chart="chart1" ref={observerRef1}>
              {visibleCharts.chart1 ? (
                <Suspense fallback={<CardSkeleton />}>
                  <DashboardCard01 />
                </Suspense>
              ) : <CardSkeleton />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div data-chart="chart2" ref={observerRef2}>
                {visibleCharts.chart2 ? (
                  <Suspense fallback={<CardSkeleton />}>
                    <DashboardCard06 />
                  </Suspense>
                ) : <CardSkeleton />}
              </div>
              
              <div data-chart="chart3" ref={observerRef3}>
                {visibleCharts.chart3 ? (
                  <Suspense fallback={<CardSkeleton />}>
                    <DashboardCard02 />
                  </Suspense>
                ) : <CardSkeleton />}
              </div>
            </div>

            <div className="h-24"></div>
          </div>
        </main>
      </div>
    </div>
  );
});

export default Dashboard;