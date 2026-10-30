import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage text="Checking authentication..." />;
  }

  if (!isAuthenticated || !user) {
    // Determine fallback login path based on target path or default to landing
    let redirectPath = '/';
    if (location.pathname.startsWith('/admin')) {
      redirectPath = '/admin/login';
    } else if (location.pathname.startsWith('/teacher')) {
      redirectPath = '/teacher/login';
    } else if (location.pathname.startsWith('/student')) {
      redirectPath = '/student/login';
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate dashboard based on their actual role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
