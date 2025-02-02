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
    msat: 0,
    feedbackCount: 0,
    managerFeedbackCount: 0,
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

  // Manager Comments State with mock data and simple pagination.
  const [managerComments, setManagerComments] = useState([]);
  const [managerPage, setManagerPage] = useState(1);
  const managerCommentsLimit = 3;
  const managerTotalPages = Math.ceil(managerComments.length / managerCommentsLimit);
  const currentManagerComments = managerComments.slice(
    (managerPage - 1) * managerCommentsLimit,
    managerPage * managerCommentsLimit
  );

  // Initial fetch for customer comments.
  useEffect(() => {
    if (id) {
      setCustomerPageHistory([]);
      setCurrentCustomerPageIndex(0);
      loadCustomerPage(null, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Set mock manager comments data.
  useEffect(() => {
    const mockData = [
      { id: 1, name: 'Manager A', date: '2023-09-01T12:00:00Z', text: 'Great job!' },
      { id: 2, name: 'Manager B', date: '2023-09-02T12:00:00Z', text: 'Needs improvement.' },
      { id: 3, name: 'Manager A', date: '2023-09-03T12:00:00Z', text: 'Keep it up.' },
      { id: 4, name: 'Manager B', date: '2023-09-04T12:00:00Z', text: 'Excellent progress.' },
      { id: 5, name: 'Manager A', date: '2023-09-05T12:00:00Z', text: 'Well done!' },
    ];
    setManagerComments(mockData);
  }, []);

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
            msat: statsData.MSAT || 0,
            feedbackCount: statsData.total_feedbacks || 0,
            managerFeedbackCount: statsData.manager_feedbacks || 0,
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
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Profile of {userData.first_name} {userData.second_name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400">First Name:</p>
              <p className="text-gray-800 dark:text-gray-200">{userData.first_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Second Name:</p>
              <p className="text-gray-800 dark:text-gray-200">{userData.second_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email:</p>
              <p className="text-gray-800 dark:text-gray-200">{userData.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Role:</p>
              <p className="text-gray-800 dark:text-gray-200 capitalize">{userData.role}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Active:</p>
              <p className={`text-gray-800 dark:text-gray-200 ${userData.active ? 'text-green-500' : 'text-red-500'}`}>
                {userData.active ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">CSAT%</h3>
            <p className="text-3xl font-bold text-violet-500">{statistics.csat}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">MSAT%</h3>
            <p className="text-3xl font-bold text-violet-500">{statistics.msat}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Feedback Count</h3>
            <p className="text-3xl font-bold text-violet-500">{statistics.feedbackCount}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Manager Feedback</h3>
            <p className="text-3xl font-bold text-violet-500">{statistics.managerFeedbackCount}</p>
          </div>
        </div>

        {/* Tag Dashboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Tag Dashboard
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Customer Comments
          </h2>
          {customerLoading ? (
            <p className="text-gray-700 dark:text-gray-300">Loading comments...</p>
          ) : currentCustomerPage.comments.length > 0 ? (
            <div className="space-y-4">
              {currentCustomerPage.comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">Comment #{comment.id}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No customer comments available.</p>
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => {
                if (currentCustomerPageIndex > 0) {
                  setCurrentCustomerPageIndex(currentCustomerPageIndex - 1);
                }
              }}
              disabled={currentCustomerPageIndex === 0 || customerLoading}
              className={`px-3 py-1 rounded-md text-sm ${
                currentCustomerPageIndex === 0 || customerLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Prev
            </button>
            <span className="text-gray-700 dark:text-gray-200 text-sm">
              Page {currentCustomerPageIndex + 1}
            </span>
            <button
              onClick={() => {
                if (currentCustomerPage.hasMore && !customerLoading) {
                  loadCustomerPage(currentCustomerPage.nextCursor, true);
                }
              }}
              disabled={!currentCustomerPage.hasMore || customerLoading}
              className={`px-3 py-1 rounded-md text-sm ${
                !currentCustomerPage.hasMore || customerLoading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>

        {/* Manager Comments Section with Mock Data */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 pb-40">
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Manager Comments</h3>
          <div className="space-y-4">
            {currentManagerComments.length > 0 ? (
              currentManagerComments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{comment.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No manager comments available.</p>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setManagerPage((prev) => Math.max(prev - 1, 1))}
              disabled={managerPage === 1}
              className={`px-3 py-1 rounded-md text-sm ${
                managerPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Prev
            </button>
            <span className="text-gray-700 dark:text-gray-200 text-sm">
              Page {managerPage} of {managerTotalPages || 1}
            </span>
            <button
              onClick={() => setManagerPage((prev) => (prev < managerTotalPages ? prev + 1 : prev))}
              disabled={managerPage === managerTotalPages || managerTotalPages === 0}
              className={`px-3 py-1 rounded-md text-sm ${
                managerPage === managerTotalPages || managerTotalPages === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-violet-500 text-white hover:bg-violet-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
