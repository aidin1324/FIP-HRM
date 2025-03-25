import React, { useContext, useEffect } from "react";
import DashboardCard01 from "../partials/dashboard/DashboardCard01";
import DashboardCard02 from "../partials/dashboard/DashboardCard02";
// import DashboardCard03 from "../partials/dashboard/DashboardCard03";
// import DashboardCard04 from "../partials/dashboard/DashboardCard04";
// import DashboardCard05 from "../partials/dashboard/DashboardCard05";
import DashboardCard06 from "../partials/dashboard/DashboardCard06";
// import DashboardCard07 from "../partials/dashboard/DashboardCard07";
// import DashboardCard08 from "../partials/dashboard/DashboardCard08";
// import DashboardCard09 from "../partials/dashboard/DashboardCard09";
// import DashboardCard10 from "../partials/dashboard/DashboardCard10";
// import DashboardCard11 from "../partials/dashboard/DashboardCard11";
// import DashboardCard12 from "../partials/dashboard/DashboardCard12";
// import DashboardCard13 from "../partials/dashboard/DashboardCard13";
import { FilterContext } from "../contexts/FilterContext";

function Dashboard() {
  const { fetchAllFeedbacks, timePeriod, filter, setFilter, isLoading } =
    useContext(FilterContext);

  useEffect(() => {
    fetchAllFeedbacks();
  }, [fetchAllFeedbacks]);

  const getPeriodLabel = (period) => {
    switch (period) {
      case "today":
        return "Сегодня";
      case "yesterday":
        return "Вчера";
      case "week":
        return "Последняя неделя";
      case "month":
        return "Последний месяц";
      case "quarter":
        return "Последний квартал";
      case "year":
        return "Последний год";
      case "all":
        return "Все время";
      default:
        return "Выбранный период";
    }
  };

  const handleGroupingChange = (type) => {
    setFilter(type);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Дашборд
                </h1>
              </div>

              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <div className="relative">
                  <div className="inline-flex items-center p-1 rounded-md bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <button
                      className={`flex items-center justify-center h-8 px-4 rounded-md text-sm font-medium transition-all duration-150 ${
                        filter === "daily"
                          ? "bg-violet-500 text-white shadow-inner"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                      onClick={() => handleGroupingChange("daily")}
                      aria-pressed={filter === "daily"}
                    >
                      <svg
                        className={`w-4 h-4 mr-2 ${
                          filter === "daily"
                            ? "text-white"
                            : "text-violet-500 dark:text-violet-400"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      По дням
                    </button>
                    <button
                      className={`flex items-center justify-center h-8 px-4 rounded-md text-sm font-medium transition-all duration-150 ${
                        filter === "monthly"
                          ? "bg-violet-500 text-white shadow-inner"
                          : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                      onClick={() => handleGroupingChange("monthly")}
                      aria-pressed={filter === "monthly"}
                    >
                      <svg
                        className={`w-4 h-4 mr-2 ${
                          filter === "monthly"
                            ? "text-white"
                            : "text-violet-500 dark:text-violet-400"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
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
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
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
                  onClick={() => fetchAllFeedbacks()}
                  className="inline-flex items-center px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Обновить данные
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Обновление данных...
                </p>
              </div>
            )}

            {/* Новая разметка графиков */}
            {/* Первый график на полную ширину */}
            <div className="mb-6">
              <DashboardCard01 />
            </div>

            {/* Вторая строка с двумя графиками */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <DashboardCard06 />
              </div>
              <div>
                <DashboardCard02 />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

              {/* <DashboardCard03 />
              
              <DashboardCard04 />
              
              <DashboardCard05 />
            
              <DashboardCard02 />
            
              <DashboardCard07 />
           
              <DashboardCard08 />
          
              <DashboardCard09 /> */}
              {/* Можно добавить сколько активных официантов */}
              {/* <DashboardCard10 /> */}
        
              {/* <DashboardCard11 />
      
              <DashboardCard12 />

              <DashboardCard13 /> */}
            </div>

            <div className="h-24"></div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
