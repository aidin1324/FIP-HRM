import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
            Произошла ошибка при загрузке компонента
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {this.state.error?.message || "Неизвестная ошибка"}
          </p>
          <button
            className="px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Перезагрузить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;