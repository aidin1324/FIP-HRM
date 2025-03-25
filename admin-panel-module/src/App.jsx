import React, { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { FilterProvider } from "./contexts/FilterContext";

import "./css/style.css";

import "./charts/ChartjsConfig";

// Import pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Layout from "./pages/Layout";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";
import Users from "./pages/Users";
import Unauthorized from "./pages/Unauthorized";
import Comments from "./pages/Comments";
import Requests from "./pages/Requests";
import Testing from "./pages/Testing";
import AfterRegister from "./pages/AfterRegister";
import Contacts from "./pages/Contacts";
import PageNotFound from "./pages/404";
import MyProfile from "./pages/MyProfile";

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]); 

  return (
    <FilterProvider>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/after-register" element={<AfterRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<PageNotFound />} />
        
        {/* Вложенные защищенные маршруты */}
        <Route path="/" element={<Layout />}>
          {/* Редирект с главной */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Маршруты только для админов и менеджеров */}
          <Route path="/dashboard" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/users" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Users />
            </PrivateRoute>
          } />
          
          <Route path="/comments" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Comments />
            </PrivateRoute>
          } />
          
          <Route path="/requests" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Requests />
            </PrivateRoute>
          } />
          
          <Route path="/contacts" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Contacts />
            </PrivateRoute>
          } />
          
          <Route path="/tests" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Testing />
            </PrivateRoute>
          } />
          
          {/* Просмотр профилей - только для админов и менеджеров */}
          <Route path="/profile/:id" element={
            <PrivateRoute role={["admin", "manager"]}>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Редирект с /profile на свой профиль */}
          <Route path="/profile" element={<Navigate to="/my-profile" replace />} />
          
          {/* Свой профиль - доступен всем авторизованным пользователям */}
          <Route path="/my-profile" element={
            <PrivateRoute>
              <MyProfile />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </FilterProvider>
  );
}

export default App;
