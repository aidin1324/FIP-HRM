import React, { useState } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';

function Profile() {
  const [dateRange, setDateRange] = useState('15');

  // Pagination states
  const [guestPage, setGuestPage] = useState(1);
  const [managerPage, setManagerPage] = useState(1);
  const itemsPerPage = 3; // Adjust as needed

  const userData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  
const chartData = {
    labels: ['Category 1', 'Category 2', 'Category 3', 'Category 4'],
    datasets: [
        {
            label: 'Ratings',
            data: [1.5, 2.5, 3.5, 4.5],
            backgroundColor: ['#7CB9E8', '#77DD77', '#FFB347', '#CBA135'],
        },
    ],
};
// check how to use chartoptions
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (context) => `Rating: ${context.parsed.y}/5`,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 5,
            ticks: {
                stepSize: 0.5,
            },
            title: {
                display: true,
                text: 'Rating',
            },
        },
        x: {
            title: {
                display: true,
                text: 'Categories',
            },
        },
    },
};


  const comments = [
    { id: 1, role: 'guest', name: 'Гость', text: 'Хорошая работа!', date: '2023-09-01' },
    { id: 2, role: 'manager', name: 'Jane Smith', text: 'Прошу прислать отчёт до конца дня.', date: '2023-09-02' },
    { id: 3, role: 'guest', name: 'Гость', text: 'Есть вопрос по документам...', date: '2023-09-03' },
    { id: 4, role: 'manager', name: 'John Manager', text: 'Свяжитесь с отделом кадров.', date: '2023-09-04' },
    { id: 5, role: 'guest', name: 'Гость', text: 'Ещё один комментарий.', date: '2023-09-05' },
    { id: 6, role: 'manager', name: 'Alice Manager', text: 'Отличная работа над задачей!', date: '2023-09-06' },
  ];

  // Split comments based on role
  const guestComments = comments.filter((c) => c.role === 'guest');
  const managerComments = comments.filter((c) => c.role === 'manager');

  // Calculate pagination for each group
  const guestTotalPages = Math.ceil(guestComments.length / itemsPerPage);
  const managerTotalPages = Math.ceil(managerComments.length / itemsPerPage);

  // Slice arrays for current page
  const currentGuestComments = guestComments.slice(
    (guestPage - 1) * itemsPerPage,
    guestPage * itemsPerPage
  );
  const currentManagerComments = managerComments.slice(
    (managerPage - 1) * itemsPerPage,
    managerPage * itemsPerPage
  );

  return (
    <div className="flex flex-col h-screen w-full overflow-auto bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto w-full h-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {userData.firstName} {userData.lastName} &middot; {userData.email}
            </p>
          </div>

                  <div className="flex items-center space-x-2 mt-3 md:mt-0">
                    <FaCalendarAlt className="text-gray-600 dark:text-gray-300" />
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="form-select rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200"
                    >
                      <option value="7">Last 7 days</option>
                      <option value="15">Last 15 days</option>
                      <option value="30">Last 30 days</option>
                    </select>
                  </div>
                </div>


                <div className="flex flex-col lg:flex-row gap-4">

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 lg:w-2/3 h-full">
                        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
                            Activity Chart
                        </h2>
                        <div className="h-64 md:h-80 lg:h-96">
                            <Bar
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                y: { beginAtZero: true },
                                },
                            }}
                            />
                        </div>
                    </div>


                  <div className="flex flex-col lg:w-1/3 gap-4">
                    {/* Guest Comments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex-1">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Гости</h2>
              <div className="space-y-4">
                {currentGuestComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {comment.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
              {/* Guest Pagination */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => setGuestPage((prev) => Math.max(prev - 1, 1))}
                  disabled={guestPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    guestPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-default'
                      : 'bg-violet-500 text-white hover:bg-violet-600'
                  }`}
                >
                  Prev
                </button>
                <span className="text-gray-700 dark:text-gray-200 text-sm">
                  {guestPage} / {guestTotalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setGuestPage((prev) =>
                      prev < guestTotalPages ? prev + 1 : prev
                    )
                  }
                  disabled={guestPage === guestTotalPages || guestTotalPages === 0}
                  className={`px-3 py-1 rounded-md text-sm ${
                    guestPage === guestTotalPages || guestTotalPages === 0
                      ? 'bg-gray-200 text-gray-400 cursor-default'
                      : 'bg-violet-500 text-white hover:bg-violet-600'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Manager Comments */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex-1 mb-[105px]">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">Менеджеры</h2>
              <div className="space-y-4">
                {currentManagerComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 dark:border-gray-700 pb-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {comment.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {comment.text}
                    </p>
                    <p className="text-xs text-violet-500 mt-1">Роль: {comment.role}</p>
                  </div>
                ))}
              </div>
              {/* Manager Pagination */}
              <div className="flex justify-center items-center mt-4 space-x-2">
                <button
                  onClick={() => setManagerPage((prev) => Math.max(prev - 1, 1))}
                  disabled={managerPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    managerPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-default'
                      : 'bg-violet-500 text-white hover:bg-violet-600'
                  }`}
                >
                  Prev
                </button>
                <span className="text-gray-700 dark:text-gray-200 text-sm">
                  {managerPage} / {managerTotalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setManagerPage((prev) =>
                      prev < managerTotalPages ? prev + 1 : prev
                    )
                  }
                  disabled={managerPage === managerTotalPages || managerTotalPages === 0}
                  className={`px-3 py-1 rounded-md text-sm ${
                    managerPage === managerTotalPages || managerTotalPages === 0
                      ? 'bg-gray-200 text-gray-400 cursor-default'
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
    </div>
  );
}

export default Profile;