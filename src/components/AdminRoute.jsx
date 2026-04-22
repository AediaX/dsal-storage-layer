// components/AdminRoute.jsx
import React from "react";
import ProtectedRoute from "../auth/ProtectedRoute";

/**
 * Admin Route Component
 * Specifically for admin-only routes
 */
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute requiredRole="admin">
      {children}
    </ProtectedRoute>
  );
};

export default AdminRoute;