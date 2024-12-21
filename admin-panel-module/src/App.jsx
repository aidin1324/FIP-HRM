import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Layout from './pages/Layout';
import Register from './pages/Register';

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
    <Routes>
      {/* Маршрут для логина */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Вложенный маршрут для Layout */}
      <Route path="/" element={<Layout />}>
        {/* Profile будет отображаться внутри Layout */}
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
      </Route>
    </Routes>
    </>
  );
}

export default App;
