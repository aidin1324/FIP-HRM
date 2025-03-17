import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import BarChart from "../../charts/BarChartRating";
import { get_all_feedbacks } from "../../api_endpoints";
import { tailwindConfig } from "../../utils/Utils";
import { useThemeProvider } from "../../utils/ThemeContext";
import { FilterContext } from "../../contexts/FilterContext";

const FEEDBACK_TYPE_NAMES = {
  1: "Скор. обслуж.",
  2: "Атмосфера",
};

const groupFeedbacksByMonth = (feedbacks) => {
  const groupedByMonth = {};

  feedbacks.forEach((feedback) => {
    if (!feedback.ratings?.length) return;

    const date = new Date(feedback.created_at);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!groupedByMonth[monthKey]) {
      groupedByMonth[monthKey] = [];
    }

    groupedByMonth[monthKey].push(feedback);
  });

  return groupedByMonth;
};

const aggregateMonthlyRatings = (monthFeedbacks) => {
  const aggregated = {
    created_at: monthFeedbacks[0].created_at,
    ratings: [],
  };

  const ratingsByType = monthFeedbacks.reduce((acc, feedback) => {
    if (!feedback.ratings?.length) return acc;

    feedback.ratings.forEach((rating) => {
      const typeId = rating.feedback_type_id;

      if (!acc[typeId]) {
        acc[typeId] = {
          sum: 0,
          count: 0,
          feedback_type_id: typeId,
        };
      }

      acc[typeId].sum += rating.rating;
      acc[typeId].count++;
    });

    return acc;
  }, {});

  aggregated.ratings = Object.values(ratingsByType).map((item) => ({
    rating: item.sum / item.count,
    feedback_type_id: item.feedback_type_id,
  }));

  return aggregated;
};

const StatisticsTable = React.memo(({ ratingsByType }) => (
  <div className="mt-4">
    <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
      Статистика оценок:
    </h3>
    <div className="space-y-1">
      {ratingsByType.map((item) => (
        <div key={item.typeId} className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {item.category}:
          </span>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {item.meanRating}
          </span>
        </div>
      ))}
    </div>
  </div>
));

const ErrorDisplay = React.memo(({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
    <p className="text-red-500 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md transition-colors"
    >
      Попробовать снова
    </button>
  </div>
));

const useFeedbackData = (filter) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [updating, setUpdating] = useState(false); 
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFeedbacks = useCallback((isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setUpdating(true);
    }
    setError(null);

    const controller = new AbortController();

    axios
      .get(get_all_feedbacks, { signal: controller.signal })
      .then((response) => {
        setFeedbacks(response.data);
        setLastUpdated(new Date());
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          console.error("Ошибка при загрузке данных:", err);
          setError("Не удалось загрузить данные оценок");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setUpdating(false);
        }
      });

    return () => {
      controller.abort(); 
    };
  }, []);

  useEffect(() => {
    const cleanup = fetchFeedbacks(true); 
    return cleanup;
  }, [fetchFeedbacks]);

  const ratingsByType = useMemo(() => {
    if (!feedbacks.length) return [];

    let filteredFeedbacks = feedbacks;

    if (filter === "monthly") {
      const groupedByMonth = groupFeedbacksByMonth(feedbacks);
      filteredFeedbacks = Object.values(groupedByMonth).map(
        aggregateMonthlyRatings
      );
    }

    const typeRatings = filteredFeedbacks.reduce((acc, feedback) => {
      if (!feedback.ratings?.length) return acc;

      feedback.ratings.forEach((rating) => {
        const typeId = rating.feedback_type_id;

        if (!acc[typeId]) {
          acc[typeId] = {
            totalRating: 0,
            count: 0,
            typeId: typeId,
          };
        }

        acc[typeId].totalRating += rating.rating;
        acc[typeId].count += 1;
      });

      return acc;
    }, {});

    return Object.values(typeRatings)
      .map((item) => ({
        typeId: item.typeId,
        category: FEEDBACK_TYPE_NAMES[item.typeId] || `Тип ${item.typeId}`,
        meanRating: +(item.totalRating / item.count).toFixed(2),
        count: item.count,
      }))
      .sort((a, b) => a.typeId - b.typeId);
  }, [feedbacks, filter]);

  return {
    feedbacks,
    loading,
    updating, 
    error,
    lastUpdated,
    fetchFeedbacks,
    ratingsByType,
  };
};

const LoadingOverlay = React.memo(({ fullScreen = false }) => (
  <div className={`absolute inset-0 bg-white/30 dark:bg-gray-800/30 flex items-center justify-center z-10 rounded-xl transition-opacity duration-300 ${fullScreen ? 'opacity-90' : 'opacity-60'}`}>
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      {fullScreen && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Загрузка данных...</p>}
    </div>
  </div>
));

// Основной компонент карточки
function DashboardCard06() {
  const { currentTheme } = useThemeProvider();
  const { filter, feedbackData, isLoading, error } = useContext(FilterContext);
  const darkMode = currentTheme === 'dark';
  const [updating, setUpdating] = useState(false);
  
  const cardBaseStyle =
    "flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl";

  const ratingsByType = useMemo(() => {
    if (!feedbackData?.length) return [];

    let filteredFeedbacks = feedbackData;

    if (filter === "monthly") {
      const groupedByMonth = groupFeedbacksByMonth(feedbackData);
      filteredFeedbacks = Object.values(groupedByMonth).map(
        aggregateMonthlyRatings
      );
    }

    const typeRatings = filteredFeedbacks.reduce((acc, feedback) => {
      if (!feedback.ratings?.length) return acc;

      feedback.ratings.forEach((rating) => {
        const typeId = rating.feedback_type_id;

        if (!acc[typeId]) {
          acc[typeId] = {
            totalRating: 0,
            count: 0,
            typeId: typeId,
          };
        }

        acc[typeId].totalRating += rating.rating;
        acc[typeId].count += 1;
      });

      return acc;
    }, {});

    return Object.values(typeRatings)
      .map((item) => ({
        typeId: item.typeId,
        category: FEEDBACK_TYPE_NAMES[item.typeId] || `Тип ${item.typeId}`,
        meanRating: +(item.totalRating / item.count).toFixed(2),
        count: item.count,
      }))
      .sort((a, b) => a.typeId - b.typeId);
  }, [feedbackData, filter]);

  const chartData = useMemo(() => {
    if (!ratingsByType.length) return { labels: [], datasets: [] };

    const colors = [
      tailwindConfig().theme.colors.violet[500],
      tailwindConfig().theme.colors.sky[500],
      tailwindConfig().theme.colors.emerald[500],
      tailwindConfig().theme.colors.amber[500],
      tailwindConfig().theme.colors.rose[500],
    ];

    const hoverColors = [
      tailwindConfig().theme.colors.violet[600],
      tailwindConfig().theme.colors.sky[600],
      tailwindConfig().theme.colors.emerald[600],
      tailwindConfig().theme.colors.amber[600],
      tailwindConfig().theme.colors.rose[600],
    ];

    const labels = ratingsByType.map((item) => item.category);
    const data = ratingsByType.map((item) => item.meanRating);
    const backgroundColor = ratingsByType.map(
      (_, i) => colors[i % colors.length]
    );
    const hoverBackgroundColor = ratingsByType.map(
      (_, i) => hoverColors[i % hoverColors.length]
    );

    return {
      labels,
      datasets: [
        {
          label: "Средняя оценка",
          data,
          backgroundColor,
          hoverBackgroundColor,
          borderWidth: 0,
        },
      ],
    };
  }, [ratingsByType]);

  return (
    <div className={`${cardBaseStyle} p-4 relative`}>
      {isLoading && <LoadingOverlay fullScreen={true} />}
      {updating && <LoadingOverlay fullScreen={false} />}
      
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">
          Средние оценки по категориям
        </h2>
      </header>

      <div className="p-3 relative">
        {error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-center text-red-500">{error}</p>
          </div>
        )}

        {!error && (
          <>
            {ratingsByType.length > 0 ? (
              <>
                <BarChart data={chartData} hideStarInTooltip={true} />
                <StatisticsTable ratingsByType={ratingsByType} />
              </>
            ) : (
              !isLoading && (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500 dark:text-gray-400">
                    Нет данных для отображения
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DashboardCard06;
