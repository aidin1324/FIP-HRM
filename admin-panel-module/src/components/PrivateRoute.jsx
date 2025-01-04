// src/components/PrivateRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children, roles }) => {
  const { auth, loading } = useContext(AuthContext);

  // If authentication is still loading, render nothing or a spinner
  if (loading) {
    return <Loading />; // You can replace this with a loader component if desired
    // Example: return <Spinner />;
  }

  console.log('Current access_token:', auth.access_token);

  if (!auth.access_token) {
    // User is not authenticated
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRoles = auth.user?.roles || [];
    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      // User does not have the required role
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default PrivateRoute;