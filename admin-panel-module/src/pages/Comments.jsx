import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

const CommentsList = React.memo(({ comments }) => (
  <div className="space-y-4 overflow-y-auto pb-24 max-h-[calc(100vh-350px)]">
    {comments.map((comment) => (
      <CommentCard key={comment.id || `comment-${Math.random()}`} comment={comment} />
    ))}
  </div>
));

const LoadingIndicator = React.memo(() => (
  <div className="text-center text-gray-700 dark:text-gray-200 py-10">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
    Загрузка комментариев...
  </div>
));

const ErrorMessage = React.memo(({ message }) => (
  <div className="text-center text-red-600 py-10" role="alert">
    <p className="font-semibold">Ошибка</p>
    <p>{message}</p>
  </div>
));

const Pagination = React.memo(({ currentPage, hasMore, loading, onPrev, onNext }) => (
  <div className="sticky bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 shadow-md border-t border-gray-200 dark:border-gray-700 py-4 z-10">
    <div className="flex justify-between items-center">
      <button
        onClick={onPrev}
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
        onClick={onNext}
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
));

function debounce(fn, ms = 300) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

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
  const cacheKeysRef = useRef([]);
  const MAX_CACHE_SIZE = 20;
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const apiUrlRef = useRef(''); 

  const requestParams = useMemo(() => {
    const params = {
      limit: commentsLimit,
      cursor: cursorHistory[currentPage] || null
    };
    
    if (dateRange.from) {
      try {
        params.start_date = dateRange.from.toISOString().split('T')[0];
      } catch (e) {
        params.start_date = null;
      }
    }
    
    if (dateRange.to) {
      try {
        params.end_date = dateRange.to.toISOString().split('T')[0]; 
      } catch (e) {
        params.end_date = null;
      }
    }
    
    return params;
  }, [dateRange.from, dateRange.to, commentsLimit, currentPage, cursorHistory]);
  
  const apiUrl = useMemo(() => {
    try {
      const url = new URL(get_customer_comments_path_with_param);
      
      Object.entries(requestParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, value);
        }
      });
      
      const urlString = url.toString();
      apiUrlRef.current = urlString;
      return urlString;
    } catch (_) {
      return apiUrlRef.current; 
    }
  }, [requestParams]);

  const updateCache = useCallback((key, data) => {
    setCachedComments(prev => {
      if (cacheKeysRef.current.length >= MAX_CACHE_SIZE) {
        try {
          const oldestKey = cacheKeysRef.current.shift();
          const newCache = {};
          Object.keys(prev).forEach(k => {
            if (k !== oldestKey) newCache[k] = prev[k];
          });
          newCache[key] = data;
          return newCache;
        } catch (e) {
          return { [key]: data };
        }
      }
      return { ...prev, [key]: data };
    });

    if (!cacheKeysRef.current.includes(key)) {
      cacheKeysRef.current.push(key);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    if (!apiUrl) return;
    
    const cacheKey = JSON.stringify(requestParams);

    if (cachedComments[cacheKey]) {
      try {
        const cacheData = cachedComments[cacheKey];
        setComments(cacheData.feedbacks || []);
        setHasMore(!!cacheData.hasMore);
        setCursor(cacheData.cursor || null);
        return;
      } catch (e) {
      }
    }

    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (e) {
      }
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      abortControllerRef.current = new AbortController();
    } catch (e) {
      abortControllerRef.current = null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      timeoutRef.current = setTimeout(() => {
        if (abortControllerRef.current) {
          try {
            abortControllerRef.current.abort();
          } catch (e) {
          }
        }
      }, 30000);

      const fetchOptions = {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      };

      if (abortControllerRef.current) {
        fetchOptions.signal = abortControllerRef.current.signal;
      }
      
      const res = await fetch(apiUrl, fetchOptions);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!mountedRef.current) return;
      
      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Неверный формат ответа сервера`);
      }

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Ошибка при обработке ответа сервера`);
      }

      if (!mountedRef.current) return;

      const feedbacks = Array.isArray(data?.feedbacks) ? data.feedbacks : [];

      const processedFeedbacks = feedbacks.map(comment => {
        try {
          return {
            ...comment,
            formattedDate: comment.created_at ? 
              new Date(comment.created_at).toLocaleDateString() : 
              '',
            comment: comment.comment ? 
              (comment.comment.length > 2000 ? 
                comment.comment.substring(0, 2000) + '...' : 
                comment.comment) : 
              'Комментарий отсутствует'
          };
        } catch (e) {
          return {
            id: comment?.id || `fallback-${Math.random()}`,
            comment: 'Ошибка отображения комментария',
            formattedDate: ''
          };
        }
      });
      
      setComments(processedFeedbacks);
      setHasMore(feedbacks.length === Number(commentsLimit));
      setCursor(data?.cursor || null);

      const cacheData = {
        feedbacks: processedFeedbacks,
        hasMore: feedbacks.length === Number(commentsLimit),
        cursor: data?.cursor || null
      };
      
      updateCache(cacheKey, cacheData);
      
    } catch (err) {
      if (err.name !== 'AbortError' && mountedRef.current) {
        setError(`Не удалось загрузить комментарии: ${err.message}`);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiUrl, requestParams, cachedComments, commentsLimit, updateCache]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;

      if (abortControllerRef.current) {
        try {
          abortControllerRef.current.abort();
        } catch (e) {
        }
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedDateSelect = useCallback(
    debounce((range) => {
      setDateRange(range || { from: null, to: null });
      setCursorHistory([null]);
      setCurrentPage(0);
    }, 300),
    []
  );
  
  const handleDateSelect = useCallback((range) => {
    debouncedDateSelect(range);
  }, [debouncedDateSelect]);
  
  const debouncedLimitChange = useCallback(
    debounce((newLimit) => {
      const limit = Math.max(1, Math.min(Number(newLimit) || 5, 100));
      setCommentsLimit(limit);
      setCursorHistory([null]);
      setCurrentPage(0);
    }, 300),
    []
  );
  
  const handleLimitChange = useCallback((e) => {
    const newLimit = Number(e.target.value);
    debouncedLimitChange(newLimit);
  }, [debouncedLimitChange]);

  const handlePrev = useCallback(() => {
    if (currentPage === 0) return;
    setCurrentPage(prev => prev - 1);
  }, [currentPage]);
  
  const handleNext = useCallback(() => {
    if (!hasMore) return;
    setCursorHistory(prev => {
      const newHistory = Array.isArray(prev) ? [...prev] : [null];
      newHistory[currentPage + 1] = cursor;
      return newHistory;
    });
    setCurrentPage(prev => prev + 1);
  }, [hasMore, cursor, currentPage]);

  const hasComments = useMemo(() => 
    Array.isArray(comments) && comments.length > 0, 
  [comments]);

  const renderContent = useMemo(() => {
    if (loading) {
      return <LoadingIndicator />;
    }
    
    if (error) {
      return <ErrorMessage message={error} />;
    }
    
    if (!hasComments) {
      return (
        <div className="text-center text-gray-600 dark:text-gray-300 py-10">
          Комментариев не найдено.
        </div>
      );
    }
    
    return <CommentsList comments={comments} />;
  }, [loading, error, hasComments, comments]);
  
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
              {[5, 10, 20, 50].map(limit => (
                <option key={limit} value={limit}>
                  {limit} стр.
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments Container */}
        <div className="flex-1 flex flex-col">
          {renderContent}

          {/* Pagination buttons */}
          <Pagination 
            currentPage={currentPage}
            hasMore={hasMore}
            loading={loading}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(Comments);