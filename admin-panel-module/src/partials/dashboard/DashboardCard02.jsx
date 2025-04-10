import React, { useState, useEffect, useMemo, memo } from 'react';
import axios from 'axios';
import { get_all_feedbacks } from '../../api_endpoints';

const CATEGORY_NAMES = {
  1: "Положительные",
  2: "Нейтральные",   
  3: "Отрицательные"  
};

const TAG_NAMES = {
  1: "Вежливость",
  2: "Быстрота",
  3: "Внимательность",
  4: "Знание меню",
  5: "Чистота",
  6: "Атмосфера общения",
  7: "Грубость",
  8: "Медлительность",
  9: "Игнорирование",
  10: "Ошибки в заказе",
  11: "Неряшливость",
  12: "Отказ в помощи",
  13: "Оперативность",
  14: "Уважение",
  15: "Информативность",
  16: "Качество подачи",
  17: "Вовлечённость",
  18: "Реакции на запросы"
};

const FEEDBACK_TYPES = {
  1: "Скорость обслуживания",
  2: "Атмосфера"
};

const StarRating = memo(({ rating }) => {
  return (
    <div className="flex mt-2 mb-1">
      {[1, 2, 3, 4, 5].map(star => (
        <svg key={star} 
          className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
});

const StatCard = memo(({ 
  bgColor, 
  titleColor, 
  title, 
  children,
  className = '' 
}) => (
  <div className={`${bgColor} p-5 rounded-lg flex flex-col justify-between h-auto min-h-[110px] ${className}`}>
    <div className={`text-sm font-semibold ${titleColor} uppercase mb-3`}>{title}</div>
    {children}
  </div>
));

function DashboardCard02() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const CACHE_DURATION = 60000; 
  
  useEffect(() => {
    const fetchData = async () => {
      const now = Date.now();
      if (now - lastFetchTime < CACHE_DURATION && feedbackData.length > 0) {
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await axios.get(get_all_feedbacks);
        setFeedbackData(response.data);
        setLastFetchTime(now);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [lastFetchTime, feedbackData.length]);

  const { totalFeedbacks, contactsLeft } = useMemo(() => ({
    totalFeedbacks: feedbackData.length,
    contactsLeft: feedbackData.filter(item => item.contact !== null).length
  }), [feedbackData]);
  
  const avgRating = useMemo(() => {
    let total = 0;
    let count = 0;
    
    feedbackData.forEach(feedback => {
      if (feedback.waiter_score?.score) {
        total += feedback.waiter_score.score;
        count++;
      }
    });
    
    return count > 0 ? (total / count).toFixed(1) : 0;
  }, [feedbackData]);
  
  const positivePercent = useMemo(() => {
    const positiveCount = feedbackData.filter(
      feedback => feedback.waiter_score?.score > 3
    ).length;
    
    return totalFeedbacks > 0 
      ? Math.round((positiveCount / totalFeedbacks) * 100) 
      : 0;
  }, [feedbackData, totalFeedbacks]);

  const { topCategory, topTag } = useMemo(() => {
    // Используем reduce вместо нескольких циклов
    const counts = feedbackData.reduce((acc, feedback) => {
      if (feedback.waiter_score) {
        const { category_id, tag_id } = feedback.waiter_score;
        
        if (category_id) {
          acc.categories[category_id] = (acc.categories[category_id] || 0) + 1;
        }
        
        if (tag_id) {
          acc.tags[tag_id] = (acc.tags[tag_id] || 0) + 1;
        }
      }
      return acc;
    }, { categories: {}, tags: {} });

    const findMaxId = obj => {
      let maxId = null;
      let maxCount = 0;
      
      Object.entries(obj).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          maxId = id;
        }
      });
      
      return maxId;
    };
    
    const topCategoryId = findMaxId(counts.categories);
    const topTagId = findMaxId(counts.tags);
    
    return {
      topCategory: topCategoryId ? CATEGORY_NAMES[topCategoryId] || `Категория ${topCategoryId}` : 'Нет данных',
      topTag: topTagId ? TAG_NAMES[topTagId] || `Тег ${topTagId}` : 'Нет данных'
    };
  }, [feedbackData]);

  const stats = { totalFeedbacks, contactsLeft, avgRating, positivePercent, topCategory, topTag };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg h-full flex flex-col`}>
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center z-10 rounded-xl">
          <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <div className="px-5 pt-5">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Сводная статистика
        </h2>
      </div>
      
      <div className="flex-grow px-5 pb-5">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            <StatCard 
              className="col-span-1 sm:col-span-2" 
              bgColor="bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20" 
              titleColor="text-violet-600 dark:text-violet-300" 
              title="Статистика отзывов"
            >
              <div className="flex flex-col space-y-3 mt-auto">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Всего отзывов:</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.totalFeedbacks}</span>
                </div>
                
                <div className="w-full h-px bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">С контактами:</span>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 mr-2">
                      {stats.contactsLeft}
                    </span>
                    <span className="text-sm px-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                      {stats.totalFeedbacks > 0 
                        ? Math.round((stats.contactsLeft / stats.totalFeedbacks) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
                
                {/* Прогресс-бар для визуализации */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: `${stats.totalFeedbacks > 0 
                      ? Math.round((stats.contactsLeft / stats.totalFeedbacks) * 100) 
                      : 0}%` }}
                  ></div>
                </div>
              </div>
            </StatCard>

            {/* Остальные карточки остаются без изменений */}
            <StatCard 
              bgColor="bg-amber-50 dark:bg-amber-900/20" 
              titleColor="text-amber-600 dark:text-amber-300" 
              title="Средний рейтинг"
            >
              <div className="flex items-end">
                <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.avgRating}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 ml-1 mb-1">/5</div>
              </div>
              <StarRating rating={stats.avgRating} />
            </StatCard>

            <StatCard 
              bgColor="bg-emerald-50 dark:bg-emerald-900/20" 
              titleColor="text-emerald-600 dark:text-emerald-300" 
              title="Положительные отзывы"
            >
              <div className="flex flex-col mt-auto">
                <div className="flex items-end mb-2">
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.positivePercent}%</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-emerald-500 h-2.5 rounded-full" 
                    style={{ width: `${stats.positivePercent}%` }}
                  ></div>
                </div>
              </div>
            </StatCard>

            <StatCard 
              bgColor="bg-gray-50 dark:bg-gray-700/30" 
              titleColor="text-gray-600 dark:text-gray-300" 
              title="Популярная категория"
            >
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">
                {stats.topCategory}
              </div>
            </StatCard>

            <StatCard 
              bgColor="bg-purple-50 dark:bg-purple-900/20" 
              titleColor="text-purple-600 dark:text-purple-300" 
              title="Частый тег"
            >
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 truncate">
                {stats.topTag}
              </div>
            </StatCard>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard02;