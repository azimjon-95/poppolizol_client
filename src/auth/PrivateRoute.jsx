// PrivateRoute.js - Enhanced private route component
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, role: userRole } = useSelector((state) => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !userRole) {
    return <Navigate to="/login" replace />;
  }

  // If specific role is required and user doesn't have it, redirect to login
  if (role && Array.isArray(role) && !role.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  if (role && typeof role === 'string' && role !== userRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
