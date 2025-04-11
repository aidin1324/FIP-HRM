import React, { useEffect, Suspense } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FilterProvider } from "./contexts/FilterContext";
import { RoleProvider } from "./contexts/RoleContext";

import "./css/style.css";
import "./charts/ChartjsConfig";

import Layout from "./pages/Layout";
import PrivateRoute from "./components/PrivateRoute";
import LoadingFallback from "./components/LoadingFallback";
import ErrorBoundary from "./components/ErrorBoundary";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Login = React.lazy(() => import("./pages/Login"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Register = React.lazy(() => import("./pages/Register"));
const Users = React.lazy(() => import("./pages/Users"));
const Unauthorized = React.lazy(() => import("./pages/Unauthorized"));
const Comments = React.lazy(() => import("./pages/Comments"));
import Requests from "./pages/Requests";
const AfterRegister = React.lazy(() => import("./pages/AfterRegister"));
const Contacts = React.lazy(() => import("./pages/Contacts"));
const PageNotFound = React.lazy(() => import("./pages/404"));
const MyProfile = React.lazy(() => import("./pages/MyProfile"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const ResetPasswordByToken = React.lazy(() => import("./pages/ResetPasswordByToken"));
const TelegramConfig = React.lazy(() => import("./pages/TelegramConfig"));

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector("html").style.scrollBehavior = "auto";
    window.scroll({ top: 0 });
    document.querySelector("html").style.scrollBehavior = "";
  }, [location.pathname]);

  return (
    <AuthProvider>
      <RoleProvider>
        <FilterProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/after-register" element={<AfterRegister />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<PageNotFound />} />

              {/* Маршруты для сброса пароля */}
              <Route path="/reset-password" element={<ResetPasswordByToken />} /> {/* Для сброса пароля по токену */}
              <Route path="/forgot-password" element={<ResetPassword />} /> {/* Для запроса сброса пароля */}
              
              {/* Защищенные маршруты внутри Layout */}
              <Route path="/" element={<Layout />}>
                {/* Редирект с главной на дашборд */}
              <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Маршруты для администраторов и менеджеров */}
              <Route path="dashboard" element={
                <PrivateRoute role={["admin", "manager"]}>
                  <Dashboard />
                </PrivateRoute>
              } />
              
                <Route path="users" element={
                  <PrivateRoute role={["admin", "manager"]}>
                    <Users />
                  </PrivateRoute>
                } />
                
                <Route path="comments" element={
                  <PrivateRoute role={["admin", "manager"]}>
                    <Comments />
                  </PrivateRoute>
                } />
                
                <Route path="requests" element={
                  <PrivateRoute role={["admin", "manager"]}>
                    <ErrorBoundary>
                      <Requests />
                    </ErrorBoundary>
                  </PrivateRoute>
                } />
                
                <Route path="contacts" element={
                  <PrivateRoute role={["admin", "manager"]}>
                    <Contacts />
                  </PrivateRoute>
                } />
                
                <Route path="settings/telegram" element={
                  <PrivateRoute role={["admin"]}>
                    <TelegramConfig />
                  </PrivateRoute>
                } />
                
                {/* Маршруты для всех авторизованных пользователей */}
                <Route path="profile/:id" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                
                <Route path="my-profile" element={
                  <PrivateRoute>
                    <MyProfile />
                  </PrivateRoute>
                } />
                
                {/* Обработка неизвестных маршрутов */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </FilterProvider>
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
