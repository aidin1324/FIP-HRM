import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DatePickerWithRange from '../components/Datepicker';
import { get_all_feedbacks } from '../api_endpoints';
import axios from 'axios';

// Обновленный компонент FeedbackCard с возможностью копирования номера телефона
const FeedbackCard = React.memo(({ contact }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      
      // Сброс индикатора копирования через 2 секунды
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Не удалось скопировать текст: ', err);
    }
  }, [contact.phone]);

  // Мемоизация содержимого рейтингов
  const ratingsContent = useMemo(() => {
    if (!contact.ratings?.length) return null;
    
    return (
      <div className="mt-3 border-t pt-2 border-gray-200 dark:border-gray-700">
        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Оценки:</p>
        <div className="flex flex-wrap gap-2">
          {contact.ratings.map((rating, index) => (
            <span key={index} className="inline-flex items-center px-2 py-1 bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200 text-xs rounded">
              Тип {rating.feedback_type_id}: {rating.rating} ⭐
            </span>
          ))}
        </div>
      </div>
    );
  }, [contact.ratings]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition duration-200 hover:shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-800 dark:text-gray-200">
          Отзыв #{contact.id}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(contact.date).toLocaleDateString()}
        </span>
      </div>
      <div className="text-sm space-y-2">
        {/* Выделенный телефон с кнопкой копирования */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Телефон:</span>{' '}
            <span className="font-mono">{contact.phone}</span>
          </p>
          <button
            onClick={copyToClipboard}
            className={`ml-2 p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 ${
              copied
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-violet-100 hover:text-violet-700 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-violet-800 dark:hover:text-violet-200'
            }`}
            aria-label="Скопировать номер телефона"
            title="Скопировать номер"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
        
        {contact.waiterScore !== null && (
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium">Оценка официанта:</span> {contact.waiterScore} ⭐
          </p>
        )}
        {contact.comment && (
          <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
            <span className="font-medium">Комментарий:</span><br/>
            {contact.comment}
          </p>
        )}
        {ratingsContent}
      </div>
    </div>
  );
});

function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [contactsPerPage, setContactsPerPage] = useState(5);
  const [cachedData, setCachedData] = useState({});

  const requestParams = useMemo(() => {
    const params = {};
    
    if (dateRange.from) {
      params.start_date = dateRange.from.toISOString().split('T')[0];
    }
    if (dateRange.to) {
      params.end_date = dateRange.to.toISOString().split('T')[0];
    }
    
    return params;
  }, [dateRange]);

  const apiUrl = useMemo(() => {
    let url = get_all_feedbacks;
    const queryParams = [];
    
    if (requestParams.start_date) {
      queryParams.push(`start_date=${requestParams.start_date}`);
    }
    if (requestParams.end_date) {
      queryParams.push(`end_date=${requestParams.end_date}`);
    }
    
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }
    
    return url;
  }, [requestParams]);

  // Функция для загрузки отзывов с API
  const fetchContacts = useCallback(async () => {
    // Уникальный ключ для кэша на основе параметров запроса
    const cacheKey = JSON.stringify(requestParams);
    
    // Если данные уже закэшированы и есть параметры фильтрации,
    // важно НЕ использовать кеш при первом применении фильтра
    const shouldUseCache = cachedData[cacheKey] && (
      !requestParams.start_date && !requestParams.end_date || 
      Object.keys(cachedData).length > 1
    );
    
    if (shouldUseCache) {
      const formattedContacts = cachedData[cacheKey];
      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(apiUrl);
      
      // Преобразуем данные API в удобный формат для отображения
      const formattedContacts = response.data.map(feedback => ({
        id: feedback.id,
        name: feedback.contact ? feedback.contact.name || "Гость" : "Гость",
        phone: feedback.contact ? feedback.contact.phone || "Нет данных" : "Нет данных",
        date: feedback.created_at || new Date().toISOString(),
        waiterScore: feedback.waiter_score ? feedback.waiter_score.score : null,
        comment: feedback.waiter_score ? feedback.waiter_score.comment || "" : "",
        ratings: feedback.ratings || []
      }));
      
      // Дополнительная клиентская фильтрация, на случай если API не фильтрует должным образом
      let clientFilteredContacts = formattedContacts;
      if (dateRange.from || dateRange.to) {
        clientFilteredContacts = formattedContacts.filter(contact => {
          const contactDate = new Date(contact.date);
          const startDate = dateRange.from ? new Date(dateRange.from) : null;
          const endDate = dateRange.to ? new Date(dateRange.to) : null;
          
          if (startDate && contactDate < startDate) return false;
          if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            if (contactDate > endOfDay) return false;
          }
          return true;
        });
      }
      
      setContacts(formattedContacts);
      setFilteredContacts(clientFilteredContacts);
      
      // Сохраняем в кэш
      setCachedData(prev => ({
        ...prev,
        [cacheKey]: clientFilteredContacts
      }));
      
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
      setError('Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, requestParams, cachedData, dateRange]);

  // Загрузка данных при монтировании компонента или изменении параметров
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Обработчик изменения диапазона дат
  const handleDateRangeChange = useCallback((range) => {
    setDateRange(range);
    setCurrentPage(1);
  }, []);

  // Обработчик изменения количества отзывов на странице
  const handleContactsPerPageChange = useCallback((e) => {
    const newLimit = Number(e.target.value);
    setContactsPerPage(newLimit);
    setCurrentPage(1); // Сброс на первую страницу при изменении лимита
  }, []);

  // Вычисление пагинации
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);
  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  
  const hasContacts = useMemo(() => filteredContacts.length > 0, [filteredContacts]);

  return (
    <div className="min-h-screen p-6 pb-28 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto flex flex-col h-full mb-8 relative">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-6">
          Контакты
        </h1>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <DatePickerWithRange
            className="w-full md:w-auto rounded-md border-gray-300 dark:border-gray-600 p-2 shadow-sm"
            onSelect={handleDateRangeChange}
          />
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-gray-700 dark:text-gray-200" htmlFor="limitSelect">
              Show
            </label>
            <select
              id="limitSelect"
              value={contactsPerPage}
              onChange={handleContactsPerPageChange}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {[5, 10, 20, 50].map(limit => (
                <option key={limit} value={limit}>
                  {limit} per page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Информация о фильтрах */}
        {(dateRange.from || dateRange.to) && (
          <div className="bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm p-3 rounded-md mb-4 flex justify-between items-center">
            <span>
              Фильтр по дате: {dateRange.from ? new Date(dateRange.from).toLocaleDateString() : '—'} — 
              {dateRange.to ? new Date(dateRange.to).toLocaleDateString() : '—'}
            </span>
            <button 
              onClick={() => handleDateRangeChange({ from: null, to: null })}
              className="text-blue-600 dark:text-blue-300 hover:underline ml-2 focus:outline-none"
            >
              Сбросить
            </button>
          </div>
        )}

        {/* Контейнер для отзывов и пагинации */}
        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="text-center text-gray-700 dark:text-gray-200 py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
              Загрузка отзывов...
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-10" role="alert">
              <p className="font-semibold">Ошибка</p>
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pb-24 max-h-[calc(100vh-350px)]">
              {hasContacts ? (
                currentContacts.map((contact) => (
                  <FeedbackCard key={contact.id} contact={contact} />
                ))
              ) : (
                <div className="text-center text-gray-600 dark:text-gray-300 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  {dateRange.from || dateRange.to 
                    ? "За выбранный период отзывов не найдено."
                    : "Отзывов не найдено."}
                </div>
              )}
            </div>
          )}

          {/* Пагинация */}
          {!loading && hasContacts && (
            <div className="sticky bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 shadow-md border-t border-gray-200 dark:border-gray-700 py-4 z-10">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-violet-500 text-white hover:bg-violet-600'
                  }`}
                  aria-label="Перейти к предыдущей странице"
                >
                  Prev
                </button>
                <span className="text-gray-700 dark:text-gray-200 text-xs sm:text-sm md:text-base whitespace-nowrap">
                  <span className="hidden sm:inline">Страница </span>
                  {currentPage}/{totalPages}
                  <span className="hidden xs:inline text-xs ml-1">
                    ({filteredContacts.length})
                  </span>
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-5 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-violet-500 text-white hover:bg-violet-600'
                  }`}
                  aria-label="Перейти к следующей странице"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Contacts;