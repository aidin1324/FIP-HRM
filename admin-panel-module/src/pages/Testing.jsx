import React, { useState } from 'react';
import DatePickerWithRange from '../components/Datepicker';

function Testing() {
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Testing Section</h1>
      <div className="mb-4">
        <DatePickerWithRange
          className="rounded-md border border-gray-300 dark:border-gray-600"
          onSelect={setDateRange}
        />
      </div>
      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {/* Здесь можно добавить содержимое страницы */}
        <div className="text-center text-gray-600 dark:text-gray-300">No content available.</div>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          disabled
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          Prev
        </button>
        <span className="text-gray-700 dark:text-gray-200">
          Page 1 of 1
        </span>
        <button
          disabled
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Testing;