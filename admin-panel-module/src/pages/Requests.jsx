import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { get_request_path, approve_request_path } from '../api_endpoints';
import axios from 'axios'; 
import { debounce } from 'lodash'; 

const RequestCard = React.memo(({ request, onAccept, onDecline, isLoading }) => {
  const { first_name = '', last_name = '', email = '' } = request;
  const fullName = `${first_name || request.firstName || ''} ${last_name || request.lastName || ''}`.trim();
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              {fullName.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {fullName}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-sm flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {email}
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => onAccept(request.id)}
            className="px-3 py-1.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-all duration-200 text-sm flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            Принять
          </button>
          <button
            onClick={() => onDecline(request.id)}
            className="px-3 py-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-all duration-200 text-sm flex-1 md:flex-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            Отклонить
          </button>
        </div>
      </div>
    </div>
  );
});

const RequestSkeleton = () => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);

function Requests() {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: '', 
    type: 'success'
  });
  const searchRef = useRef(null);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(get_request_path, {});
      const pendingRequests = response.data.filter(request => 
        request.status === "pending"
      );
      
      setAllRequests(pendingRequests);
      setRequests(pendingRequests);
    } catch (err) {
      setError("Не удалось получить запросы. Пожалуйста, попробуйте позже.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterBySearchQuery = useCallback((query, requestsToFilter) => {
    if (!query.trim()) return requestsToFilter;

    const lowerQuery = query.toLowerCase();
    return requestsToFilter.filter(request => {
      const firstName = (request.first_name || request.firstName || '').toLowerCase();
      const lastName = (request.last_name || request.lastName || '').toLowerCase();
      const email = (request.email || '').toLowerCase();
      
      return firstName.includes(lowerQuery) || 
             lastName.includes(lowerQuery) || 
             email.includes(lowerQuery);
    });
  }, []);

  useEffect(() => {
    searchRef.current = debounce((query) => {
      const filteredResults = filterBySearchQuery(query, allRequests);
      setRequests(filteredResults);
    }, 300);

    if (searchQuery.trim()) {
      searchRef.current(searchQuery);
    } else {
      setRequests(allRequests);
    }
    
    return () => {
      if (searchRef.current?.cancel) {
        searchRef.current.cancel();
      }
    };
  }, [allRequests, filterBySearchQuery, searchQuery]);

  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = useCallback(async (id) => {
    setActionLoading(true);
    try {
      await axios.post(approve_request_path, {
        status: "approved"
      }, {
        params: { request_id: id }
      });

      const updateRequests = prev => prev.filter(request => request.id !== id);
      setRequests(updateRequests);
      setAllRequests(updateRequests);
      
      setNotification({
        show: true,
        message: "Запрос успешно принят",
        type: "success"
      });
    } catch (err) {
      setNotification({
        show: true,
        message: "Не удалось выполнить операцию",
        type: "error"
      });
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleDecline = useCallback(async (id) => {
    setActionLoading(true);
    try {
      await axios.post(approve_request_path, {
        status: "rejected"
      }, {
        params: { request_id: id }
      });
      const updateRequests = prev => prev.filter(request => request.id !== id);
      setRequests(updateRequests);
      setAllRequests(updateRequests);
      
      setNotification({
        show: true,
        message: "Запрос успешно отклонен",
        type: "success"
      });
    } catch (err) {
      setNotification({
        show: true,
        message: "Не удалось выполнить операцию",
        type: "error"
      });
    } finally {
      setActionLoading(false);
    }
  }, []);

  const hasRequests = useMemo(() => requests.length > 0, [requests]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
          Запросы регистрации
        </h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-3 pl-10 text-sm text-gray-900 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 shadow-sm"
            placeholder="Поиск по имени или почте..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {notification.show && (
        <div 
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full animate-fade-in"
        >
          <div 
            className={`mx-4 rounded-lg shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-800' 
                : 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center">
                {notification.type === 'success' ? (
                  <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <p className={`text-sm font-medium ${
                  notification.type === 'success' 
                    ? 'text-gray-800 dark:text-gray-100' 
                    : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {notification.message}
                </p>
              </div>
              <button 
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{error}</p>
          </div>
          <div className="mt-2">
            <button 
              onClick={fetchRequests} 
              className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Попробовать снова
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <RequestSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        )}

        {!loading && hasRequests && (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isLoading={actionLoading}
              />
            ))}
          </div>
        )}

        {!loading && hasRequests && (
          <div className="h-36 md:h-24"></div>
        )}

        {!loading && !hasRequests && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {searchQuery ? "Запросы не найдены" : "Нет запросов на рассмотрении"}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? "Попробуйте изменить параметры поиска" 
                : "В настоящее время нет запросов на регистрацию, требующих вашего внимания"}
            </p>
            {searchQuery && (
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                  onClick={() => setSearchQuery('')}
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Очистить поиск
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Requests;