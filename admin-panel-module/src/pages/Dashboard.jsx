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
  const { fetchAllFeedbacks, feedbackData, isLoading, setFilter, filter } = useContext(FilterContext);
  const [visibleCharts, setVisibleCharts] = useState({ chart1: false, chart2: false, chart3: false });
  const [dataLoaded, setDataLoaded] = useState(false);

  const observerRef1 = useRef(null);
  const observerRef2 = useRef(null);
  const observerRef3 = useRef(null);

  const styles = {
    card: "bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6",
  };

  // Функция для загрузки данных с проверкой
  const loadData = useCallback(async () => {
    if (!dataLoaded && feedbackData.length === 0) {
      await fetchAllFeedbacks();
      setDataLoaded(true);
    }
  }, [dataLoaded, feedbackData, fetchAllFeedbacks]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Отображаем заглушки для чартов до загрузки данных
  useEffect(() => {
    // Предзагрузка при монтировании
    loadData();
    
    // После начальной загрузки данных и рендеринга
    // постепенно показываем чарты с задержкой
    if (dataLoaded) {
      const timer1 = setTimeout(() => setVisibleCharts(prev => ({...prev, chart1: true})), 100);
      const timer2 = setTimeout(() => setVisibleCharts(prev => ({...prev, chart2: true})), 300);
      const timer3 = setTimeout(() => setVisibleCharts(prev => ({...prev, chart3: true})), 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [loadData, dataLoaded]);

  useEffect(() => {
    const options = { root: null, rootMargin: "100px", threshold: 0.1 };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const chart = entry.target.dataset.chart;
          setVisibleCharts((prev) => ({ ...prev, [chart]: true }));
        }
      });
    }, options);

    if (observerRef1.current) observer.observe(observerRef1.current);
    if (observerRef2.current) observer.observe(observerRef2.current);
    if (observerRef3.current) observer.observe(observerRef3.current);

    return () => observer.disconnect();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.card}>
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-gray-600 dark:text-gray-300">Обновление данных...</p>
          </div>
        </div>
      );
    }

    if (!feedbackData || feedbackData.length === 0) {
      return (
        <div className={styles.card}>
          <p className="text-center text-gray-600 dark:text-gray-300">Нет данных для отображения</p>
        </div>
      );
    }

    return (
      <>
        <div className="mb-6" data-chart="chart1" ref={observerRef1}>
          {visibleCharts.chart1 ? (
            <Suspense fallback={<CardSkeleton />}>
              <DashboardCard01 />
            </Suspense>
          ) : (
            <CardSkeleton />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div data-chart="chart2" ref={observerRef2}>
            {visibleCharts.chart2 ? (
              <Suspense fallback={<CardSkeleton />}>
                <DashboardCard06 />
              </Suspense>
            ) : (
              <CardSkeleton />
            )}
          </div>

          <div data-chart="chart3" ref={observerRef3}>
            {visibleCharts.chart3 ? (
              <Suspense fallback={<CardSkeleton />}>
                <DashboardCard02 />
              </Suspense>
            ) : (
              <CardSkeleton />
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                Дашборд
              </h1>
              
              <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1.5 border border-gray-100 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-3 pl-2">
                  Сортировка:
                </span>
                <div className="flex bg-gray-100 dark:bg-gray-700/50 rounded-md">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all duration-200 ${
                      filter === "daily"
                        ? "bg-gradient-to-r from-violet-500/90 to-violet-600/90 text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50"
                    }`}
                    onClick={() => setFilter("daily")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    По дням
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center transition-all duration-200 ${
                      filter === "monthly"
                        ? "bg-gradient-to-r from-violet-500/90 to-violet-600/90 text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600/50"
                    }`}
                    onClick={() => setFilter("monthly")}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    По мес.
                  </button>
                </div>
              </div>
            </div>

            {renderContent()}

            {/* Добавляем отступ внизу */}
            <div className="h-36"></div>
          </div>
        </main>
      </div>
    </div>
  );
});

export default Dashboard;