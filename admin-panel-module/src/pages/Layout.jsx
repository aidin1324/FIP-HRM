import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const preloadImportantRoutes = () => {
      import('../pages/MyProfile');

      if (auth?.user?.roles?.includes('admin') || auth?.user?.roles?.includes('manager')) {
        import('../pages/Dashboard');
        import('../pages/Users');
      }
    };

    const timer = setTimeout(preloadImportantRoutes, 2000);
    return () => clearTimeout(timer);
  }, [auth]); 

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;