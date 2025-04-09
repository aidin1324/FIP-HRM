import React, { useState, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/DropdownProfile';

const DropdownPlaceholder = () => (
  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse"></div>
);

const Header = memo(function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {

  const headerClasses = useMemo(() => {
    const baseClasses = "sticky top-0 before:absolute before:inset-0 before:backdrop-blur-md max-lg:before:bg-white/90 dark:max-lg:before:bg-gray-800/90 before:-z-10 z-30";
    
    let variantClasses = '';
    if (variant === 'v2' || variant === 'v3') {
      variantClasses = 'before:bg-white after:absolute after:h-px after:inset-x-0 after:top-full after:bg-gray-200 dark:after:bg-gray-700/60 after:-z-10';
    } else {
      variantClasses = 'max-lg:shadow-sm lg:before:bg-gray-100/90 dark:lg:before:bg-gray-900/90';
    }
    
    const darkClasses = variant === 'v2' 
      ? 'dark:before:bg-gray-800' 
      : variant === 'v3' 
        ? 'dark:before:bg-gray-900' 
        : '';
        
    return `${baseClasses} ${variantClasses} ${darkClasses}`;
  }, [variant]);
  
  const innerDivClasses = useMemo(() => {
    return variant === 'v2' || variant === 'v3' 
      ? 'flex items-center justify-between h-16' 
      : 'flex items-center justify-between h-16 lg:border-b border-gray-200 dark:border-gray-700/60';
  }, [variant]);

  const handleSidebarToggle = useCallback((e) => { 
    e.stopPropagation(); 
    setSidebarOpen(!sidebarOpen); 
  }, [sidebarOpen, setSidebarOpen]);

  return (
    <header className={headerClasses}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className={innerDivClasses}>
          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={handleSidebarToggle}
            >
              <span className="sr-only">Open sidebar</span>
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="5" width="16" height="2" />
                <rect x="4" y="11" width="16" height="2" />
                <rect x="4" y="17" width="16" height="2" />
              </svg>
            </button>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {/*  Divider */}
            <hr className="w-px h-6 bg-gray-200 dark:bg-gray-700/60 border-none" />
            <UserMenu align="right" />
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;