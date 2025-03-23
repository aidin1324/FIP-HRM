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

                <div className="relative inline-flex">
                  <div className="btn-group flex space-x-2"> 
                    <button
                      className={`btn border-gray-200 dark:border-gray-700 px-3 ${
                        filter === "daily"
                          ? "bg-violet-500 text-white hover:bg-violet-600"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      }`}
                      onClick={() => handleGroupingChange("daily")}
                    >
                      По дням
                    </button>
                    <button
                      className={`btn border-gray-200 dark:border-gray-700 px-3 ${
                        filter === "monthly"
                          ? "bg-violet-500 text-white hover:bg-violet-600"
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      }`}
                      onClick={() => handleGroupingChange("monthly")}
                    >
                      По месяцам
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm p-3 rounded-md mb-4 flex justify-between items-center">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Период: <strong>{getPeriodLabel(timePeriod)}</strong> •
                  Группировка:{" "}
                  <strong>
                    {filter === "daily" ? "По дням" : "По месяцам"}
                  </strong>
                </span>
              </span>
            </div>

            {isLoading && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Обновление данных...
                </p>
              </div>
            )}

            <div className="grid grid-cols-12 gap-6 mb-6">
              <div className="col-span-12 xl:col-span-8">
                <DashboardCard01 />
              </div>
              <div className="col-span-12 sm:col-span-6 xl:col-span-4">
                <DashboardCard06 />
              </div>
              <DashboardCard02 />
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
