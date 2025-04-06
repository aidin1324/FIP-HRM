import React, { useState } from 'react';
import { useMetadata } from '../contexts/MetadataContext';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';

// Компоненты для каждого типа метаданных
import CategoriesManager from '../components/metadata/CategoriesManager';
import FeedbackTypesManager from '../components/metadata/FeedbackTypesManager';
import TagsManager from '../components/metadata/TagsManager';

function MetadataManager() {
  const [activeTab, setActiveTab] = useState('categories');
  const { isLoading, error } = useMetadata();

  const getTabClass = (tabName) => {
    return `px-4 py-2 font-medium text-sm rounded-md ${
      activeTab === tabName 
        ? 'bg-violet-500 text-white' 
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (error) {
      return <ErrorMessage message={error} />;
    }

    switch (activeTab) {
      case 'categories':
        return <CategoriesManager />;
      case 'feedbackTypes':
        return <FeedbackTypesManager />;
      case 'tags':
        return <TagsManager />;
      default:
        return <CategoriesManager />;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-5">
        Управление метаданными
      </h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Навигация по вкладкам */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <nav className="flex space-x-4" aria-label="Tabs">
            <button
              className={getTabClass('categories')}
              onClick={() => setActiveTab('categories')}
            >
              Категории
            </button>
            <button
              className={getTabClass('feedbackTypes')}
              onClick={() => setActiveTab('feedbackTypes')}
            >
              Типы фидбека
            </button>
            <button
              className={getTabClass('tags')}
              onClick={() => setActiveTab('tags')}
            >
              Теги
            </button>
          </nav>
        </div>
        
        {/* Содержимое активной вкладки */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default MetadataManager;