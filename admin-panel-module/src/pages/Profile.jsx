import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  get_stats_dashboad_path,
  get_user_profile_path,
  get_user_tags_stat_path,
  get_customer_comments_path_with_param
} from '../api_endpoints';
import { useParams, Link } from 'react-router-dom';
import { RoleContext } from '../contexts/RoleContext';
import { AuthContext } from '../contexts/AuthContext'; 
import Loading from '../components/Loading';
import { useThemeProvider } from '../utils/ThemeContext';
import EditProfileModal from '../components/EditProfileModal';
import API from '../api_endpoints';
import Toast from '../components/Toast';

function Profile({ currentUser = false }) {
  const { roles, loading: rolesLoading, error: rolesError } = useContext(RoleContext);
  const { id: urlId } = useParams();
  const { currentTheme } = useThemeProvider();
  const { auth } = useContext(AuthContext);

  const id = currentUser ? auth.user?.id : urlId;
  
  const darkMode = currentTheme === 'dark';
  const abortControllerRef = useRef(new AbortController());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userData, setUserData] = useState({
    first_name: '',
    second_name: '',
    email: '',
    role: '',
    active: false,
  });

  const [statistics, setStatistics] = useState({
    csat: 0,
    feedbackCount: 0,
  });

  const [tagsData, setTagsData] = useState({
    tagSet1: [],
    tagSet2: [],
    tagSet3: [],
  });

  const [customerPageHistory, setCustomerPageHistory] = useState([]);
  const [currentCustomerPageIndex, setCurrentCustomerPageIndex] = useState(0);
  const [customerLoading, setCustomerLoading] = useState(false);
  const commentsLimit = 3; 

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const buildPieData = useCallback((dataset = []) => {
    const labels = dataset.map(item => item.label);
    const dataValues = dataset.map(item => item.value);
    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#F08080',
            '#87CEFA',
          ],
          hoverBackgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#F08080',
            '#87CEFA',
          ],
        },
      ],
    };
  }, []);

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: darkMode ? '#eae7e9' : '#000',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const value = context.parsed;
            const percent = total ? ((value / total) * 100).toFixed(2) : 0;
            return `${context.label}: ${value} (${percent}%)`;
          },
        },
      },
    },
  }), [darkMode]);

  const loadCustomerPage = useCallback(async (cursor, addToHistory = true) => {
    if (customerLoading) return; 
    
    setCustomerLoading(true);
    
    try {
      const apiUrl = get_customer_comments_path_with_param;
      const url = new URL(apiUrl);
      url.searchParams.append('waiter_id', id);
      url.searchParams.append('limit', commentsLimit);
      if (cursor !== null) {
        url.searchParams.append('cursor', cursor);
      }

      const controller = new AbortController();
      const prevController = abortControllerRef.current;
      abortControllerRef.current = controller;

      if (prevController) {
        prevController.abort();
      }
      
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();

      let feedbacks = [];
      let nextCursor = null;

      if (Array.isArray(data.feedbacks)) {
        feedbacks = data.feedbacks;
        nextCursor = data.cursor;
      } 
      else if (Array.isArray(data.data)) {
        feedbacks = data.data;
        nextCursor = data.cursor;
      }
      else if (Array.isArray(data)) {
        feedbacks = data;
      }
      
      const pageData = {
        comments: feedbacks,
        nextCursor: nextCursor,
        hasMore: feedbacks.length === commentsLimit && nextCursor !== null,
      };

      setCustomerPageHistory(prev => {
        if (addToHistory) {
          const newHistory = prev.slice(0, currentCustomerPageIndex + 1);
          newHistory.push(pageData);

          const newIndex = currentCustomerPageIndex + 1;
          setTimeout(() => {
            setCurrentCustomerPageIndex(newIndex);
          }, 0);
          
          return newHistory;
        } else {
          const newHistory = [...prev];
          if (currentCustomerPageIndex < newHistory.length) {
            newHistory[currentCustomerPageIndex] = pageData;
          }
          return newHistory;
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.error('Ошибка загрузки данных:', err.message);
        }
      }
    } finally {
      setCustomerLoading(false);
    }
  }, [id, commentsLimit, currentCustomerPageIndex, customerLoading]);

  const goToPreviousPage = useCallback(() => {
    if (currentCustomerPageIndex > 0) {
      setCurrentCustomerPageIndex(prev => prev - 1);
    }
  }, [currentCustomerPageIndex]);

  const goToNextPage = useCallback(() => {
    const currentPage = customerPageHistory[currentCustomerPageIndex];
    if (currentPage?.hasMore && !customerLoading) {
      loadCustomerPage(currentPage.nextCursor, true);
    }
  }, [customerPageHistory, currentCustomerPageIndex, customerLoading, loadCustomerPage]);

  useEffect(() => {
    if (id) {
      setCustomerPageHistory([]);
      setCurrentCustomerPageIndex(0);
      setInitialLoadDone(false); 
      
      
      const loadInitialComments = async () => {
        if (customerLoading) return; 
        
        try {
          setCustomerLoading(true);
          
         
          const apiUrl = get_customer_comments_path_with_param;
          const url = new URL(apiUrl);
          url.searchParams.append('waiter_id', id);
          url.searchParams.append('limit', commentsLimit);
          
          const controller = new AbortController();
          abortControllerRef.current = controller;
          
          const res = await fetch(url.toString(), {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          
          const data = await res.json();

          let feedbacks = [];
          let nextCursor = null;
          
          if (Array.isArray(data.feedbacks)) {
            feedbacks = data.feedbacks;
            nextCursor = data.cursor;
          } else if (Array.isArray(data.data)) {
            feedbacks = data.data;
            nextCursor = data.cursor;
          } else if (Array.isArray(data)) {
            feedbacks = data;
          }
          
          const pageData = {
            comments: feedbacks,
            nextCursor: nextCursor,
            hasMore: feedbacks.length === commentsLimit && nextCursor !== null,
          };
          
          setCustomerPageHistory([pageData]);
          setCurrentCustomerPageIndex(0);
          setInitialLoadDone(true); 
        } catch (err) {
          if (err.name !== 'AbortError') {
            if (process.env.NODE_ENV === 'development') {
              console.error('Ошибка загрузки данных:', err.message);
            }
          }
        } finally {
          setCustomerLoading(false);
        }
      };

      loadInitialComments();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id, commentsLimit]);

  const currentCustomerPage = useMemo(() => 
    customerPageHistory[currentCustomerPageIndex] || { comments: [] },
    [customerPageHistory, currentCustomerPageIndex]
  );

  useEffect(() => {
    if (!rolesLoading && !rolesError && id) {
      setLoading(true);
      setError(null);

      const controller = new AbortController();
      const signal = controller.signal;

      const fetchProfile = fetch(get_user_profile_path(id), { signal }).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user profile.');
        return res.json();
      });
      
      const fetchStats = fetch(get_stats_dashboad_path(id), { signal }).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch statistics.');
        return res.json();
      });
      
      const fetchTags = fetch(get_user_tags_stat_path(id), { signal }).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tags data.');
        return res.json();
      });

      Promise.all([fetchProfile, fetchStats, fetchTags])
        .then(([profileData, statsData, tagsStat]) => {
          if (signal.aborted) return;
          
          setUserData({
            first_name: profileData.first_name || '',
            second_name: profileData.second_name || '',
            email: profileData.email || '',
            role: roles[profileData.role_id] || 'Unknown',
            active: Boolean(profileData.active),
          });
          
          setStatistics({
            csat: statsData.CSAT || 0,
            feedbackCount: statsData.total_feedbacks || 0,
          });
          
          const transformData = (dataObj = {}) => {
            return Object.entries(dataObj).map(([label, value]) => ({ label, value }));
          };

          setTagsData({
            tagSet1: transformData(tagsStat['положительный'] || {}),
            tagSet2: transformData(tagsStat['нейтральный'] || {}),
            tagSet3: transformData(tagsStat['негативный'] || {}),
          });
        })
        .catch((err) => {
          if (signal.aborted) return;
          
          console.error(err);
          setError(err.message || 'Произошла ошибка при загрузке данных.');
        })
        .finally(() => {
          if (!signal.aborted) {
            setLoading(false);
          }
        });

      return () => controller.abort();
    }
  }, [id, roles, rolesLoading, rolesError]);

  useEffect(() => {
    if (currentUser || (auth.user && auth.user.id === parseInt(id))) {
      setIsOwnProfile(true);
    }

  }, [id]);

  const handleSaveProfile = async (updatedData) => {
    try {
      const payload = {
        ...updatedData,
        role_id: parseInt(updatedData.role_id, 10)
      };
      
      const response = await fetch(API.users.update(id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.access_token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Не удалось обновить профиль');
      }
      
      const updatedUserData = await response.json();
      setUserData({
        ...userData,
        first_name: updatedUserData.first_name || '',
        second_name: updatedUserData.second_name || '',
        email: updatedUserData.email || '',
        active: Boolean(updatedUserData.active),
        role_id: updatedUserData.role_id
      });
      
      // Обновляем роль
      if (roles && updatedUserData.role_id) {
        setUserData(prev => ({
          ...prev,
          role: roles[updatedUserData.role_id] || 'Unknown'
        }));
      }
      setToast({
        show: true,
        message: 'Профиль успешно обновлен',
        type: 'success'
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Ошибка загрузки данных:', error.message);
      }
      setToast({
        show: true,
        message: error.message || 'Ошибка при обновлении профиля',
        type: 'error'
      });
      throw error;
    }
  };

  if (rolesLoading || loading) {
    return <Loading />;
  }

  if (rolesError || error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{rolesError || error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
      
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-32">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              <span className="text-violet-600 dark:text-violet-400">{userData.first_name} {userData.second_name}</span>
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 ${userData.active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
              {userData.active ? 'Активен' : 'Неактивен'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Имя:</p>
              <p className="text-gray-800 dark:text-gray-200">{userData.first_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Фамилия:</p>
              <p className="text-gray-800 dark:text-gray-200">{userData.second_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Почта:</p>
              <p className="text-gray-800 dark:text-gray-200">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Роль:</p>
              <p className="text-gray-800 dark:text-gray-200 capitalize">{userData.role}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Активен:</p>
              <p className={`text-gray-800 dark:text-gray-200 ${userData.active ? 'text-green-500' : 'text-red-500'}`}>
                {userData.active ? 'Да' : 'Нет'}
              </p>
            </div>
          </div>
        </div>

        {isOwnProfile && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <svg className="w-5 h-5 mr-2 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">
                Это ваш личный профиль
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white text-sm font-medium rounded-md shadow-sm transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-violet-400 focus:outline-none"
                onClick={() => setShowEditModal(true)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Statistics Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
            Статистика отзывов
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center flex flex-col items-center justify-center">
              <div className="text-5xl font-bold mb-2 text-violet-600 dark:text-violet-400">
                {statistics.csat.toFixed(1)}%
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Средний показатель удовлетворенности (CSAT)
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-center flex flex-col items-center justify-center">
              <div className="text-5xl font-bold mb-2 text-violet-600 dark:text-violet-400">
                {statistics.feedbackCount}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Общее количество отзывов
              </p>
            </div>
          </div>
        </div>
        
        {/* Tag Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Дашборд тегов
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Положительный</h3>
              <div className="h-48">
                <Pie data={buildPieData(tagsData.tagSet1)} options={pieOptions} />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Нейтральный</h3>
              <div className="h-48">
                <Pie data={buildPieData(tagsData.tagSet2)} options={pieOptions} />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Негативный</h3>
              <div className="h-48">
                <Pie data={buildPieData(tagsData.tagSet3)} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Комментарии клиентов
            </h2>
            <button 
              onClick={() => loadCustomerPage(null, false)}
              disabled={customerLoading}
              className="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 disabled:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          
          {customerLoading ? (
            <div className="py-4 space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-3 py-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {customerPageHistory.length > 0 && 
               customerPageHistory[currentCustomerPageIndex]?.comments?.length > 0 ? (
                <div className="space-y-4">
                  {customerPageHistory[currentCustomerPageIndex].comments.map((comment, idx) => (
                    <div 
                      key={comment?.id || `comment-${idx}-${currentCustomerPageIndex}`} 
                      className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                    >
                      <div className="flex flex-wrap justify-between items-center mb-2">
                        <span className="font-medium text-gray-800 dark:text-gray-200 mr-2">
                          Отзыв {comment?.id ? `#${comment.id}` : `${idx + 1}`}
                        </span>
                        {(comment?.date || comment?.created_at) && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.date || comment.created_at).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line break-words">
                        {comment?.comment || comment?.text || 'Нет текста комментария'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">Комментарии отсутствуют</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                    Когда клиенты оставят отзывы, они появятся здесь
                  </p>
                </div>
              )}
            </>
          )}

          {customerPageHistory.length > 0 && 
           (customerPageHistory[currentCustomerPageIndex]?.hasMore || currentCustomerPageIndex > 0) && (
            <div className="flex justify-between items-center mt-8 mb-4"> 
              <button
                onClick={goToPreviousPage}
                disabled={currentCustomerPageIndex === 0 || customerLoading}
                aria-label="Предыдущая страница"
                type="button"
                className="px-4 py-2 rounded-md text-sm bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500 dark:disabled:hover:bg-gray-700"
              >
                Пред.
              </button>
              <span className="text-gray-700 dark:text-gray-200 text-sm">
                Страница {currentCustomerPageIndex + 1}
              </span>
              <button
                onClick={goToNextPage}
                disabled={!customerPageHistory[currentCustomerPageIndex]?.hasMore || customerLoading}
                aria-label="Следующая страница"
                type="button"
                className="px-4 py-2 rounded-md text-sm bg-violet-500 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:bg-gray-200 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-500 dark:disabled:hover:bg-gray-700"
              >
                След.
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="h-16"></div>
      {showEditModal && (
        <EditProfileModal 
          userData={{
            ...userData,
            role_id: Object.entries(roles || {}).find(([_, roleName]) => 
              roleName === userData.role
            )?.[0] || ''
          }}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

export default Profile;