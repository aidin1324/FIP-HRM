// src/pages/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-800 p-8">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Unauthorized Access</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                You do not have the necessary permissions to view this page.
            </p>
            <Link to="/" className="inline-block px-6 py-3 bg-violet-500 text-white rounded-md hover:bg-violet-600 transition">
                Go to Home
            </Link>
        </div>
    </div>
  );
};

export default Unauthorized;