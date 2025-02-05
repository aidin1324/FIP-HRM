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
import PrivateRoute from './components/PrivateRoute';
import Users from './pages/Users';
import Unauthorized from './pages/Unauthorized';
import Comments from './pages/Comments'; 
import Requests from './pages/Requests';
<<<<<<< HEAD
import Contacts from './pages/Contacts';
import Testing from './pages/Testing';
=======
import AfterRegister from './pages/AfterRegister';
import Contact from './pages/Contact';
>>>>>>> 28476d3 (changes, related with back, list of contact)

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
      <Route path="/after-register" element={<AfterRegister />} />
      {/* Вложенный маршрут для Layout */}
      <Route path="/" element={<Layout />}>
        {/* Profile будет отображаться внутри Layout */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute role={['admin', 'manager']}>
              <Dashboard />
            </PrivateRoute>
            } 
        />
        <Route path="/users" element={<Users />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/profile/:id" element={<Profile />} />
<<<<<<< HEAD
        <Route path="/comments" element={<Comments />} /> 
        <Route path="/requests" element={<Requests />} /> 
        <Route path="/contacts" element={<Contacts />} />
        <Route path='/tests' element={<Testing />} />
=======
        <Route path="/comments" element={<Comments />} /> {/* Добавлен маршрут для Comments */}
        <Route path="/requests" element={<Requests />} /> {/* Добавлен маршрут для Requests */}
        <Route path="/contacts" element={<Contact />} /> {/* Добавлен маршрут для Contact */}
>>>>>>> 28476d3 (changes, related with back, list of contact)
        {/* <Route path="unauthorized" element={<Unauthorized />} /> */}
      </Route>
    </Routes>
    </>
  );
}

export default App;