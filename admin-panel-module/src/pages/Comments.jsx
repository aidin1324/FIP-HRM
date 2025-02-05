import React, { useState, useEffect } from 'react';
import DatePickerWithRange from '../components/Datepicker';
import { get_customer_comments_path_with_param } from '../api_endpoints';

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

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = get_customer_comments_path_with_param;
        const url = new URL(apiUrl);
        if (dateRange.from) {
          url.searchParams.append('start_date', dateRange.from.toISOString().split('T')[0]);
        }
        if (dateRange.to) {
          url.searchParams.append('end_date', dateRange.to.toISOString().split('T')[0]);
        }
        url.searchParams.append('limit', commentsLimit);
        const currentCursor = cursorHistory[currentPage];
        if (currentCursor !== null) {
          url.searchParams.append('cursor', currentCursor);
        }
        const res = await fetch(url.toString());
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
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [dateRange, commentsLimit, currentPage, cursorHistory]);

  const handleDateSelect = (range) => {
    setDateRange(range);
    setCursorHistory([null]);
    setCurrentPage(0);
  };

  const handleLimitChange = (e) => {
    const newLimit = Number(e.target.value);
    setCommentsLimit(newLimit);
    setCursorHistory([null]);
    setCurrentPage(0);
  };

  const handlePrev = () => {
    if (currentPage === 0) return;
    setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (!hasMore) return;
    const newHistory = [...cursorHistory];
    newHistory[currentPage + 1] = cursor;
    setCursorHistory(newHistory);
    setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
          Comments Section
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <DatePickerWithRange
            className="w-full md:w-auto rounded-md border border-gray-300 dark:border-gray-600 p-2 shadow-sm"
            onSelect={handleDateSelect}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-gray-700 dark:text-gray-200" htmlFor="limitSelect">
              Show
            </label>
            <select
              id="limitSelect"
              value={commentsLimit}
              onChange={handleLimitChange}
              className="px-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-1500"
            >
              {[5, 10, 50, 100].map(limit => (
                <option key={limit} value={limit}>
                  {limit} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-700 dark:text-gray-200">
            Loading comments...
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center mb-2">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      Comment #{comment.id}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {comment.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-300">
                No comments found.
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none 
            ${currentPage === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-violet-500 text-white hover:bg-violet-600'}`}
          >
            Prev
          </button>
          <span className="text-gray-700 dark:text-gray-200">
            Page {currentPage + 1}
          </span>
          <button
            onClick={handleNext}
            disabled={!hasMore}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none 
            ${!hasMore 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-violet-500 text-white hover:bg-violet-600'}`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Comments;
