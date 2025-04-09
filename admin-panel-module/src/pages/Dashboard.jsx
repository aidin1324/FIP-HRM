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
  const { fetchAllFeedbacks, feedbackData, isLoading, setFilter } = useContext(FilterContext);
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
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-4 sm:mb-0">
                Дашборд
              </h1>
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