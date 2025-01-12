import React, { useState, useEffect, useContext } from 'react';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { get_stats_dashboad_path, get_user_profile_path } from '../api_endpoints';
import { useParams } from 'react-router-dom';
import { RoleContext } from '../contexts/RoleContext';
import Loading from '../components/Loading';

function Profile() {
  const { roles, loading: rolesLoading, error: rolesError } = useContext(RoleContext);
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Data
  const [userData, setUserData] = useState({
    first_name: '',
    second_name: '',
    email: '',
    role: '',
    active: false,
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    csat: 0,
    msat: 0,
    feedbackCount: 0,
    managerFeedbackCount: 0,
  });

  // Comments (Mock Data)
  const [comments] = useState({
    guest: [
      { id: 1, name: 'Гость 1', date: '2023-10-01', text: 'Хорошая работа!' },
      { id: 3, name: 'Гость 2', date: '2023-10-03', text: 'Есть вопрос по документам...' },
      { id: 5, name: 'Гость 3', date: '2023-10-05', text: 'Ещё один комментарий.' },
      { id: 7, name: 'Гость 4', date: '2023-10-07', text: 'Отлично справился с задачей!' },
      { id: 9, name: 'Гость 5', date: '2023-10-09', text: 'Понравился сервис.' },
      { id: 11, name: 'Гость 6', date: '2023-10-11', text: 'Буду рекомендовать друзьям.' },
    ],
    managers: [
      { id: 2, name: 'Jane Smith', date: '2023-10-02', text: 'Прошу прислать отчёт до конца дня.' },
      { id: 4, name: 'John Manager', date: '2023-10-04', text: 'Свяжитесь с отделом кадров.' },
      { id: 6, name: 'Alice Manager', date: '2023-10-06', text: 'Отличная работа над задачей!' },
      { id: 8, name: 'Bob Manager', date: '2023-10-08', text: 'Необходимо улучшить коммуникацию.' },
    ],
  });

  // Pagination State
  const [guestPage, setGuestPage] = useState(1);
  const [managerPage, setManagerPage] = useState(1);
  const commentsPerPage = 3;

  // Calculate total pages
  const guestTotalPages = Math.ceil(comments.guest.length / commentsPerPage);
  const managerTotalPages = Math.ceil(comments.managers.length / commentsPerPage);

  // Current comments to display
  const currentGuestComments = comments.guest.slice(
    (guestPage - 1) * commentsPerPage,
    guestPage * commentsPerPage
  );
  const currentManagerComments = comments.managers.slice(
    (managerPage - 1) * commentsPerPage,
    managerPage * commentsPerPage
  );

  useEffect(() => {
    // Only proceed if roles are loaded without errors
    if (!rolesLoading && !rolesError) {
      setLoading(true);
      setError(null);

      // Fetch user profile and statistics concurrently
      const fetchUserProfile = fetch(get_user_profile_path(id)).then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch user profile.');
        }
        return response.json();
      });

      const fetchStatistics = fetch(get_stats_dashboad_path(id)).then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch statistics.');
        }
        return response.json();
      });

      Promise.all([fetchUserProfile, fetchStatistics])
        .then(([profileData, statsData]) => {
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
        })
        .catch(err => {
          console.error(err);
          setError(err.message || 'An error occurred while fetching data.');
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

  // Tag Dashboard Data
  const tagData1 = {
    labels: ['Tag A', 'Tag B', 'Tag C', 'Tag D', 'Tag E', 'Tag F'],
    datasets: [
      {
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const tagData2 = {
    labels: ['Tag G', 'Tag H', 'Tag I', 'Tag J', 'Tag K', 'Tag L'],
    datasets: [
      {
        data: [8, 15, 10, 7, 5, 2],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const tagData3 = {
    labels: ['Tag M', 'Tag N', 'Tag O', 'Tag P', 'Tag Q', 'Tag R'],
    datasets: [
      {
        data: [5, 12, 8, 6, 4, 3],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${context.parsed} (${(
              (context.parsed /
                context.chart._metasets[context.datasetIndex].total) *
              100
            ).toFixed(2)}%)`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto w-full h-full space-y-6">
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
              <p
                className={`text-gray-800 dark:text-gray-200 ${
                  userData.active ? 'text-green-500' : 'text-red-500'
                }`}
              >
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
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Tag 1</h3>
              <div className="h-48">
                <Pie data={tagData1} options={pieOptions} />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Tag 2</h3>
              <div className="h-48">
                <Pie data={tagData2} options={pieOptions} />
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Tag 3</h3>
              <div className="h-48">
                <Pie data={tagData3} options={pieOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Comments Section
          </h2>

          {/* Guest Comments */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Guest Comments
            </h3>
            <div className="space-y-4">
              {currentGuestComments.length > 0 ? (
                currentGuestComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {comment.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No guest comments available.</p>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 space-x-2">
              <button
                onClick={() => setGuestPage((prev) => Math.max(prev - 1, 1))}
                disabled={guestPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  guestPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-500 text-white hover:bg-violet-600'
                }`}
              >
                Prev
              </button>
              <span className="text-gray-700 dark:text-gray-200 text-sm">
                Page {guestPage} of {guestTotalPages || 1}
              </span>
              <button
                onClick={() =>
                  setGuestPage((prev) => (prev < guestTotalPages ? prev + 1 : prev))
                }
                disabled={guestPage === guestTotalPages || guestTotalPages === 0}
                className={`px-3 py-1 rounded-md text-sm ${
                  guestPage === guestTotalPages || guestTotalPages === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-500 text-white hover:bg-violet-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Manager Comments */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Manager Comments
            </h3>
            <div className="space-y-4">
              {currentManagerComments.length > 0 ? (
                currentManagerComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {comment.name}
                      </span>
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
            <div className="flex justify-between items-center mt-4 space-x-2">
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
                onClick={() =>
                  setManagerPage((prev) => (prev < managerTotalPages ? prev + 1 : prev))
                }
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
    </div>
  );
}

export default Profile;