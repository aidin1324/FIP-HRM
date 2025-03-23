import React, { useState, useEffect, useContext } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import {
  get_stats_dashboad_path,
  get_user_profile_path,
  get_user_tags_stat_path,
  get_customer_comments_path_with_param
} from '../api_endpoints';
import { useParams } from 'react-router-dom';
import { RoleContext } from '../contexts/RoleContext';
import Loading from '../components/Loading';
import { useThemeProvider } from '../utils/ThemeContext';

function Profile() {
  const { roles, loading: rolesLoading, error: rolesError } = useContext(RoleContext);
  const { id } = useParams();
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Profile Data
  const [userData, setUserData] = useState({
    first_name: '',
    second_name: '',
    email: '',
    role: '',
    active: false,
  });

  // Dashboard Statistics
  const [statistics, setStatistics] = useState({
    csat: 0,
    feedbackCount: 0,
  });

  // Tags Data for Pie Charts
  const [tagsData, setTagsData] = useState({
    tagSet1: [],
    tagSet2: [],
    tagSet3: [],
  });

  // Customer Comments State using cursor-based pagination.
  const [customerPageHistory, setCustomerPageHistory] = useState([]);
  const [currentCustomerPageIndex, setCurrentCustomerPageIndex] = useState(0);
  const [customerLoading, setCustomerLoading] = useState(false);
  const commentsLimit = 3; // changed limit for guest (customer) comments

  // Function to load a customer comments page by cursor.
  const loadCustomerPage = async (cursor, addToHistory = true) => {
    setCustomerLoading(true);
    try {
      const apiUrl = get_customer_comments_path_with_param;
      const url = new URL(apiUrl);
      url.searchParams.append('waiter_id', id);
      url.searchParams.append('limit', commentsLimit);
      if (cursor !== null) {
        url.searchParams.append('cursor', cursor);
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
      const pageData = {
        comments: data.feedbacks,
        nextCursor: data.cursor,
        hasMore: data.feedbacks.length === commentsLimit,
      };

      if (addToHistory) {
        const newHistory = customerPageHistory.slice(0, currentCustomerPageIndex + 1);
        newHistory.push(pageData);
        setCustomerPageHistory(newHistory);
        setCurrentCustomerPageIndex(newHistory.length - 1);
      } else {
        setCustomerPageHistory((prev) => {
          const newHistory = [...prev];
          newHistory[currentCustomerPageIndex] = pageData;
          return newHistory;
        });
      }
    } catch (err) {
      console.error('Error fetching customer comments:', err);
    } finally {
      setCustomerLoading(false);
    }
  };

  // Initial fetch for customer comments.
  useEffect(() => {
    if (id) {
      setCustomerPageHistory([]);
      setCurrentCustomerPageIndex(0);
      loadCustomerPage(null, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!rolesLoading && !rolesError) {
      setLoading(true);
      setError(null);

      const fetchProfile = fetch(get_user_profile_path(id)).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user profile.');
        return res.json();
      });
      const fetchStats = fetch(get_stats_dashboad_path(id)).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch statistics.');
        return res.json();
      });
      const fetchTags = fetch(get_user_tags_stat_path(id)).then((res) => {
        if (!res.ok) throw new Error('Failed to fetch tags data.');
        return res.json();
      });

      Promise.all([fetchProfile, fetchStats, fetchTags])
        .then(([profileData, statsData, tagsStat]) => {
          setUserData({
            first_name: profileData.first_name,
            second_name: profileData.second_name,
            email: profileData.email,
            role: roles[profileData.role_id] || 'Unknown',
            active: profileData.active,
          });
          setStatistics({
            csat: statsData.CSAT || 0,
            feedbackCount: statsData.total_feedbacks || 0,
          });
          const transformData = (dataObj) => {
            return Object.entries(dataObj).map(([label, value]) => ({ label, value }));
          };

          setTagsData({
            tagSet1: transformData(tagsStat['положительный'] || {}),
            tagSet2: transformData(tagsStat['нейтральный'] || {}),
            tagSet3: transformData(tagsStat['негативный'] || {}),
          });
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || 'Произошла ошибка при загрузке данных.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, roles, rolesLoading, rolesError]);

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

  const buildPieData = (dataset = []) => {
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
  };

  const pieOptions = {
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
  };

  const currentCustomerPage = customerPageHistory[currentCustomerPageIndex] || { comments: [] };

  return (
    <div className="flex flex-col h-screen w-full overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto w-full space-y-6 pb-32"> {/* Увеличен до pb-32 (8rem) */}
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

        {/* Statistics Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
            Статистика
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSAT блок */}
            <div className="bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30 rounded-xl p-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] transform duration-300 shadow-sm hover:shadow">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-700/40 mb-4">
                <svg className="w-8 h-8 text-violet-600 dark:text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Удовлетворенность клиентов</h3>
              <div className="text-5xl font-bold text-violet-600 dark:text-violet-400 flex items-baseline">
                {statistics.csat}
                <span className="text-xl text-violet-400 dark:text-violet-300 ml-1">%</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm text-center">
                Отражает общую оценку качества обслуживания по отзывам клиентов
              </p>
            </div>
            
            {/* Количество отзывов блок */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 flex flex-col items-center justify-center transition-transform hover:scale-[1.02] transform duration-300 shadow-sm hover:shadow">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-700/40 mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Всего отзывов</h3>
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {statistics.feedbackCount}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm text-center">
                Общее количество отзывов, оставленных клиентами
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

        {/* Customer Comments Section with Server Pagination */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-20"> {/* Увеличен до mb-20 (5rem) */}
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Комментарии клиентов
          </h2>
          {customerLoading ? (
            <p className="text-gray-700 dark:text-gray-300">Загрузка комментариев...</p>
          ) : currentCustomerPage.comments.length > 0 ? (
            <div className="space-y-4">
              {currentCustomerPage.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Отзыв #{comment.id}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No customer comments available.</p>
          )}
          <div className="flex justify-between items-center mt-8 mb-4"> 
            <button
              onClick={() => {
                if (currentCustomerPageIndex > 0) {
                  setCurrentCustomerPageIndex(currentCustomerPageIndex - 1);
                }
              }}
              disabled={currentCustomerPageIndex === 0 || customerLoading}
              className={`px-4 py-2 rounded-md text-sm ${  
                currentCustomerPageIndex === 0 || customerLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Пред.
            </button>
            <span className="text-gray-700 dark:text-gray-200 text-sm">
              Страница {currentCustomerPageIndex + 1}
            </span>
            <button
              onClick={() => {
                if (currentCustomerPage.hasMore && !customerLoading) {
                  loadCustomerPage(currentCustomerPage.nextCursor, true);
                }
              }}
              disabled={!currentCustomerPage.hasMore || customerLoading}
              className={`px-4 py-2 rounded-md text-sm ${  
                !currentCustomerPage.hasMore || customerLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              След.
            </button>
          </div>
        </div>
      </div>
      {/* Дополнительный пустой блок в конце страницы для гарантированного отступа */}
      <div className="h-16"></div>
    </div>
  );
}

export default Profile;
