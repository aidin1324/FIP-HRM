import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
              <PrivateRoute role={["admin", "manager"]}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/users" element={<Users />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/tests" element={<Testing />} />
          <Route path="/comments" element={<Comments />} />{" "}
          <Route path="/requests" element={<Requests />} />{" "}
          <Route path="/contacts" element={<Contacts />} />{" "}
          <Route path="/404" element={<PageNotFound />} />
          {/* <Route path="unauthorized" element={<Unauthorized />} /> */}
        </Route>
      </Routes>
    </FilterProvider>
  );
}

export default App;
