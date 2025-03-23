import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import LineChartRating from "../../charts/LineChartRating";
import { tailwindConfig, hexToRGB } from "../../utils/Utils";
import { chartAreaGradient } from "../../charts/ChartjsConfig";
import { FilterContext } from "../../contexts/FilterContext";

const LoadingOverlay = React.memo(({ fullScreen = false }) => (
  <div
    className={`absolute inset-0 bg-white/30 dark:bg-gray-800/30 flex items-center justify-center z-10 rounded-xl transition-opacity duration-300 ${
      fullScreen ? "opacity-90" : "opacity-60"
    }`}
  >
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      {fullScreen && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Загрузка данных...
        </p>
      )}
    </div>
  </div>
));

function DashboardCard01() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const { filter, feedbackData, isLoading } = useContext(FilterContext);

  const initialChartConfig = useMemo(
    () => ({
      fill: true,
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        return chartAreaGradient(ctx, chartArea, [
          {
            stop: 0,
            color: `rgba(${hexToRGB(
              tailwindConfig().theme.colors.violet[500]
            )}, 0)`,
          },
          {
            stop: 1,
            color: `rgba(${hexToRGB(
              tailwindConfig().theme.colors.violet[500]
            )}, 0.2)`,
          },
        ]);
      },
      borderColor: tailwindConfig().theme.colors.violet[500],
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 3,
      pointBackgroundColor: tailwindConfig().theme.colors.violet[500],
      pointHoverBackgroundColor: tailwindConfig().theme.colors.violet[500],
      pointBorderWidth: 0,
      pointHoverBorderWidth: 0,
      tension: 0.2,
      clip: 20,
    }),
    []
  );

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Оценка официанта",
        data: [],
        ...initialChartConfig,
      },
    ],
  });

  const processDataForChart = useMemo(() => {
    const processDailyData = (data) => {
      const validFeedbacks = data
        .filter((feedback) => feedback.waiter_score?.score !== null)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      const labels = validFeedbacks.map((feedback) =>
        new Date(feedback.created_at).toLocaleDateString("ru-RU")
      );

      const values = validFeedbacks.map(
        (feedback) => feedback.waiter_score.score
      );

      return { labels, values };
    };

    const processMonthlyData = (data) => {
      const validFeedbacks = data.filter(
        (feedback) => feedback.waiter_score?.score !== null
      );

      const monthlyRatings = validFeedbacks.reduce((acc, feedback) => {
        const date = new Date(feedback.created_at);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!acc[monthKey]) {
          acc[monthKey] = {
            totalScore: 0,
            count: 0,
            month: date.toLocaleString("ru-RU", {
              month: "long",
              year: "numeric",
            }),
            date: date,
          };
        }

        acc[monthKey].totalScore += feedback.waiter_score.score;
        acc[monthKey].count += 1;

        return acc;
      }, {});

      const monthsData = Object.values(monthlyRatings).sort(
        (a, b) => a.date - b.date
      );

      const labels = monthsData.map((item) => item.month);
      const values = monthsData.map(
        (item) => +(item.totalScore / item.count).toFixed(2)
      );

      return { labels, values };
    };

    return { processDailyData, processMonthlyData };
  }, []);

  const updateChartData = useCallback(
    (data, option) => {
      const { processDailyData, processMonthlyData } = processDataForChart;

      let processedData;
      if (option === "daily") {
        processedData = processDailyData(data);
      } else {
        processedData = processMonthlyData(data);
      }

      setChartData((prevData) => ({
        labels: processedData.labels,
        datasets: [
          {
            ...prevData.datasets[0],
            data: processedData.values,
          },
        ],
      }));
    },
    [processDataForChart]
  );

  useEffect(() => {
    if (feedbackData && feedbackData.length > 0) {
      setFeedbacks(feedbackData);
      updateChartData(feedbackData, filter);
    }
  }, [feedbackData, filter, updateChartData]);

  const averageRating = useMemo(() => {
    const dataToUse = feedbackData.length > 0 ? feedbackData : feedbacks;

    if (!dataToUse.length) return "N/A";

    const validFeedbacks = dataToUse.filter(
      (feedback) => feedback.waiter_score?.score !== null
    );

    if (!validFeedbacks.length) return "N/A";

    const sum = validFeedbacks.reduce(
      (total, feedback) => total + feedback.waiter_score.score,
      0
    );

    return (sum / validFeedbacks.length).toFixed(2);
  }, [feedbacks, feedbackData]);

  const totalEntries = useMemo(() => {
    const dataToUse = feedbackData.length > 0 ? feedbackData : feedbacks;

    return dataToUse.filter((feedback) => feedback.waiter_score?.score !== null)
      .length;
  }, [feedbacks, feedbackData]);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4 relative">
      {isLoading && <LoadingOverlay fullScreen={true} />}
      {updating && <LoadingOverlay fullScreen={false} />}

      <header className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Рейтинг официантов
          </h2>
        </div>
      </header>

      <div className="flex items-center space-x-4 mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase">
            Средний рейтинг
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {isLoading ? "—" : averageRating}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase">
            Всего отзывов
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {isLoading ? "—" : totalEntries}
          </span>
        </div>
      </div>

      <div className="flex-grow h-64">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-red-500">{error}</p>
          </div>
        ) : chartData.labels.length > 0 ? (
          <LineChartRating data={chartData} />
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">
                Нет данных для отображения
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default DashboardCard01;
