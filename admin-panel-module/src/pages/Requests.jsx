import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { get_request_path } from '../api_endpoints';
import { approve_request_path } from '../api_endpoints';
import axios from 'axios'; 
import { debounce } from 'lodash'; 

const RequestCard = React.memo(({ request, onAccept, onDecline, isLoading }) => {
  return (
    <div
      className="border-b border-gray-200 dark:border-gray-700 pb-2 flex flex-col md:flex-row justify-between items-start md:items-center"
    >
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {request.first_name || request.firstName} {request.last_name || request.lastName}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 text-sm">{request.email}</p>
      </div>
      <div className="flex space-x-2 mt-2 md:mt-0 w-full md:w-auto">
        <button
          onClick={() => onAccept(request.id)}
          className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs w-full md:w-auto"
          disabled={isLoading}
          aria-label={`Accept request from ${request.first_name || request.firstName}`}
        >
          Принять
        </button>
        <button
          onClick={() => onDecline(request.id)}
          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs w-full md:w-auto"
          disabled={isLoading}
          aria-label={`Decline request from ${request.first_name || request.firstName}`}
        >
          Отклонить
        </button>
      </div>
    </div>
  );
});

function Requests() {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
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
      console.error("Failed to fetch requests:", err);
      setError("Failed to load requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filterBySearchQuery = useCallback((query, requestsToFilter) => {
    if (!query.trim()) {
      return requestsToFilter;
    }

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
    if (searchRef.current) {
      searchRef.current(query);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAccept = useCallback(async (id) => {
    setLoading(true);
    try {
      await axios.post(approve_request_path, {
        status: "approved"
      }, {
        params: {
          request_id: id
        }
      });
      
      setRequests(prev => prev.filter(request => request.id !== id));
      setAllRequests(prev => prev.filter(request => request.id !== id));
      
      setSuccessMessage("Request successfully approved.");
      setError(null);
    } catch (err) {
      console.error(`Failed to accept request ${id}:`, err);
      setError("Failed to accept the request. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDecline = useCallback(async (id) => {
    setLoading(true);
    try {
      await axios.post(approve_request_path, {
        status: "rejected"
      }, {
        params: {
          request_id: id
        }
      });

      setRequests(prev => prev.filter(request => request.id !== id));
      setAllRequests(prev => prev.filter(request => request.id !== id));
      
      setSuccessMessage("Request successfully rejected.");
      setError(null);
    } catch (err) {
      console.error(`Failed to decline request ${id}:`, err);
      setError("Failed to decline the request. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const hasRequests = useMemo(() => requests.length > 0, [requests]);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Запросы регистрации</h1>
      
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <input
            type="search"
            className="block w-full p-2.5 pl-10 text-sm text-gray-900 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="Поиск по имени или почте..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 transition-opacity duration-300" role="alert">
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pb-20"> 
        {!loading && hasRequests ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isLoading={loading}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            {searchQuery ? "No matching requests found." : "No requests found."}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Requests;