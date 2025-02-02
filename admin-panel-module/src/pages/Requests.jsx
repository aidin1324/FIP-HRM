import React, { useState } from 'react';
import DatePickerWithRange from '../components/Datepicker';

function Requests() {
  // Пример данных запросов на регистрацию
  const initialRequests = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', date: '2023-10-01', type: 'registration' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', date: '2023-10-02', type: 'registration' },
    { id: 3, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', date: '2023-10-03', type: 'registration' },
    { id: 4, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', date: '2023-10-04', type: 'registration' },
    { id: 5, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', date: '2023-10-05', type: 'registration' },
    { id: 6, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', date: '2023-10-06', type: 'registration' },
    { id: 7, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', date: '2023-10-07', type: 'registration' },
    { id: 8, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', date: '2023-10-08', type: 'registration' },
    { id: 9, firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', date: '2023-10-09', type: 'registration' },
    { id: 10, firstName: 'Bob', lastName: 'Brown', email: 'bob.brown@example.com', date: '2023-10-10', type: 'registration' },
    { id: 11, firstName: 'Charlie', lastName: 'Davis', email: 'charlie.davis@example.com', date: '2023-10-11', type: 'registration' },
    { id: 12, firstName: 'Diana', lastName: 'Miller', email: 'diana.miller@example.com', date: '2023-10-12', type: 'registration' },
    { id: 13, firstName: 'Eve', lastName: 'Wilson', email: 'eve.wilson@example.com', date: '2023-10-13', type: 'registration' },
    { id: 14, firstName: 'Frank', lastName: 'Moore', email: 'frank.moore@example.com', date: '2023-10-14', type: 'registration' },
    { id: 15, firstName: 'Grace', lastName: 'Taylor', email: 'grace.taylor@example.com', date: '2023-10-15', type: 'registration' },
    
    // Добавьте больше запросов по необходимости
  ];

  const [requests, setRequests] = useState(initialRequests);
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Логика фильтрации по датам
  const filteredRequests = requests.filter(request => {
    const requestDate = new Date(request.date);
    const { from, to } = dateRange;
    return (!from || requestDate >= from) && (!to || requestDate <= to);
  });

  const handleAccept = (id) => {
    // Логика для принятия запроса
    console.log(`Accepted request with id: ${id}`);
    setRequests(prevRequests => prevRequests.filter(request => request.id !== id));
  };

  const handleDecline = (id) => {
    // Логика для отклонения запроса
    console.log(`Declined request with id: ${id}`);
    setRequests(prevRequests => prevRequests.filter(request => request.id !== id));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Requests Section</h1>
      <div className="mb-4">
        <DatePickerWithRange
          className="rounded-md border border-gray-300 dark:border-gray-600"
          onSelect={setDateRange}
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pb-20"> {/* Добавлен большой отступ внизу */}
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="border-b border-gray-200 dark:border-gray-700 pb-2 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {request.firstName} {request.lastName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                    {new Date(request.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{request.email}</p>
              </div>
              <div className="flex space-x-2 mt-2 md:mt-0 w-full md:w-auto">
                <button
                  onClick={() => handleAccept(request.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs w-full md:w-auto"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(request.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs w-full md:w-auto"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300">No requests found.</div>
        )}
      </div>
    </div>
  );
}

export default Requests;