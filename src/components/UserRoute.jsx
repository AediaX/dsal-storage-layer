// components/UserRoute.jsx
import React from "react";
import ProtectedRoute from "../auth/ProtectedRoute";

/**
 * User Route Component
 * For authenticated users (both admin and regular users can access if not admin-only)
 */
const UserRoute = ({ children, requireUserOnly = false }) => {
  return (
    <ProtectedRoute requiredRole={requireUserOnly ? "user" : null}>
      {children}
    </ProtectedRoute>
  );
};

export default UserRoute;