import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePickerWithRange from '../components/Datepicker';
import { get_customer_comments_path_with_param } from '../api_endpoints';

const CommentCard = React.memo(({ comment }) => (
  <div
    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition duration-200 hover:shadow-lg"
  >
    <div className="flex items-center mb-2">
      <span className="font-semibold text-gray-800 dark:text-gray-200">
        Отзыв #{comment.id}
      </span>
    </div>
    <p className="text-gray-700 dark:text-gray-300 text-sm">
      {comment.comment}
    </p>
  </div>
));

function Comments() {
  const [comments, setComments] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [cursorHistory, setCursorHistory] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);
  const [commentsLimit, setCommentsLimit] = useState(5);
  const [hasMore, setHasMore] = useState(false);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cachedComments, setCachedComments] = useState({});

  const requestParams = useMemo(() => {
    const params = {
      limit: commentsLimit,
      cursor: cursorHistory[currentPage] || null
    };
    
    if (dateRange.from) {
      params.start_date = dateRange.from.toISOString().split('T')[0];
    }
    if (dateRange.to) {
      params.end_date = dateRange.to.toISOString().split('T')[0];
    }
    
    return params;
  }, [dateRange, commentsLimit, currentPage, cursorHistory]);

  const apiUrl = useMemo(() => {
    const url = new URL(get_customer_comments_path_with_param);
    
    if (requestParams.start_date) {
      url.searchParams.append('start_date', requestParams.start_date);
    }
    if (requestParams.end_date) {
      url.searchParams.append('end_date', requestParams.end_date);
    }
    url.searchParams.append('limit', requestParams.limit);
    if (requestParams.cursor !== null) {
      url.searchParams.append('cursor', requestParams.cursor);
    }
    
    return url.toString();
  }, [requestParams]);

  const fetchComments = useCallback(async () => {
    const cacheKey = JSON.stringify(requestParams);

    if (cachedComments[cacheKey]) {
      setComments(cachedComments[cacheKey].feedbacks);
      setHasMore(cachedComments[cacheKey].hasMore);
      setCursor(cachedComments[cacheKey].cursor);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Expected JSON response but received: ${text.substring(0, 100)}`);
      }
      
      const data = await res.json();

      setComments(data.feedbacks);
      setHasMore(data.feedbacks.length === Number(commentsLimit));
      setCursor(data.cursor);

      setCachedComments(prev => ({
        ...prev,
        [cacheKey]: {
          feedbacks: data.feedbacks,
          hasMore: data.feedbacks.length === Number(commentsLimit),
          cursor: data.cursor
        }
      }));
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Ошибка при загрузке комментариев');
      }
      setError(`Не удалось загрузить комментарии: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, requestParams, cachedComments, commentsLimit]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleDateSelect = useCallback((range) => {
    setDateRange(range);
    setCursorHistory([null]);
    setCurrentPage(0);
  }, []);

  const handleLimitChange = useCallback((e) => {
    const newLimit = Number(e.target.value);
    setCommentsLimit(newLimit);
    setCursorHistory([null]);
    setCurrentPage(0);
  }, []);

  const handlePrev = useCallback(() => {
    if (currentPage === 0) return;
    setCurrentPage(prev => prev - 1);
  }, [currentPage]);

  const handleNext = useCallback(() => {
    if (!hasMore) return;
    setCursorHistory(prev => {
      const newHistory = [...prev];
      newHistory[currentPage + 1] = cursor;
      return newHistory;
    });
    setCurrentPage(prev => prev + 1);
  }, [hasMore, cursor, currentPage]);

  const hasComments = useMemo(() => comments.length > 0, [comments]);

  return (
    <div className="min-h-screen p-6 pb-28 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex flex-col h-full mb-8 relative">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
          Комментарии
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <DatePickerWithRange
            className="w-full md:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm"
            onSelect={handleDateSelect}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-gray-700 dark:text-gray-200" htmlFor="limitSelect">
              Показать
            </label>
            <select
              id="limitSelect"
              value={commentsLimit}
              onChange={handleLimitChange}
              className="px-8 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {[5, 10, 50, 100].map(limit => (
                <option key={limit} value={limit}>
                  {limit} стр.
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments Container*/}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="text-center text-gray-700 dark:text-gray-200 py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
              Загрузка комментариев...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-10" role="alert">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pb-24 max-h-[calc(100vh-350px)]">
              {hasComments ? (
                comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-300 py-10">
                  Комментариев не найдено.
                </div>
              )}
            </div>
          )}

          {/* Pagination buttons */}
          <div className="sticky bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 shadow-md border-t border-gray-200 dark:border-gray-700 py-4 z-10">
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrev}
                disabled={currentPage === 0 || loading}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none 
                ${currentPage === 0 || loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-500 text-white hover:bg-violet-600'}`}
                aria-label="Go to previous page"
              >
                Пред.
              </button>
              <span className="text-gray-700 dark:text-gray-200">
                Страница {currentPage + 1}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasMore || loading}
                className={`px-5 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none 
                ${!hasMore || loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-500 text-white hover:bg-violet-600'}`}
                aria-label="Go to next page"
              >
                След.
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Comments;
