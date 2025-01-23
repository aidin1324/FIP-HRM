import React, { useState } from 'react';
import DatePickerWithRange from '../components/Datepicker';

function Comments() {
  // Пример данных комментариев
  const initialComments = [
    { id: 1, name: 'John Doe', date: '2023-10-01', text: 'This is a comment.' },
    { id: 2, name: 'Jane Smith', date: '2023-10-02', text: 'This is another comment.' },
    // Добавьте больше комментариев по необходимости
  ];

  const [comments] = useState(initialComments);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  const [dateRange, setDateRange] = useState({ from: null, to: null });

  // Логика клиентской пагинации
  const filteredComments = comments.filter(comment => {
    const commentDate = new Date(comment.date);
    const { from, to } = dateRange;
    return (!from || commentDate >= from) && (!to || commentDate <= to);
  });

  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Comments Section</h1>
      <div className="mb-4">
        <DatePickerWithRange
          className="rounded-md border border-gray-300 dark:border-gray-600"
          onSelect={setDateRange}
        />
      </div>
      <div className="space-y-4">
        {currentComments.length > 0 ? (
          currentComments.map((comment) => (
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
          <div className="text-center text-gray-600 dark:text-gray-300">No comments found.</div>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-violet-500 text-white hover:bg-violet-600'
          }`}
        >
          Prev
        </button>
        <span className="text-gray-700 dark:text-gray-200">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-violet-500 text-white hover:bg-violet-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Comments;